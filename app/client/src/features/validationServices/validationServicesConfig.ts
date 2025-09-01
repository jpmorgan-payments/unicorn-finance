import { AVSAccountDetails } from "./validationServicesTypes";

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
    accountNumber: "987654321",
    financialInstitutionId: {
      clearingSystemId: {
        id: "021000021",
        idType: "ABA",
      },
    },
  },
  {
    accountNumber: "555444333",
    financialInstitutionId: {
      clearingSystemId: {
        id: "021000021",
        idType: "ABA",
      },
    },
  },
  {
    accountNumber: "111222333",
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
