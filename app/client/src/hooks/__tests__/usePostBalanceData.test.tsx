/* eslint-disable no-console */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import nock from 'nock';
import { renderHook, waitFor } from '@testing-library/react';
import { config } from '../../config';
import usePostBalanceData from '../usePostBalanceData';

const API_PATH = '/api/accessapi/balance';
const HOSTNAME = 'http://localhost:80';
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
  accountList: [
    {
      accountId: '000000010900009',
      accountName: 'TEST ACCOUNT NAME',
      branchId: '',
      bankId: '02100002',
      bankName: 'JPMORGAN CHASE',
      currency: {
        code: 'USD',
        currencySequence: 0,
        decimalLocation: 2,
        description: 'US DOLLAR',
      },
      balanceList: [
        {
          asOfDate: '2022-08-31',
          recordTimestamp: '2023-01-11T15:01:26Z',
          currentDay: true,
          openingAvailableAmount: 949452989.03,
          openingLedgerAmount: 949452989.03,
          endingAvailableAmount: 949445988.80,
          endingLedgerAmount: 949445988.80,
        },
      ],
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
describe('Test responses from server for balances', () => {
  test('Successful response', async () => {
    queryClient.clear();

    nock(HOSTNAME)
      .post(API_PATH, JSON.stringify(config.accountsConfig.apiDetails[0].body))
      .reply(200, successfulResponse);

    const { result } = renderHook(() => usePostBalanceData(
      config.accountsConfig.apiDetails[0].backendPath,
      config.accountsConfig.apiDetails[0].cacheKey,
      config.accountsConfig.apiDetails[0].refreshInterval,
      JSON.stringify(config.accountsConfig.apiDetails[0].body),
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual(successfulResponse.accountList));
  });
  test('Error response', async () => {
    queryClient.clear();
    nock(HOSTNAME)
      .post(API_PATH, JSON.stringify(config.accountsConfig.apiDetails[0].body))
      .reply(500, errorResponse);

    const { result } = renderHook(() => usePostBalanceData(
      config.accountsConfig.apiDetails[0].backendPath,
      config.accountsConfig.apiDetails[0].cacheKey,
      config.accountsConfig.apiDetails[0].refreshInterval,
      JSON.stringify(config.accountsConfig.apiDetails[0].body),
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
  test('Empty response', async () => {
    queryClient.clear();
    nock(HOSTNAME)
      .post(API_PATH, JSON.stringify(config.accountsConfig.apiDetails[0].body))
      .reply(200, { accountList: [] });

    const { result } = renderHook(() => usePostBalanceData(
      config.accountsConfig.apiDetails[0].backendPath,
      config.accountsConfig.apiDetails[0].cacheKey,
      config.accountsConfig.apiDetails[0].refreshInterval,
      JSON.stringify(config.accountsConfig.apiDetails[0].body),
      false,
    ), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
