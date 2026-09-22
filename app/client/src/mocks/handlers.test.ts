import { describe, expect, it } from "vitest";
import {
  selectFXRates,
  triggeredErrorStatus,
  advancePaymentStatus,
  assignChaosScenario,
  selectValidationProgramResponse,
} from "./handlers";
import fxRateSheet from "./mockedJson/FXRateSheet.json";
import { MOCK_ONLY_VALIDATION_TYPES } from "../features/ValidationServices/ValidationServiceConfig";

const sheet = fxRateSheet as Array<{ baseCurrency: string }>;

describe("selectFXRates (FX Rate Sheet mock)", () => {
  it("returns only rows for the requested base currency", () => {
    const rows = selectFXRates(sheet, "EUR");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.baseCurrency === "EUR")).toBe(true);
  });

  it("falls back to the full sheet for an unknown base currency", () => {
    const rows = selectFXRates(sheet, "ZZZ");
    expect(rows.length).toBe(sheet.length);
  });

  it("exposes the FX Rate Sheet fields (matching the real taxonomy)", () => {
    const [first] = selectFXRates(sheet, "USD");
    expect(first).toHaveProperty("rateId");
    expect(first).toHaveProperty("counterCurrency");
    expect(first).toHaveProperty("rate");
    // Real API field name is misspelled "guarenteedRateInd" - keep it verbatim.
    expect(first).toHaveProperty("guarenteedRateInd");
    expect(first).toHaveProperty("minTranSize");
    expect(first).toHaveProperty("maxTranSize");
  });
});

const withTrigger = (value?: string) =>
  new URL(
    `https://unicorn.test/api/fxapi/v1/rate-sheets${
      value === undefined ? "" : `?statusCode=${value}`
    }`,
  );

describe("triggeredErrorStatus (?statusCode= error simulation)", () => {
  it("returns null when no trigger is present", () => {
    expect(triggeredErrorStatus(withTrigger())).toBeNull();
  });

  it("echoes the requested status rather than collapsing it to 500", () => {
    // Regression: every handler used to answer ?statusCode=401 with a 500,
    // which made the auth-failure path impossible to demo.
    expect(triggeredErrorStatus(withTrigger("401"))).toBe(401);
    expect(triggeredErrorStatus(withTrigger("500"))).toBe(500);
  });

  it("ignores statuses outside the simulatable set", () => {
    expect(triggeredErrorStatus(withTrigger("418"))).toBeNull();
    expect(triggeredErrorStatus(withTrigger("not-a-number"))).toBeNull();
    expect(triggeredErrorStatus(withTrigger(""))).toBeNull();
  });
});

describe("advancePaymentStatus (GPI status lifecycle + chaos scenarios)", () => {
  it("steps a plain payment through RECEIVED -> ACCEPTED -> PROCESSING -> COMPLETED and stays there", () => {
    const paymentId = "happy-path-payment";
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("RECEIVED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("ACCEPTED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("PROCESSING");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("COMPLETED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("COMPLETED");
  });

  it("still reaches COMPLETED for the operational hiccup scenario, via one extra transient step", () => {
    const paymentId = "operational-hiccup-payment";
    assignChaosScenario(paymentId, "operational");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("RECEIVED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("ACCEPTED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("PROCESSING");
    const hiccup = advancePaymentStatus(paymentId);
    expect(hiccup.paymentStatus).toBe("PROCESSING");
    expect(hiccup.paymentSubStatus).toBe("RETRYING_CLEARING_SUBMISSION");
    expect(hiccup.chaosHandled).toBe(true);
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("COMPLETED");
  });

  it("terminates in REJECTED/FUNDS_CONTROL_FAILED for the funds-control scenario and stays capped there", () => {
    const paymentId = "funds-control-payment";
    assignChaosScenario(paymentId, "funds-control");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("RECEIVED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("ACCEPTED");
    const rejected = advancePaymentStatus(paymentId);
    expect(rejected.paymentStatus).toBe("REJECTED");
    expect(rejected.paymentSubStatus).toBe("FUNDS_CONTROL_FAILED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("REJECTED");
  });

  it("terminates in REJECTED/FRAUD_HOLD for the fraud-hold scenario and stays capped there", () => {
    const paymentId = "fraud-hold-payment";
    assignChaosScenario(paymentId, "fraud-hold");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("RECEIVED");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("ACCEPTED");
    const rejected = advancePaymentStatus(paymentId);
    expect(rejected.paymentStatus).toBe("REJECTED");
    expect(rejected.paymentSubStatus).toBe("FRAUD_HOLD");
    expect(advancePaymentStatus(paymentId).paymentStatus).toBe("REJECTED");
  });
});

describe("selectValidationProgramResponse (Mock-only validation programs)", () => {
  it("has a Local Mock response for every Mock-only program the UI offers", () => {
    for (const { programId } of MOCK_ONLY_VALIDATION_TYPES) {
      expect(selectValidationProgramResponse(programId, "r1")).not.toBeNull();
    }
  });

  it("replays the codes api-mock returns for each program", () => {
    const codes = (programId: string) =>
      selectValidationProgramResponse(programId, "r1")?.responses.map((r) => [
        r.provider,
        ...Object.values(r.codes).map((c) => c.code),
      ]);
    expect(codes("VERIAUTHMULTI")).toEqual([
      ["JPMC_ACH", 1001],
      ["EWS", 6002],
    ]);
    expect(codes("VERIAUTHNONUS")).toEqual([["JPMC_LIINK_CONFIRM", 8904, 8904]]);
    expect(codes("PROGRAMID")).toEqual([["MICRODEPOSITS", 8906]]);
  });

  it("stamps each call's requestId without mutating the shared fixture", () => {
    const a = selectValidationProgramResponse("PROGRAMID", "first");
    const b = selectValidationProgramResponse("PROGRAMID", "second");
    expect(a?.requestId).toBe("first");
    expect(b?.requestId).toBe("second");
  });

  it("returns null for other programs so account-driven handling still applies", () => {
    expect(selectValidationProgramResponse("VERIAUTH", "r1")).toBeNull();
    expect(selectValidationProgramResponse("VERIAUTHUS", "r1")).toBeNull();
    expect(selectValidationProgramResponse(null, "r1")).toBeNull();
  });
});
