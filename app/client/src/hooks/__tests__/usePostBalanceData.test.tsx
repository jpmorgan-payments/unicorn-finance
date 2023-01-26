/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { config } from '../../config';
import usePostBalanceData from '../usePostBalanceData';
import accountBalanceMockedResponse from '../../mockedJson/uf-balances.json';

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

describe('Test responses from server for balances', () => {
  test('Successful response', async () => {
    queryClient.clear();

    const { result } = renderHook(() => usePostBalanceData(
      `${HOSTNAME}${config.accountsConfig.apiDetails[0].backendPath}?statusCode=200`,
      config.accountsConfig.apiDetails[0].cacheKey,
      config.accountsConfig.apiDetails[0].refreshInterval,
      JSON.stringify(config.accountsConfig.apiDetails[0].body),
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual(accountBalanceMockedResponse));
  });
  test('Error response', async () => {
    queryClient.clear();

    const { result } = renderHook(() => usePostBalanceData(
      `${HOSTNAME}${config.accountsConfig.apiDetails[0].backendPath}?statusCode=500`,
      config.accountsConfig.apiDetails[0].cacheKey,
      config.accountsConfig.apiDetails[0].refreshInterval,
      JSON.stringify(config.accountsConfig.apiDetails[0].body),
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
