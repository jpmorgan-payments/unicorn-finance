import { AccountType } from "../../types/accountTypes";
import {
  FormValuesType,
  PaymentStatusResponseType,
  GlobalPaymentRequest,
} from "../../types/globalPaymentApiTypes";
import { paymentTypesConfiguration } from "./config";

export const patternTwoDigisAfterDot = /^\d+(\.\d{0,2})?$/;
export const today = new Date();
export const oneMonth = new Date(new Date(today).setDate(today.getDate() + 31))
  .toISOString()
  .split("T")[0];
export const capitalize = (str: string) =>
  `${str[0].toUpperCase()}${str.slice(1)}`;

export const updateSessionStorageTransactions = (
  transaction: PaymentStatusResponseType,
  storageId: string
) => {
  const previousTransactions: PaymentStatusResponseType[] = JSON.parse(
    sessionStorage.getItem(storageId) || "[]"
  ) as PaymentStatusResponseType[];
  previousTransactions.push(transaction);
  sessionStorage.setItem(storageId, JSON.stringify(previousTransactions));
};

function generateGenericAPIBody(data: FormValuesType): GlobalPaymentRequest {
  const { date, amount, debtorAccount, creditorAccount, paymentType } = data;
  const debtorAccountApi: AccountType = JSON.parse(
    debtorAccount
  ) as AccountType;
  const creditorAccountApi: AccountType = JSON.parse(
    creditorAccount
  ) as AccountType;

  return {
    requestedExecutionDate: new Date(date).toISOString().split("T")[0],
    paymentIdentifiers: {
      endToEndId: `uf${Date.now()}`,
    },
    transferType: "CREDIT",
    value: {
      currency: paymentTypesConfiguration[paymentType].currency,
      amount: amount,
    },
    paymentType: "RTP",
    debtor: {
      name: debtorAccountApi.accountName ? debtorAccountApi.accountName : "",
      account: {
        accountNumber: debtorAccountApi.accountId,
        accountCurrency: debtorAccountApi.currency.code,
      },
    },
    debtorAgent: debtorAccountApi.agent,
    creditor: {
      name: creditorAccountApi.accountName
        ? creditorAccountApi.accountName
        : "",
      account: {
        accountNumber: creditorAccountApi.accountId,
        accountCurrency: creditorAccountApi.currency.code,
      },
    },
    creditorAgent: creditorAccountApi.agent,
  };
}

export default function generateApiBody(
  data: FormValuesType
): GlobalPaymentRequest {
  const { paymentType } = data;
  const defaultBody = generateGenericAPIBody(data);
  switch (paymentType) {
    case "EU RTP (SEPA)":
      defaultBody.debtor.account.accountType = "IBAN";
      return defaultBody;
    default:
      return defaultBody;
  }
}
