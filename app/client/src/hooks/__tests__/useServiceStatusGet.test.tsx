/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import useServiceStatusGet from '../useServiceStatusGet';
import { config } from '../../config';
import serviceStatusMockedResponse from '../../mockedJson/uf-service-status.json';

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

describe('Test responses from server for service status', () => {
  test('Successful response', async () => {
    queryClient.clear();

    const { result } = renderHook(() => useServiceStatusGet(
      `${HOSTNAME}${config.statusConfig.apiDetails[0].backendPath}?statusCode=200`,
      config.statusConfig.apiDetails[0].cacheKey,
      config.statusConfig.apiDetails[0].refreshInterval,
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toEqual(serviceStatusMockedResponse));
  });
  test('Error response', async () => {
    queryClient.clear();

    const { result } = renderHook(() => useServiceStatusGet(
      `${HOSTNAME}${config.statusConfig.apiDetails[0].backendPath}?statusCode=500`,
      config.statusConfig.apiDetails[0].cacheKey,
      config.statusConfig.apiDetails[0].refreshInterval,
      false,
    ), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
