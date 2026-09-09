// Transactions API (OBTS "retrieve your payments" side) - the query companion
// to Global Payments' "initiate". GET returns the recent transactions for an
// account so you can retrieve and reconcile what you've sent/received.

export type Transaction = {
  transactionId: string;
  bookingDate: string;
  // JPM payment APIs commonly represent amounts as decimal strings for
  // precision (see the Global Payments request body); the Local Mock fixture
  // happens to use a number, but callers must not assume that holds for the
  // real JPMC Mock/CAT tiers.
  amount: number | string;
  currency: string;
  creditDebitIndicator: "CREDIT" | "DEBIT";
  counterparty: string;
  status: string;
};

export type TransactionsResponse = {
  transactions: Transaction[];
};
