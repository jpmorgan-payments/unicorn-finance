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

interface StatusConfigInterface {
  statusConfig: {
    apiDetails: ApiDetailsInterface[];
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
  oAuthBackendPath: string;
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
    StatusConfigInterface,
    PaymentConfigInterface {}

export const config: ConfigDataInterface = {
  accountsConfig: {
    accountDetails: accounts,
    apiDetails: [
      {
        name: "Balances",
        backendPath: "/api/accessapi/balance",
        oAuthBackendPath: "/api/sandbox/accessapi/balance",
        path: "https://apigatewayqaf.jpmorgan.com/accessapi/balance",
        description:
          "This API returns intraday balances for specific accounts. We use it to get the current day balance for a UAT account.",
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
        path: "https://apigatewayqaf.jpmorgan.com/tsapi/v2/transactions?relativeDateType=CURRENT_DAY",
        description:
          "This API returns all the transactions for a specific account for a specific time period.",
        backendPath: `/api/tsapi/v3/transactions?relativeDateType=CURRENT_DAY&accountIds=${accounts.toString()}`,
        oAuthBackendPath: `/api/sandbox/tsapi/v3/transactions?relativeDateType=CURRENT_DAY&accountIds=${accounts.toString()}`,
        cacheKey: "transactions",
        refreshInterval: 1800000,
      },
    ],
  },
  statusConfig: {
    apiDetails: [
      {
        name: "Platform Availability Communication Manangement",
        backendPath: "/api/tsapi/v1/participants",
        oAuthBackendPath: "/api/tsapi/v1/participants",
        cacheKey: "serviceStatus",
        path: "https://apigatewayqaf.jpmorgan.com/tsapi/v1/participants",
        refreshInterval: 1800000,
        description:
          "This API returns a list of current outages within J.P. Morgan external APIs. If no outages are returned a message is displayed for the user.",
      },
    ],
  },
  paymentConfig: {
    mockedSessionStorageKey: "mockedPreviousTransactions",
    sessionStorageKey: "previousTransactions",
    apiDetails: [
      {
        name: "Global Payments",
        backendPath: "/api/digitalSignature/tsapi/v1/payments",
        oAuthBackendPath: "/api/sandbox/digitalSignature/tsapi/v1/payments",
        cacheKey: "globalPayments",
        path: "https://apigatewaycat.jpmorgan.com/tsapi/v1/payments",
        refreshInterval: 1800000,
        description:
          "The Global Payments API offers our clients a unified experience for which multiple payment types can be initiated through a single API." +
          "Clients are able to access the complete payments life cycle where functions include transaction initiation, status tracking, and payment status callback.",
      },
      {
        name: "Global Payments Status",
        backendPath: "/api/tsapi/v1/payments/status?endToEndId=<endToEndId>",
        oAuthBackendPath:
          "/api/sandbox/tsapi/v1/payments/status?endToEndId=<endToEndId>",
        cacheKey: "globalPaymentsStatus",
        path: "https://apigatewaycat.jpmorgan.com/tsapi/v1/payments/status",
        refreshInterval: 1800000,
        description:
          "The Global Payments API offers our clients a unified experience for which multiple payment types can be initiated through a single API." +
          "Clients are able to access the complete payments life cycle where functions include transaction initiation, status tracking, and payment status callback.",
      },
    ],
  },
};
