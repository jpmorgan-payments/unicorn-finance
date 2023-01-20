/* eslint-disable no-console */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import nock from 'nock';
import { renderHook, waitFor } from '@testing-library/react';
import { config } from '../../config';
import useTransactionGet from '../useTransactionGet';

const HOSTNAME = 'http://localhost:80';
const API_PATH = '/api/tsapi/v2/transactions?relativeDateType=CURRENT_DAY&accountIds=000000010975001,000000011008182,000000010975514,000000010900009';
const queryClient = new QueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    // ✅ no more errors on the console for tests
    error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
  },
});
const wrapper = ({ children }: { children:React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
const successfulResponse = {
  data: [
    {
      account: {
        accountId: '000000010975001',
        accountName: 'OFFICE 123 INC',
        bankId: '02100002',
        branchId: '',
        bankName: 'JPMORGAN CHASE BANK, N.A. - NEW YOR',
        currency: {
          code: 'USD',
          description: 'US DOLLAR',
          decimalLocation: 2,
          currencySequence: 0,
        },
        aba: '021000021',
      },
      asOfDateTime: '2023-01-18T15:00:12Z',
      valueDateTime: '2023-01-17T15:00:12Z',
      asOfDate: '2023-01-18',
      valueDate: '2023-01-17',
      recordTimestamp: '2022-09-30T15:00:12Z',
      lastUpdate: null,
      receivedTimestamp: '2022-09-30T15:00:12Z',
      productGroup: {
        groupCode: 'D/R',
        groupDescription: 'DEPOSIT AND REMITTANCE',
        wire: false,
      },
      debitCreditCode: 'CREDIT',
      baiType: {
        typeCode: '399',
        summaryTypeCode: '390',
        description: 'MISCELLANEOUS CREDIT',
        shortDescription: 'INDIV OTHER/MISC',
        groupCode: 'OTHER',
        groupDescription: 'OTHER',
        productGroupCode: 'MISC',
        btrsTypeCode: '399',
        germanTypeCode: '835',
        swiftTypeCode: 'MSC',
      },
      ddaTxnCode: '194',
      originalTransactionCode: null,
      fundsTypeCode: 'SAME',
      currency: {
        code: 'USD',
        description: 'US DOLLAR',
        decimalLocation: 2,
        currencySequence: 0,
      },
      amount: 3.0,
      immediateAvailable: 3.0,
      day1Available: 0.0,
      day2Available: 0.0,
      day2PlusAvailable: null,
      day3PlusAvailable: 0.0,
      bankReferenceSearchable: {
        standardValue: '1175392306PG',
        searchValue: '1175392306PG',
      },
      customerReferenceSearchable: {
        standardValue: '',
        searchValue: null,
      },
      wireReferenceSearchable: null,
      repairCode: '',
      reversal: false,
      override: false,
      transactionStatus: 'O',
      shortDescription: 'C6337025D00003C',
      wireType: 'EMPTY',
      checkNumber: 0,
      lockboxSequenceCode: '',
      lockboxItems: 0.0,
      lockboxNumber: '',
      lockboxDepositDate: null,
      lockboxDepositTime: null,
      narrativeText: {
        'YOUR REF    ': 'MISCELLANEOUS CREDIT',
        'REMARK      ': 'C6337025D00003C TCOINREDEMPTION C6337025D00003C',
        'VAL DATE    ': '08/01/2022',
      },
      narrativeTypeCode: 'T',
      addenda: null,
      floatSpreadCode: '3',
      sepaDetailsXml: null,
      postCode: 'I',
      supplementalTextSet: {},
      supplementalTextRecordList: null,
      supplementalText: null,
      thirdPartyBank: false,
      achBatchItems: null,
      sepaType: false,
      transactionId: 'TXN-C-779702312-7',
      loggedAt: '2022-09-30T11:00:12.722739',
    },
  ],
};
const errorResponse = {
  errors: [
    {
      errorCode: 'GCA-099',
      errorMsg: 'System is Unavailable',
    },
  ],
};
describe('Test responses from server for transactions', () => {
  test('Successful response', async () => {
    queryClient.clear();

    nock(HOSTNAME)
      .get(API_PATH)
      .reply(200, successfulResponse);

    const { result } = renderHook(() => useTransactionGet(
      config.accountsConfig.apiDetails[1].backendPath,
      config.accountsConfig.apiDetails[1].cacheKey,
      config.accountsConfig.apiDetails[1].refreshInterval,
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual(successfulResponse.data));
  });
  test('Error response', async () => {
    queryClient.clear();
    nock(HOSTNAME)
      .get(API_PATH)
      .reply(500, errorResponse);

    const { result } = renderHook(() => useTransactionGet(
      config.accountsConfig.apiDetails[1].backendPath,
      config.accountsConfig.apiDetails[1].cacheKey,
      config.accountsConfig.apiDetails[1].refreshInterval,
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
  test('Empty response', async () => {
    queryClient.clear();
    nock(HOSTNAME)
      .get(API_PATH)
      .reply(200, { data: [] });

    const { result } = renderHook(() => useTransactionGet(
      config.accountsConfig.apiDetails[1].backendPath,
      config.accountsConfig.apiDetails[1].cacheKey,
      config.accountsConfig.apiDetails[1].refreshInterval,
      false,
    ), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
