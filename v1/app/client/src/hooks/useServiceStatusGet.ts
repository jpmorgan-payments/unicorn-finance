import { useQuery } from '@tanstack/react-query';
import { ServiceStatusDataType } from '../types/serviceStatusTypes';
import { Environment } from '../context/AppContext';
import { gatherPath } from '../components/utils';
import { ApiDetailsInterface } from '../config';

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
  useServiceStatusGet(config: ApiDetailsInterface, id: string, intervalMs: number, currentEnvironment: Environment) {

  return useQuery([id + '-' + currentEnvironment], () => sendGet(gatherPath(currentEnvironment, config)), {
    refetchInterval: intervalMs,
    retry: 0,
    staleTime: intervalMs,
    enabled: currentEnvironment !== Environment.MOCKED,
  });
}
