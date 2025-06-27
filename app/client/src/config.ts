type AccountsType = string[];
export const accounts: AccountsType = [
  "000000010975001",
  "000000011008182",
  "000000010975514",
  "000000010900009",
];
interface AccountsConfigInterface {
  accountsConfig: {
    apiDetails: ApiDetailsInterface[];
    accountDetails: AccountsType;
  };
}

export interface PaymentConfigInterface {
  paymentConfig: {
    mockedSessionStorageKey: string;
    sessionStorageKey: string;
    apiDetails: ApiDetailsInterface[];
  };
}
export interface ApiDetailsInterface {
  name: string;
  backendPath: string;
  cacheKey: string;
  path: string;
  refreshInterval: number;
  description: string;
  body?: {
    accountList: {
      accountId: string;
    }[];
  };
}
interface ConfigDataInterface
  extends AccountsConfigInterface,
    PaymentConfigInterface {}

export const config: ConfigDataInterface = {
  accountsConfig: {
    accountDetails: accounts,
    apiDetails: [
      {
        name: "Balances",
        backendPath: "/api/accessapi/balance",
        path: "https://apigatewaycat.jpmorgan.com/accessapi/balance",
        description:
          "The Account Balances API allows you to retrieve current and historical account balance information. We use it to get the current day balance for CAT accounts.",
        cacheKey: "balances",
        refreshInterval: 43200000,
        get body() {
          return {
            accountList: accounts.map((account) => ({ accountId: account })),
          };
        },
      },
      {
        name: "Transactions",
        path: "https://apigatewaycat.jpmorgan.com/tsapi/v2/transactions?relativeDateType=CURRENT_DAY",
        description:
          "This API returns all the transactions for a specific account for a specific time period.",
        backendPath: `/api/tsapi/v3/transactions?relativeDateType=CURRENT_DAY&accountIds=${accounts.toString()}`,
        cacheKey: "transactions",
        refreshInterval: 1800000,
      },
    ],
  },
  paymentConfig: {
    mockedSessionStorageKey: "mockedPreviousTransactions",
    sessionStorageKey: "previousTransactions",
    apiDetails: [
      {
        name: "Global Payments",
        backendPath: "/api/digitalSignature/payment/v2/payments",
        cacheKey: "globalPayments",
        path: "https://api-sandbox.payments.jpmorgan.com/payment/v2/payments",
        refreshInterval: 1800000,
        description:
          "The Global Payments API offers our clients a unified experience for which multiple payment types can be initiated through a single API." +
          "Clients are able to access the complete payments life cycle where functions include transaction initiation, status tracking, and payment status callback.",
      },
      {
        name: "Global Payments Status",
        backendPath: "/api/digitalSignature/payment/v2/payments/<endToEndId>",
        cacheKey: "globalPaymentsStatus",
        path: "https://api-sandbox.payments.jpmorgan.com/payment/v2/payments",
        refreshInterval: 1800000,
        description:
          "The Global Payments API offers our clients a unified experience for which multiple payment types can be initiated through a single API." +
          "Clients are able to access the complete payments life cycle where functions include transaction initiation, status tracking, and payment status callback.",
      },
    ],
  },
};
