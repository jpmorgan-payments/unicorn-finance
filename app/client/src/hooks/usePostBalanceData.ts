import { useQuery } from "@tanstack/react-query";
import { BalanceDataType } from "../types/accountTypes";
import { Environment } from "../context/AppContext";

export const sendPost = async (path: string, body: string) => {
  const requestOptions: RequestInit = {
    method: "POST",
    body,
  };

  return fetch(path, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error code: " + response.status);
      }
      return response.json();
    })
    .then((data: BalanceDataType) => {
      if (data.errors) {
        const errors = data.errors.map(
          (item) => `${item.errorCode} - ${item.errorMsg}`,
        );
        throw new Error(
          `There has been a problem with your fetch operation: ${JSON.stringify(errors)}`,
        );
      }
      return data.accountList;
    })
    .catch((error: Error) => {
      throw new Error(error.message);
    });
};

export default function usePostBalanceData(
  path: string,
  id: string,
  intervalMs: number,
  body: string,
  currentEnvironment: Environment,
) {
  const options = {
    refetchInterval: intervalMs,
    retry: 0,
    staleTime: intervalMs,
    enabled: currentEnvironment !== Environment.MOCKED,
  };
  return useQuery({
    queryKey: [id + "-" + currentEnvironment],
    queryFn: () => sendPost(path, body),
    ...options,
  });
}
