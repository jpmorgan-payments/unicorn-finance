import type { AVSAccountDetails } from "./ValidationServicesTypes";

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

export const VALIDATION_TYPE_OPTIONS = [
  { label: "Verify and authenticate account", value: "authentication" },
  { label: "Account Confidence Score", value: "acs" },
];

export type ValidationType = "authentication" | "acs";
