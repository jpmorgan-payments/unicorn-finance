import { HttpResponse, http } from "msw";
import accountBalanceMockedResponse from "./mockedJson/AccountBalances.json";
import validationServicesACSResponse from "./mockedJson/ValidationServicesACS.json";
import validationServicesAuthResponse from "./mockedJson/ValidationServicesAuth.json";
import globalPaymentsResponse from "./mockedJson/GlobalPayments.json";
import fxRateSheet from "./mockedJson/FXRateSheet.json";
import transactionsMock from "./mockedJson/Transactions.json";
const errorResponse = {
  errors: [
    {
      errorCode: "GCA-099",
      errorMsg: "System is Unavailable",
    },
  ],
};

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

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  http.post("/api/accessapi/balance", ({ request }) => {
    const url = new URL(request.url);
    const errorStatus = triggeredErrorStatus(url);
    if (errorStatus !== null) {
      return new HttpResponse(JSON.stringify(errorResponse), {
        status: errorStatus,
      });
    }
    return HttpResponse.json(accountBalanceMockedResponse, { status: 200 });
  }),
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
        return HttpResponse.json({ response }, { status: 200 });
      } else {
        return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
      }
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
    // Parse request body to get requestId
    let requestId = "default-request-id";
    let profile = "authentication";
    let response;
    const requestBody = (await request.json()) as any[];
    if (requestBody && requestBody.length > 0) {
      requestId = requestBody[0].requestId || "default-request-id";
      profile = requestBody[0].profileName || "authentication";
    }

    if (profile === "authentication") {
      response = validationServicesAuthResponse[
        Math.floor(Math.random() * validationServicesAuthResponse.length)
      ] as any;
    } else {
      response = validationServicesACSResponse[
        Math.floor(Math.random() * validationServicesACSResponse.length)
      ] as any;
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
  http.get("/api/tsapi/v3/transactions", ({ request }) => {
    const url = new URL(request.url);
    const errorStatus = triggeredErrorStatus(url);
    if (errorStatus !== null) {
      return new HttpResponse(JSON.stringify(errorResponse), {
        status: errorStatus,
      });
    }
    return HttpResponse.json(
      { transactions: transactionsMock },
      { status: 200 },
    );
  }),
];
