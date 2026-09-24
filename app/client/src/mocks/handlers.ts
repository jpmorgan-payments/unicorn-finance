import { HttpResponse, http } from "msw";
import { isChaosScenario, CHAOS_TRACKS, type ChaosScenario } from "./chaosScenarios";
import validationServicesACSResponse from "./mockedJson/ValidationServicesACS.json";
import validationServicesAuthResponse from "./mockedJson/ValidationServicesAuth.json";
import validationServicesProgramResponses from "./mockedJson/ValidationServicesPrograms.json";
import globalPaymentsResponse from "./mockedJson/GlobalPayments.json";
import fxRateSheet from "./mockedJson/FXRateSheet.json";
const errorResponse = {
  errors: [
    {
      errorCode: "GCA-099",
      errorMsg: "System is Unavailable",
    },
  ],
};

// Keyed by `${accountNumber}|${clearingSystemId.id}` - must match the account
// details in features/ValidationServices/ValidationServiceConfig.ts's
// EXAMPLE_ACCOUNTS. Index into ValidationServicesAuth.json / ValidationServicesACS.json.
const NAMED_VALIDATION_OUTCOMES: Record<string, { authIndex: number; acsIndex: number }> = {
  "4417|021000021": { authIndex: 0, acsIndex: 0 }, // "On file" - Ownership Match / GREEN
  "8825|121000248": { authIndex: 1, acsIndex: 1 }, // "Recent email" / "Today's invoice" - No Match / RED
};

/**
 * Replay of what api-mock returns for the Mock-only validation programs, which it
 * selects by the x-program-id header alone (the account you send is ignored).
 * Returns null for any other program id so the account-driven handling below
 * still applies. Pure + exported so it can be unit-tested.
 */
export type ValidationProgramResponse = {
  requestId: string;
  responses: Array<{
    provider: string;
    codes: Record<string, { code: number; message: string }>;
    details?: unknown;
  }>;
};

export function selectValidationProgramResponse(
  programId: string | null,
  requestId: string,
): ValidationProgramResponse | null {
  const canned = programId
    ? (
        validationServicesProgramResponses as unknown as Record<
          string,
          ValidationProgramResponse
        >
      )[programId]
    : undefined;
  return canned ? { ...canned, requestId } : null;
}

type FXRateRow = { baseCurrency: string; [key: string]: unknown };

/**
 * Pick the rate-sheet rows for a base currency, falling back to the full sheet
 * when the requested currency isn't in the mock data. Pure + exported so it can
 * be unit-tested without spinning up the mock server.
 */
export function selectFXRates(
  all: FXRateRow[],
  baseCurrency: string,
): FXRateRow[] {
  const matched = all.filter((row) => row.baseCurrency === baseCurrency);
  return matched.length > 0 ? matched : all;
}

/**
 * Error-simulation trigger shared by every handler: `?statusCode=<code>` makes
 * the mock return that status instead of its happy-path payload. Kept in one
 * place so a beat can't drift into answering 401 with a 500. Pure + exported so
 * it can be unit-tested without spinning up the mock server.
 */
export const SIMULATABLE_ERROR_STATUSES = [401, 403, 404, 500] as const;

export function triggeredErrorStatus(url: URL): number | null {
  const requested = Number(url.searchParams.get("statusCode"));
  return SIMULATABLE_ERROR_STATUSES.includes(
    requested as (typeof SIMULATABLE_ERROR_STATUSES)[number],
  )
    ? requested
    : null;
}

// GPI Payment Status Track and Trace "debug mode": each successive call for a
// given paymentId advances one step through the real status lifecycle
// (RECEIVED -> ACCEPTED -> PROCESSING -> COMPLETED), so a presenter can just
// click "Track" repeatedly during a demo to watch a payment move end to end.
//
// Chaos scenarios (selected at payment submission via `?chaos=<scenario>`)
// swap in a different step table for that paymentId: "operational" inserts a
// transient retry step that still resolves to COMPLETED, while
// "funds-control" / "fraud-hold" terminate in a REJECTED status instead.
type StatusStep = {
  paymentStatus: string;
  paymentSubStatus: string;
  gpi: { status: string; statusDescription: string };
  chaosHandled?: true;
};

// GPI code + description per paymentStatus. CHAOS_TRACKS (shared with the
// client's Debug-mode stage track) is the single source of truth for the
// sequence of stages per scenario - this just attaches the wire-format detail.
const GPI_BY_STATUS: Record<string, { status: string; statusDescription: string }> = {
  RECEIVED: { status: "ACTC", statusDescription: "AcceptedTechnicalValidation" },
  ACCEPTED: { status: "ACCP", statusDescription: "AcceptedCustomerProfile" },
  PROCESSING: { status: "ACSP", statusDescription: "AcceptedSettlementInProcess" },
  COMPLETED: { status: "ACSC", statusDescription: "AcceptedSettlementCompleted" },
  REJECTED: { status: "RJCT", statusDescription: "Rejected" },
};

const CHAOS_STEP_TABLES: Record<ChaosScenario, StatusStep[]> = Object.fromEntries(
  Object.entries(CHAOS_TRACKS).map(([scenario, stages]) => [
    scenario,
    stages.map((stage) => ({
      paymentStatus: stage.paymentStatus,
      paymentSubStatus: stage.paymentSubStatus,
      gpi: GPI_BY_STATUS[stage.paymentStatus],
      ...(stage.kind === "retry" ? { chaosHandled: true as const } : {}),
    })),
  ]),
) as Record<ChaosScenario, StatusStep[]>;

const paymentStatusProgress = new Map<string, number>();
const paymentChaosScenario = new Map<string, ChaosScenario>();

/**
 * Records which chaos scenario (if any) a paymentId was submitted with, so
 * `advancePaymentStatus` can pick the right step table. Exported so tests can
 * set it up directly without going through the HTTP handler.
 */
export function assignChaosScenario(paymentId: string, scenario: ChaosScenario) {
  paymentChaosScenario.set(paymentId, scenario);
}

/**
 * Pure + exported so it's unit-testable without spinning up the mock server.
 * Returns the payment's CURRENT step, then advances it for next time (capped
 * at the final step of whichever chaos scenario, if any, was selected for this
 * paymentId at submission time). Progress is keyed by paymentId and lives only
 * for the life of the mock session.
 */
export function advancePaymentStatus(paymentId: string) {
  const scenario = paymentChaosScenario.get(paymentId) ?? "none";
  const steps = CHAOS_STEP_TABLES[scenario];
  const step = paymentStatusProgress.get(paymentId) ?? 0;
  const nextStep = Math.min(step + 1, steps.length - 1);
  paymentStatusProgress.set(paymentId, nextStep);
  const now = new Date().toISOString();
  return {
    paymentId,
    valueDate: now.slice(0, 10),
    statusUpdatedAt: now,
    ...steps[step],
  };
}

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  http.post(
    "/api/digitalSignature/payment/v2/payments",
    async ({ request }) => {
      const url = new URL(request.url);
      const errorStatus = triggeredErrorStatus(url);
      if (errorStatus !== null) {
        return new HttpResponse(JSON.stringify(errorResponse), {
          status: errorStatus,
        });
      }

      // Parse request body to get requestId
      let endToEndId = "default-endToEnd-id";
      let response: { endToEndId?: string; paymentId?: string } | null = {};
      const requestBody = (await request.json()) as any;

      if (requestBody) {
        endToEndId = requestBody.paymentIdentifiers.endToEndId || "id";
      }

      if (response) {
        response.endToEndId = endToEndId || "default-endToEnd-id";
        response.paymentId = crypto.randomUUID();

        const chaos = url.searchParams.get("chaos");
        if (isChaosScenario(chaos) && chaos !== "none") {
          assignChaosScenario(response.paymentId, chaos);
        }

        return HttpResponse.json({ response }, { status: 200 });
      } else {
        return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
      }
    },
  ),
  // GET /payments/{paymentId}/status - GPI Payment Status Track and Trace.
  // Real API scopes this to RTP/PushToCard/Zelle/etc (most ACH and WIRES 404);
  // the mock always returns a status so the demo can show the concept.
  http.get(
    "/api/digitalSignature/payment/v2/payments/:paymentId/status",
    ({ request, params }) => {
      const url = new URL(request.url);
      const errorStatus = triggeredErrorStatus(url);
      if (errorStatus !== null) {
        return new HttpResponse(JSON.stringify(errorResponse), {
          status: errorStatus,
        });
      }
      return HttpResponse.json(
        advancePaymentStatus(String(params.paymentId)),
        { status: 200 },
      );
    },
  ),
  http.post("/api/tsapi/v2/validations/accounts", async ({ request }) => {
    const url = new URL(request.url);
    const errorStatus = triggeredErrorStatus(url);
    if (errorStatus !== null) {
      return new HttpResponse(JSON.stringify(errorResponse), {
        status: errorStatus,
      });
    }
    // Parse request body to get requestId. Real PDP contract: Verify +
    // Authenticate sends profileName ("verificationauth"); Account Confidence
    // Score omits it entirely (selected via the x-program-id header instead,
    // which this mock doesn't branch on) - so presence/absence of the field
    // is what actually distinguishes the two calls, not its value.
    let requestId = "default-request-id";
    let isAuthProfile = true;
    let response;
    const requestBody = (await request.json()) as any[];
    let account: { accountNumber?: string; financialInstitutionId?: { clearingSystemId?: { id?: string } } } | undefined;
    if (requestBody && requestBody.length > 0) {
      requestId = requestBody[0].requestId || "default-request-id";
      isAuthProfile = Boolean(requestBody[0].profileName);
      account = requestBody[0].account;
    }

    // The three named examples from the Payments Garage deck ("On file" /
    // "Recent email" / "Today's invoice") get a deterministic outcome instead
    // of a random one, so picking an example in the dropdown reliably shows
    // the result its label promises. Anything else keeps the random mock.
    const accountKey = account
      ? `${account.accountNumber}|${account.financialInstitutionId?.clearingSystemId?.id}`
      : "";
    const namedOutcome = NAMED_VALIDATION_OUTCOMES[accountKey];

    const programResponse = selectValidationProgramResponse(
      request.headers.get("x-program-id"),
      requestId,
    );
    if (programResponse) {
      return HttpResponse.json({ response: programResponse }, { status: 200 });
    }

    if (isAuthProfile) {
      response = (
        namedOutcome
          ? validationServicesAuthResponse[namedOutcome.authIndex]
          : validationServicesAuthResponse[
              Math.floor(Math.random() * validationServicesAuthResponse.length)
            ]
      ) as any;
    } else {
      response = (
        namedOutcome
          ? validationServicesACSResponse[namedOutcome.acsIndex]
          : validationServicesACSResponse[
              Math.floor(Math.random() * validationServicesACSResponse.length)
            ]
      ) as any;
    }

    if (response) {
      response.requestId = requestId || "default-request-id";
      return HttpResponse.json({ response }, { status: 200 });
    } else {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
  }),
  http.post("/api/fxapi/v1/rate-sheets", async ({ request }) => {
    const url = new URL(request.url);
    const errorStatus = triggeredErrorStatus(url);
    if (errorStatus !== null) {
      return new HttpResponse(JSON.stringify(errorResponse), {
        status: errorStatus,
      });
    }
    const body = (await request.json()) as {
      accountId?: string;
      currency?: string;
    };
    const base = body?.currency || "USD";
    const iso = new Date().toISOString();
    // Stamp a fresh effective date/time so the rate reads as "true right now".
    const data = selectFXRates(fxRateSheet as FXRateRow[], base).map((r) => ({
      ...r,
      effectiveDate: iso.slice(0, 10),
      effectiveTime: iso.slice(11, 19),
    }));
    return HttpResponse.json(
      {
        _metadata: {
          disclaimer: "Indicative rates for demonstration only - not tradable.",
          timestamp: iso,
        },
        data,
      },
      { status: 200 },
    );
  }),
];
