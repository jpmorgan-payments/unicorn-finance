import { useQuery } from "@tanstack/react-query";

export const sendPost = async (path: string, body: string) => {
  const requestOptions: RequestInit = {
    method: "POST",
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
  const options = {
    refetchInterval: intervalMs,
    retry: 0,
    staleTime: intervalMs,
    enabled: !displayingMockedData,
  };
  return useQuery({
    queryKey: [id],
    queryFn: () => sendPost(path, body),
    ...options,
  });
}
