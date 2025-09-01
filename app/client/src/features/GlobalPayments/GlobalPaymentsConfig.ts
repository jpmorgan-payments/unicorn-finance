import { AccountDetails } from "./GlobalPaymentsTypes";

export type PaymentType = "US-RTP" | "SEPA";

export const PAYMENT_TYPE_OPTIONS = [
  { label: "US Real-Time Payments", value: "US-RTP" },
  { label: "Single Euro Payments Area", value: "SEPA" },
];

export const DEFAULT_ACCOUNT_OPTIONS: AccountDetails[] = [
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
