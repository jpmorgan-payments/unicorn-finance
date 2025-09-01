import { AccountDetails } from "./GlobalPaymentsTypes";

export const paymentTypes = [
  { label: "US Real-Time Payments", value: "US-RTP" },
];

export const accountDetails: AccountDetails[] = [
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
