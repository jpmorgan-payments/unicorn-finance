import { useQuery } from '@tanstack/react-query';

export const sendPost = async (path:string, body:string) => {
  const requestOptions: RequestInit = {
    method: 'POST',
    body,
  };
  const response = await fetch(path, requestOptions);
  return response.json();
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