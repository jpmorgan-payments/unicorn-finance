import { describe, expect, it } from "vitest";
import {
  generateAVSRequestBody,
  generateAVSRequestData,
} from "./SubmitValidationServicesRequest";
import {
  EXAMPLE_ACCOUNTS,
  formatExampleAccountLabel,
  getValidationTypeOptions,
  isMockOnlyValidationType,
  MOCK_ONLY_VALIDATION_TYPES,
  NON_US_EXAMPLE_ACCOUNTS,
  valueIfOffered,
  VALIDATION_TYPE_OPTIONS,
} from "./ValidationServiceConfig";
import { Environment } from "../../context/EnvContext";
import { getPdpAuthHeaders } from "../../utils/pdpAuthHeaders";
import type { AVSAccountDetails } from "./ValidationServicesTypes";

const account: AVSAccountDetails = {
  accountNumber: "4417",
  financialInstitutionId: {
    clearingSystemId: { id: "021000021", idType: "ABA" },
  },
};

const PROGRAM_IDS: Array<[string, string]> = [
  ["multi-provider", "VERIAUTHMULTI"],
  ["non-us", "VERIAUTHNONUS"],
  ["micro-deposit", "PROGRAMID"],
];

describe("generateAVSRequestData on JPMC Mock", () => {
  it.each([
    ["authentication", "VERIAUTH"],
    ["acs", "VERIAUTHUS"],
    ...PROGRAM_IDS,
  ])("maps %s to x-program-id %s", (type, programId) => {
    const { headers } = generateAVSRequestData(
      "/mock-api",
      Environment.JPMC_MOCK,
      type,
      account,
    );
    expect(headers["x-program-id"]).toBe(programId);
    expect(headers["x-client-id"]).toBe("CLIENTID");
  });
});

describe("generateAVSRequestData on Local Mock", () => {
  it.each(PROGRAM_IDS)(
    "sends the Mock program header for %s so MSW can replay it (%s)",
    (type, programId) => {
      const { headers } = generateAVSRequestData(
        "",
        Environment.LOCAL_MOCK,
        type,
        account,
      );
      expect(headers["x-program-id"]).toBe(programId);
    },
  );

  it.each(["authentication", "acs"])(
    "leaves %s on the env-driven headers (unchanged behaviour)",
    (type) => {
      const { headers } = generateAVSRequestData(
        "",
        Environment.LOCAL_MOCK,
        type,
        account,
      );
      expect(headers).toEqual(getPdpAuthHeaders(true));
    },
  );
});

describe("generateAVSRequestBody shapes (one per spec request example)", () => {
  it("authentication sends profileName 'authentication' and nothing else extra", () => {
    const [entry] = generateAVSRequestBody("authentication", account);
    expect(entry.profileName).toBe("authentication");
    expect(entry.transactions).toBeUndefined();
    expect(entry.entity).toBeUndefined();
  });

  it("acs sends no profileName", () => {
    const [entry] = generateAVSRequestBody("acs", account);
    expect(entry.profileName).toBeUndefined();
  });

  it("multi-provider: no profileName, empty transactions", () => {
    const [entry] = generateAVSRequestBody("multi-provider", account);
    expect(entry.profileName).toBeUndefined();
    expect(entry.transactions).toEqual([]);
  });

  it("micro-deposit: profileName verificationauth, empty transactions", () => {
    const [entry] = generateAVSRequestBody("micro-deposit", account);
    expect(entry.profileName).toBe("verificationauth");
    expect(entry.transactions).toEqual([]);
  });

  it("non-us: carries the IBAN/SWIFT account, an entity and empty transactions", () => {
    const [entry] = generateAVSRequestBody(
      "non-us",
      NON_US_EXAMPLE_ACCOUNTS[0].account,
    );
    expect(entry.profileName).toBeUndefined();
    expect(entry.account.accountNumberType).toBe("IBAN");
    expect(entry.account.financialInstitutionId.clearingSystemId.idType).toBe(
      "SWIFT",
    );
    expect(entry.account.financialInstitutionId.postalAddress?.country).toBe(
      "AT",
    );
    expect(entry.entity?.individual.fullName).toBeTruthy();
    expect(entry.transactions).toEqual([]);
  });
});

describe("getValidationTypeOptions", () => {
  const values = (env: Environment) =>
    getValidationTypeOptions(env).map((o) => o.value);

  it("offers every Mock-only type on both mocks and none on CAT", () => {
    for (const { value } of MOCK_ONLY_VALIDATION_TYPES) {
      expect(values(Environment.JPMC_MOCK)).toContain(value);
      expect(values(Environment.LOCAL_MOCK)).toContain(value);
      expect(values(Environment.JPMC_CAT)).not.toContain(value);
    }
  });

  it("keeps the two original options first and unchanged everywhere", () => {
    for (const env of Object.values(Environment)) {
      expect(getValidationTypeOptions(env).slice(0, 2)).toEqual(
        VALIDATION_TYPE_OPTIONS,
      );
    }
  });

  it("gives each Mock-only type its own program id", () => {
    const ids = MOCK_ONLY_VALIDATION_TYPES.map((t) => t.programId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("SUREPAYVOP"); // JPMC Mock answers it with a 500
  });

  it("isMockOnlyValidationType recognises exactly the Mock-only values", () => {
    expect(isMockOnlyValidationType("non-us")).toBe(true);
    expect(isMockOnlyValidationType("authentication")).toBe(false);
    expect(isMockOnlyValidationType("")).toBe(false);
  });
});

describe("dropdown labels", () => {
  it("type labels carry no 'Mock only' suffix (the options only exist on mocks anyway)", () => {
    for (const env of Object.values(Environment)) {
      for (const { label } of getValidationTypeOptions(env)) {
        expect(label).not.toMatch(/mock only/i);
      }
    }
  });

  it("account label shows the exact account and bank id that will be sent", () => {
    expect(formatExampleAccountLabel(EXAMPLE_ACCOUNTS[0], false)).toBe(
      "On file · Acct 4417 · ABA 021000021",
    );
  });

  it("appends the scripted outcome only when asked (Local Mock)", () => {
    expect(formatExampleAccountLabel(EXAMPLE_ACCOUNTS[0], true)).toBe(
      "On file · Acct 4417 · ABA 021000021 — Expect: Match · GREEN",
    );
    expect(formatExampleAccountLabel(EXAMPLE_ACCOUNTS[1], true)).toContain(
      "Expect: No Match · RED",
    );
  });

  it("names the SWIFT id and country for the non-US example", () => {
    expect(formatExampleAccountLabel(NON_US_EXAMPLE_ACCOUNTS[0], false)).toBe(
      "Austria (IBAN) · Acct 12345 · SWIFT PARBDEFFZZZ (AT)",
    );
  });
});

describe("valueIfOffered (regression: stale pick showed as raw JSON after switching to non-US)", () => {
  const usValue = JSON.stringify(EXAMPLE_ACCOUNTS[0].account);
  const nonUsOptions = NON_US_EXAMPLE_ACCOUNTS.map((e) => ({
    value: JSON.stringify(e.account),
  }));
  const usOptions = EXAMPLE_ACCOUNTS.map((e) => ({
    value: JSON.stringify(e.account),
  }));

  it("blanks a value the new option list does not offer", () => {
    expect(valueIfOffered(usValue, nonUsOptions)).toBe("");
  });

  it("keeps a value that is still offered", () => {
    expect(valueIfOffered(usValue, usOptions)).toBe(usValue);
  });

  it("passes an empty value through", () => {
    expect(valueIfOffered("", usOptions)).toBe("");
  });
});
