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
      name: "UNICORN FINANCE - SAN JOSE",
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
      name: "PALO ALTO ROBOTICS LLC",
      account: {
        accountNumber: "000000010900042",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "121000248",
          idType: "USABA",
        },
      ],
    },
  },
  {
    account: {
      name: "RAPID AUDIO LLC",
      account: {
        accountNumber: "000000010900010",
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

// ACH specific accounts - US domestic only, same routing-number scheme as RTP
export const achAccountDetails: AccountDetails[] = [
  {
    account: {
      name: "CLEVELAND SUPPLY CO",
      account: {
        accountNumber: "000000010900101",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "041000124",
          idType: "USABA",
        },
      ],
    },
  },
  {
    account: {
      name: "CHICAGO LOGISTICS INC",
      account: {
        accountNumber: "000000010900102",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "071000013",
          idType: "USABA",
        },
      ],
    },
  },
  {
    account: {
      name: "AUSTIN MANUFACTURING LLC",
      account: {
        accountNumber: "000000010900103",
      },
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "111000025",
          idType: "USABA",
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
