import { describe, expect, it } from "vitest";
import { selectFXRates } from "./handlers";
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
