import type { AVSAccountDetails } from "./ValidationServicesTypes";

export const DEFAULT_ACCOUNT_NUMBERS: AVSAccountDetails[] = [
  {
    accountNumber: "1234559",
    financialInstitutionId: {
      clearingSystemId: {
        id: "021000021",
        idType: "ABA",
      },
    },
  },
  {
    accountNumber: "1233947",
    financialInstitutionId: {
      clearingSystemId: {
        id: "102000076",
        idType: "ABA",
      },
    },
  },
  {
    accountNumber: "12345",
    financialInstitutionId: {
      clearingSystemId: {
        id: "122199983",
        idType: "ABA",
      },
    },
  },
  {
    accountNumber: "61231234337",
    financialInstitutionId: {
      clearingSystemId: {
        id: "021000021",
        idType: "ABA",
      },
    },
  },
  {
    accountNumber: "999888777",
    financialInstitutionId: {
      clearingSystemId: {
        id: "021000021",
        idType: "ABA",
      },
    },
  },
];

export const VALIDATION_TYPE_OPTIONS = [
  { label: "Verify and authenticate account", value: "authentication" },
  { label: "Account Confidence Score", value: "acs" },
];

export type ValidationType = "authentication" | "acs";
