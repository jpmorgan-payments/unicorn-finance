import { describe, expect, it } from "vitest";
import {
  generateGlobalPaymentsRequestData,
  getGlobalPaymentsEndpoint,
} from "./SubmitGlobalPaymentsRequest";
import { Environment } from "../../context/EnvContext";
import type { AccountDetails, PartyDetails } from "./GlobalPaymentTypes";

const debtorDetails = {
  account: { accountNumber: "111", accountType: "CHECKING" },
  agent: { routingNumber: "021000021" },
} as unknown as AccountDetails;

const creditorDetails = {
  name: "Acme Co",
  account: { accountNumber: "222", accountType: "CHECKING" },
} as unknown as PartyDetails;

describe("getGlobalPaymentsEndpoint", () => {
  it("keeps the CAT digitalSignature path for JPMC CAT", () => {
    expect(getGlobalPaymentsEndpoint("/cat-api", Environment.JPMC_CAT)).toBe(
      "/cat-api/api/digitalSignature/payment/v2/payments",
    );
  });

  it("keeps the CAT digitalSignature path for Local Mock (regression guard)", () => {
    expect(getGlobalPaymentsEndpoint("", Environment.LOCAL_MOCK)).toBe(
      "/api/digitalSignature/payment/v2/payments",
    );
  });

  it("drops the digitalSignature wrapping for JPMC Mock", () => {
    expect(getGlobalPaymentsEndpoint("/mock-api", Environment.JPMC_MOCK)).toBe(
      "/mock-api/api/payment/v2/payments",
    );
  });
});

describe("generateGlobalPaymentsRequestData", () => {
  it("sends the same body on JPMC Mock as on CAT/Local (same contract, different path only)", () => {
    const mock = generateGlobalPaymentsRequestData(
      "/mock-api",
      Environment.JPMC_MOCK,
      "100",
      "RTP",
      debtorDetails,
      creditorDetails,
    );
    const cat = generateGlobalPaymentsRequestData(
      "/cat-api",
      Environment.JPMC_CAT,
      "100",
      "RTP",
      debtorDetails,
      creditorDetails,
    );

    expect(mock.endpoint).toBe("/mock-api/api/payment/v2/payments");
    expect(mock.endpoint).not.toContain("digitalSignature");
    expect(cat.endpoint).toBe("/cat-api/api/digitalSignature/payment/v2/payments");

    // Body shape (minus the timestamp-derived endToEndId) is identical.
    const { paymentIdentifiers: _mockIds, ...mockRest } = mock.body;
    const { paymentIdentifiers: _catIds, ...catRest } = cat.body;
    expect(mockRest).toEqual(catRest);
  });
});
