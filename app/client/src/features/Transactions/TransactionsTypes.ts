// Transactions API (OBTS "retrieve your payments" side) - the query companion
// to Global Payments' "initiate". GET returns the recent transactions for an
// account so you can retrieve and reconcile what you've sent/received.

export type Transaction = {
  transactionId: string;
  bookingDate: string;
  amount: number;
  currency: string;
  creditDebitIndicator: "CREDIT" | "DEBIT";
  counterparty: string;
  status: string;
};

export type TransactionsResponse = {
  transactions: Transaction[];
};
