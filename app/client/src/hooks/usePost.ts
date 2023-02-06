import { useQuery } from '@tanstack/react-query';
import { PaymentsResponse } from '../types/globalPaymentApiTypes';

export const sendPost = async (path: string, body: string) => {
  const requestOptions: RequestInit = {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  return fetch(path, requestOptions)
    .then((response) => response.json())
    .then((data: PaymentsResponse) => {
      if (data.errors) {
        const errors = `${data.errors.endToEndId} - ${JSON.stringify(data.errors.errorDetails)}`;
        throw new Error(`There has been a problem with your fetch operation: ${JSON.stringify(errors)}`);
      }
      return data;
    })
    .catch((error: Error) => { throw new Error(error.message); });
};



export default function usePost(
  path: string,
  id: string,
  intervalMs: number,
  body: string,
  displayingMockedData: boolean,
) {
  return useQuery([id], () => sendPost(path, body), {
    refetchInterval: intervalMs,
    retry: 0,
    staleTime: intervalMs,
    enabled: !displayingMockedData,
  });
}
