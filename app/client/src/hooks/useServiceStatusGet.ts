import { useQuery } from '@tanstack/react-query';
import { ServiceStatusDataType } from '../types/serviceStatusTypes';

const sendGet = async (path: string) => {
  const requestOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
  };

  return fetch(path, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error code: ' + response.status);
      }
      return response.json()
    }).then((data: ServiceStatusDataType) => {
      if (data.errors) {
        const errors = data.errors.map((item) => `${item.errorCode} - ${item.errorMsg}`);
        throw new Error(`There has been a problem with your fetch operation: ${JSON.stringify(errors)}`);
      }
      return data.bankStatus;
    })
    .catch((error: Error) => { throw new Error(error.message); });
};

export default function
  useServiceStatusGet(path: string, id: string, intervalMs: number, displayingMockedData: boolean) {
  return useQuery([id], () => sendGet(path), {
    refetchInterval: intervalMs,
    retry: 0,
    staleTime: intervalMs,
    enabled: !displayingMockedData,
  });
}
