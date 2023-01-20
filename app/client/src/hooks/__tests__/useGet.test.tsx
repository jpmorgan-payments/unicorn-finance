/* eslint-disable no-console */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import nock from 'nock';
import { renderHook, waitFor } from '@testing-library/react';
import useGet from '../useGet';
import { config } from '../../config';

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
  bankStatus: [
    {
      clearingSystem: 'TCH',
      participantId: '071000288T1',
      participantName: 'BMO Harris Bank',
      status: 'COMPLETE',
    },
    {
      clearingSystem: 'TCH',
      participantId: '200000041T1',
      participantName: 'Bankers Bank Test3',
      status: 'INTERMITTENT',
    },
    {
      clearingSystem: 'TCH',
      participantId: '200000036T1',
      participantName: 'COCC Test Bank',
      status: 'OFFLINE',
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
describe('Test responses from server', () => {
  test('Successful response', async () => {
    queryClient.clear();

    nock('http://localhost:80')
      .get('/api/tsapi/v1/participants')
      .reply(200, successfulResponse);

    const { result } = renderHook(() => useGet(
      config.statusConfig.apiDetails[0].backendPath,
      config.statusConfig.apiDetails[0].cacheKey,
      config.statusConfig.apiDetails[0].refreshInterval,
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual(successfulResponse.bankStatus));
  });
  test('Error response', async () => {
    queryClient.clear();
    nock('http://localhost:80')
      .get('/api/tsapi/v1/participants')
      .reply(500, errorResponse);

    const { result } = renderHook(() => useGet(
      config.statusConfig.apiDetails[0].backendPath,
      config.statusConfig.apiDetails[0].cacheKey,
      config.statusConfig.apiDetails[0].refreshInterval,
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
  test('Empty response', async () => {
    queryClient.clear();
    nock('http://localhost:80')
      .get('/api/tsapi/v1/participants')
      .reply(200, { bankStatus: [] });

    const { result } = renderHook(() => useGet(
      config.statusConfig.apiDetails[0].backendPath,
      config.statusConfig.apiDetails[0].cacheKey,
      config.statusConfig.apiDetails[0].refreshInterval,
      false,
    ), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
