import { AccountType } from '../../types/accountTypes';
import {
  FormValuesType, PaymentStatusResponseType, GlobalPaymentRequest,
} from '../../types/globalPaymentApiTypes';
import { paymentTypesConfiguration } from './config';

export const patternTwoDigisAfterDot = /^\d+(\.\d{0,2})?$/;
export const today = new Date();
export const oneMonth = new Date(new Date(today).setDate(today.getDate() + 31))
  .toISOString()
  .split('T')[0];
export const capitalize = (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`;

export const updateSessionStorageTransactions = (transaction: PaymentStatusResponseType, storageId: string) => {
  const previousTransactions: PaymentStatusResponseType[] = JSON.parse(sessionStorage.getItem(storageId) || '[]') as PaymentStatusResponseType[];
  previousTransactions.push(transaction);
  sessionStorage.setItem(storageId, JSON.stringify(previousTransactions));
};


function generateGenericAPIBody (data: FormValuesType): GlobalPaymentRequest {
  const {
    date, amount, debtorAccount, creditorAccount, paymentType,
  } = data;
  const debtorAccountApi : AccountType = JSON.parse(debtorAccount) as AccountType;
  const creditorAccountApi : AccountType = JSON.parse(creditorAccount) as AccountType;
  return {
  payments: {
    requestedExecutionDate: new Date(date).toISOString().split('T')[0],
    paymentAmount: parseFloat(amount),
    paymentType: 'RTP',
    paymentIdentifiers: {
      endToEndId: `uf${Date.now()}`,
    },
    paymentCurrency: paymentTypesConfiguration[paymentType].currency,
    transferType: 'CREDIT',
    debtor: {
      debtorName: debtorAccountApi.accountName ? debtorAccountApi.accountName : '',
      debtorAccount: {
        accountId: debtorAccountApi.accountId,
        accountCurrency: debtorAccountApi.currency.code,
      },
    },
    debtorAgent: debtorAccountApi.agent,
    creditor: {
      creditorName: creditorAccountApi.accountName ? creditorAccountApi.accountName : '',
      creditorAccount: {
        accountId: creditorAccountApi.accountId,
        accountCurrency: creditorAccountApi.currency.code,
      },
    },
    creditorAgent: creditorAccountApi.agent

  },
}
}

export default function generateApiBody(data: FormValuesType) : GlobalPaymentRequest {
  const {
    paymentType,
  } = data;
  const defaultBody = generateGenericAPIBody(data);
  switch (paymentType) {
    case 'EU RTP (SEPA)':
      defaultBody.payments.debtor.debtorAccount.accountType = 'IBAN'
      return defaultBody;
    default:
      return defaultBody;
    }
}
