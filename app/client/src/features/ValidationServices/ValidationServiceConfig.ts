import type { AVSAccountDetails } from "./ValidationServicesTypes";
import { Environment } from "../../context/EnvContext";

export type NamedExampleAccount = {
  label: string;
  expectedOutcome: string;
  account: AVSAccountDetails;
};

// Mirrors the "Before we send it... are we sure?" moment in the Payments
// Garage deck: same supplier name, three account records, only one actually
// matches. The mock (mocks/handlers.ts) keys off this exact
// accountNumber/routing pair to return a deterministic outcome instead of a
// random one, so picking an example here reliably shows its expected result.
export const EXAMPLE_ACCOUNTS: NamedExampleAccount[] = [
  {
    label: "On file",
    expectedOutcome: "Expect: Match · GREEN",
    account: {
      accountNumber: "4417",
      financialInstitutionId: {
        clearingSystemId: { id: "021000021", idType: "ABA" },
      },
    },
  },
  {
    label: "Recent email",
    expectedOutcome: "Expect: No Match · RED",
    account: {
      accountNumber: "8825",
      financialInstitutionId: {
        clearingSystemId: { id: "121000248", idType: "ABA" },
      },
    },
  },
  {
    label: "Today's invoice",
    expectedOutcome: "Expect: No Match · RED",
    account: {
      accountNumber: "8825",
      financialInstitutionId: {
        clearingSystemId: { id: "121000248", idType: "ABA" },
      },
    },
  },
];

// Account dropdown text: the example's name plus the exact account and bank
// identifier the request will carry, e.g.
//   "On file · Acct 4417 · ABA 021000021 — Expect: Match · GREEN"
// `showOutcome` adds the scripted result, which only Local Mock honours.
export const formatExampleAccountLabel = (
  { label, expectedOutcome, account }: NamedExampleAccount,
  showOutcome: boolean,
) => {
  const { clearingSystemId, postalAddress } = account.financialInstitutionId;
  const bank = `${clearingSystemId.idType} ${clearingSystemId.id}${
    postalAddress ? ` (${postalAddress.country})` : ""
  }`;
  return `${label} · Acct ${account.accountNumber} · ${bank}${
    showOutcome ? ` — ${expectedOutcome}` : ""
  }`;
};

export const VALIDATION_TYPE_OPTIONS = [
  { label: "Verify and authenticate account", value: "authentication" },
  { label: "Account Confidence Score", value: "acs" },
];

// Mock environments only (Local Mock and JPMC Mock - CAT takes its program id
// from your onboarding). api-mock keys its reply by the x-program-id header, not
// by the account you send, so each program id below is a different capability of
// the API rather than a different answer for your data. Together with the two
// types above (VERIAUTH / VERIAUTHUS) they cover what Mock can return, and Local
// Mock replays the same responses (mocks/mockedJson/ValidationServicesPrograms.json).
// (SUREPAYVOP is left out: JPMC Mock currently answers it with a 500.)
export const MOCK_ONLY_VALIDATION_TYPES = [
  {
    label: "Multi-provider verify + authenticate - No Match",
    value: "multi-provider",
    programId: "VERIAUTHMULTI", // 1001 Open Valid, then 6002 Ownership No Match
  },
  {
    label: "Non-US account validation - Initiated",
    value: "non-us",
    programId: "VERIAUTHNONUS", // 8904 Initiated (JPMC_LIINK_CONFIRM)
  },
  {
    label: "Micro-deposit verification - Initiated",
    value: "micro-deposit",
    programId: "PROGRAMID", // 8906 Initiated (MICRODEPOSITS)
  },
] as const;

export type ValidationType =
  | "authentication"
  | "acs"
  | (typeof MOCK_ONLY_VALIDATION_TYPES)[number]["value"];

export const isMockOnlyValidationType = (value: string) =>
  MOCK_ONLY_VALIDATION_TYPES.some((t) => t.value === value);

export const getValidationTypeOptions = (environment: Environment) =>
  environment === Environment.LOCAL_MOCK ||
  environment === Environment.JPMC_MOCK
    ? [
        ...VALIDATION_TYPE_OPTIONS,
        ...MOCK_ONLY_VALIDATION_TYPES.map(({ label, value }) => ({
          label,
          value,
        })),
      ]
    : VALIDATION_TYPE_OPTIONS;

// Non-US validation is a different request shape (IBAN + SWIFT/BIC + country),
// so it gets its own example account instead of the US ABA ones above. Values
// are the Validation Services spec's own "Non US" example.
export const NON_US_EXAMPLE_ACCOUNTS: NamedExampleAccount[] = [
  {
    label: "Austria (IBAN)",
    expectedOutcome: "Expect: Initiated",
    account: {
      accountNumber: "12345",
      accountNumberType: "IBAN",
      financialInstitutionId: {
        clearingSystemId: { id: "PARBDEFFZZZ", idType: "SWIFT" },
        postalAddress: { country: "AT" },
      },
    },
  },
];
