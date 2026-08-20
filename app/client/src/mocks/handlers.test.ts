import { describe, expect, it } from "vitest";
import { selectFXRates, triggeredErrorStatus } from "./handlers";
import fxRateSheet from "./mockedJson/FXRateSheet.json";

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
