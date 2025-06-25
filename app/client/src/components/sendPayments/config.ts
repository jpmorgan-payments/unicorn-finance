import { AccountType } from "../../types/accountTypes";

/* eslint-disable import/prefer-default-export */
type PaymentTypeObject = {
  accounts: AccountType[];
  currency: "USD" | "EUR" | "GBP";
};
type MapLike = Record<string, PaymentTypeObject>;

const USRTPAccounts: AccountType[] = [
  {
    accountId: "000000010900009",
    accountName: "RAPID AUDIO LLC",
    bankId: "02100002",
    branchId: "",
    bankName: "JPMORGAN CHASE BANK, N.A. - NEW YOR",
    currency: {
      code: "USD",
      description: "US DOLLAR",
      decimalLocation: 2,
      currencySequence: 0,
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
    accountId: "000000010962009",
    accountName: "MORRIS ELECTRIC CONTRACTING LLC",
    bankId: "02100002",
    branchId: "",
    bankName: "JPMORGAN CHASE BANK, N.A. - NEW YOR",
    currency: {
      code: "USD",
      description: "US DOLLAR",
      decimalLocation: 2,
      currencySequence: 0,
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
    accountId: "000000010975001",
    accountName: "OFFICE 123 INC",
    bankId: "02100002",
    branchId: "",
    bankName: "JPMORGAN CHASE BANK, N.A. - NEW YOR",
    currency: {
      code: "USD",
      description: "US DOLLAR",
      decimalLocation: 2,
      currencySequence: 0,
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
const SEPARTPAccounts: AccountType[] = [
  {
    iban: "6231400596",
    accountName: "OBGLRTPCL1 Account",
    branchId: "",
    bankName: "",
    currency: {
      code: "EUR",
      description: "",
      decimalLocation: 2,
      currencySequence: 0,
    },
    accountId: "DE88501108006231400596",
    agent: {
      financialInstitutionIds: [
        {
          bic: "CHASDEFX",
        },
      ],
    },
  },
  {
    iban: "0041287103",

    accountName: "UNICORNUAT Account",
    branchId: "",
    bankName: "",
    currency: {
      code: "EUR",
      description: "",
      decimalLocation: 2,
      currencySequence: 0,
    },
    agent: {
      financialInstitutionIds: [
        {
          bic: "CHASDEFX",
        },
      ],
    },
    accountId: "DE45501108000041287103",
  },
  {
    accountId: "IE90CHAS93090379601529",
    accountName: "ACCT-0017960079601529-TITLE.1",
    branchId: "",
    bankName: "",
    currency: {
      code: "EUR",
      description: "",
      decimalLocation: 2,
      currencySequence: 0,
    },
    agent: {
      financialInstitutionIds: [
        {
          bic: "CHASIE4L",
        },
      ],
    },
    iban: "IE90CHAS93090379601529",
  },
  {
    iban: "0079607496",
    accountName: "ACCT-0017960079607496-TITLE.1",
    branchId: "",
    bankName: "",
    currency: {
      code: "EUR",
      description: "",
      decimalLocation: 2,
      currencySequence: 0,
    },
    agent: {
      financialInstitutionIds: [
        {
          bic: "CHASIE4L",
        },
      ],
    },
    accountId: "IE98CHAS93090379607496",
  },
];

const UKRTPAccounts: AccountType[] = [
  {
    accountId: "0040025916",
    accountName: "ACCT-0016710040025916-TITLE.1",
    branchId: "",
    bankName: "",
    currency: {
      code: "GBP",
      description: "",
      decimalLocation: 2,
      currencySequence: 0,
    },
    agent: {
      financialInstitutionIds: [
        {
          bic: "CHASGB2L",
        },
      ],
    },
  },
  {
    accountId: "0022610202",
    accountName: "ACCT-0016710022610202-TITLE.1",
    branchId: "",
    bankName: "",
    currency: {
      code: "EUR",
      description: "",
      decimalLocation: 2,
      currencySequence: 0,
    },
    agent: {
      financialInstitutionIds: [
        {
          id: "185008",
        },
      ],
    },
  },
];

export const paymentTypesConfiguration: MapLike = {
  "US RTP": {
    accounts: USRTPAccounts,
    currency: "USD",
  },
  "EU RTP (SEPA)": {
    accounts: SEPARTPAccounts,
    currency: "EUR",
  },
  "UK RTP": {
    accounts: UKRTPAccounts,
    currency: "GBP",
  },
};
