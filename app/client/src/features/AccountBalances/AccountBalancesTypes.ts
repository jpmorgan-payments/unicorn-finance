export type AccountBalances = {
  accountList: Account[];
};

export type Account = {
  accountId: string;
  accountName: string;
  branchId: string;
  bankId: string;
  bankName: string;
  currency: {
    code: string;
    currencySequence: number;
    decimalLocation: number;
    description: string;
  };
  balanceList: {
    asOfDate: string;
    recordTimestamp: string;
    currentDay: boolean;
    openingAvailableAmount: number;
    openingLedgerAmount: number;
    endingAvailableAmount: number;
    endingLedgerAmount: number;
  }[];
  errors: Error;
};

export type Error = {
  errorCode: string;
  errorMsg: string;
};
