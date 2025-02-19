/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-nested-ternary */
import React from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { AppContext, Environment } from '../../context/AppContext';
import { PaymentStatusResponseType } from '../../types/globalPaymentApiTypes';
import previousMockedTransactionsUntyped from '../../mockedJson/uf-mocked-previous-payments.json';
import { config } from '../../config';
import APIDetails from '../api_details';
import { sendGet } from '../../hooks/useGet';
import Spinner from '../spinner';
import { gatherPath } from '../utils';

const headers: string[] = [
  'End To End Id',
  'Status',
  'Create date/time',
  'Exception',
];

type MockedTransactions = {
  payments: PaymentStatusResponseType[]
};
const previousMockedTransactions: MockedTransactions = previousMockedTransactionsUntyped as MockedTransactions;

function PreviousPaymentsGrid() {
  const {
    displayingApiData,
    setJsonDialogData,
    paymentIdentifiers,
    currentEnvironment
  } = React.useContext(AppContext);
  const { paymentConfig } = config;
  const queryClient = useQueryClient();

  const data = queryClient.getQueriesData(['globalPaymentStatus-' + currentEnvironment]);

  const previousPayments = useQueries({
    queries: paymentIdentifiers.filter((payment) => payment.environment === currentEnvironment).map((id) => ({
      queryKey: ['globalPaymentStatus-' + currentEnvironment, id.endToEndId],
      queryFn: () => sendGet(gatherPath(currentEnvironment, paymentConfig.apiDetails[1]).replace('<endToEndId>', id.endToEndId || '')),
      refetchInterval: 0,
      enabled: currentEnvironment !== Environment.MOCKED,
      staleTime: Infinity,
    })),
  });

  const previousPaymentsLoading = previousPayments.some((result) => result.isFetching);
  let mockedData: PaymentStatusResponseType[] = [];
  const mockedPreviousPaymentsSession: PaymentStatusResponseType[] = JSON.parse(
    sessionStorage.getItem(paymentConfig.mockedSessionStorageKey) || '[]',
  ) as PaymentStatusResponseType[];

  if (currentEnvironment === Environment.MOCKED) {
    mockedData = [...mockedPreviousPaymentsSession, ...previousMockedTransactions.payments];
  }

  const renderCells = (payment: PaymentStatusResponseType, endToEndId: string) => (
    <tr onClick={() => setJsonDialogData({ state: true, data: JSON.stringify(payment, undefined, 2) })} key={`paymentKey-${endToEndId}`}>
      <td className="border-b border-slate-100  p-4 pl-8 ">{endToEndId}</td>
      <td className="border-b border-slate-100  p-4 pl-8 ">{payment.paymentStatus?.status ? payment.paymentStatus.status : ''}</td>
      <td className="border-b border-slate-100  p-4 pl-8 ">{payment.paymentStatus?.createDateTime ? payment.paymentStatus?.createDateTime : ''}</td>
      <td className="border-b border-slate-100  p-4 pl-8 ">
        {payment.paymentStatus.exception ? `${payment.paymentStatus.exception[0].errorCode} ${payment.paymentStatus.exception[0].errorDescription ? `- ${payment.paymentStatus.exception[0].errorDescription}` : ''}` : ''}
      </td>
    </tr>
  );

  const renderMockedCells = () => mockedData.map((mock) => renderCells(mock, mock.identifiers.endToEndId));

  const renderTableCells = () => data.map((payment, key) => {
    if (payment && payment.length === 2 && payment[1] !== undefined) {
      const previousPayment = payment[1] as PaymentStatusResponseType;
      const endToEndId = payment[0][1] as string;
      return renderCells(previousPayment, endToEndId);
    }
    return <div key={`empty-div-${key}`} />;
  });

  const renderTable = () => (
    <table className="border-collapse table-layout text-md overflow-scroll w-full block lg:table" data-cy="previousPaymentsGrid">
      <thead>
        <tr>{headers.map((header) => <th className="border-b font-medium p-4 pl-8 pt-0 pb-3  text-left" key={header}>{header}</th>)}</tr>
      </thead>

      <tbody>
        {currentEnvironment === Environment.MOCKED ? renderMockedCells() : renderTableCells()}
      </tbody>
    </table>
  );

  const renderEmptyPrevious = () => (
    <p className="text-center text-xl mt-20">Send a payment to be able to track them here</p>
  );

  const refreshQueries = async () => {
    await queryClient.refetchQueries({ queryKey: ['globalPaymentStatus-' + currentEnvironment] });
  };

  return (
    <div className="h-full">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-medium">Track your payments</h2>
        <button type="button" onClick={() => refreshQueries()} className="float-right">
          <span className="material-icons text-md ">refresh</span>
        </button>
      </div>

      {displayingApiData
        ? <APIDetails details={paymentConfig.apiDetails[1]} absolute={false} />
        : currentEnvironment !== Environment.MOCKED && previousPaymentsLoading ? <Spinner text="Updating payment status data...." />
          : (currentEnvironment === Environment.MOCKED && mockedData.length === 0) || (currentEnvironment !== Environment.MOCKED && (!previousPayments || previousPayments.length === 0)) ? renderEmptyPrevious() : renderTable()}
    </div>
  );
}

export default PreviousPaymentsGrid;
