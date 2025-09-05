import type { AccountDetails } from "./GlobalPaymentTypes";

export type PaymentType = "RTP" | "ACH";

export const paymentTypes = [
  { label: "US Real-Time Payments", value: "RTP" },
  { label: "ACH Payment", value: "ACH" },
];

// US-RTP specific accounts
export const rtpAccountDetails: AccountDetails[] = [
  {
    account: {
      name: "RAPID AUDIO LLC",
      account: {
        accountNumber: "000000010900009",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "021000021",
          idType: "USABA",
        },
      ],
    },
  },
  {
    account: {
      name: "MORRIS ELECTRIC CONTRACTING LLC",
      account: {
        accountNumber: "000000010962009",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "021000021",
          idType: "USABA",
        },
      ],
    },
  },
  {
    account: {
      name: "OFFICE 123 INC",
      account: {
        accountNumber: "000000010975001",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "021000021",
          idType: "USABA",
        },
      ],
    },
  },
];

// ACH specific accounts
export const achAccountDetails: AccountDetails[] = [
  {
    account: {
      name: "EUROPEAN TECH SOLUTIONS",
      account: {
        accountNumber: "DE89370400440532013000",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "COBADEFF",
          idType: "BIC",
        },
      ],
    },
  },
  {
    account: {
      name: "AMSTERDAM TRADING BV",
      account: {
        accountNumber: "NL91ABNA0417164300",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "ABNANL2A",
          idType: "BIC",
        },
      ],
    },
  },
  {
    account: {
      name: "PARIS CONSULTING SARL",
      account: {
        accountNumber: "FR1420041010050500013M02606",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "BNPAFRPP",
          idType: "BIC",
        },
      ],
    },
  },
];

// Mapping payment types to their respective accounts
export const accountDetailsByPaymentType: Record<
  PaymentType,
  AccountDetails[]
> = {
  RTP: rtpAccountDetails,
  ACH: achAccountDetails,
};

// Helper function to get accounts for a specific payment type
export const getAccountDetailsForPaymentType = (
  paymentType: PaymentType,
): AccountDetails[] => {
  return accountDetailsByPaymentType[paymentType] || [];
};
