import { useQuery } from "@tanstack/react-query";
import { PaymentsResponse } from "../types/globalPaymentApiTypes";

export const sendPostGlobalPaymentInit = async (path: string, body: string) => {
  const requestOptions: RequestInit = {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetch(path, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error code: " + response.status);
      }
      return response.json();
    })
    .then((data: PaymentsResponse) => {
      if (data.errors) {
        const errors = `${data.errors.endToEndId} - ${JSON.stringify(
          data.errors.errorDetails
        )}`;
        throw new Error(
          `There has been a problem with your fetch operation: ${JSON.stringify(
            errors
          )}`
        );
      }
      return data;
    })
    .catch((error: Error) => {
      if (error.message) {
        throw new Error(error.message);
      }
    });
};

export default function usePostGlobalPaymentInit(
  path: string,
  id: string,
  intervalMs: number,
  body: string,
  displayingMockedData: boolean
) {
  return useQuery([id], () => sendPostGlobalPaymentInit(path, body), {
    refetchInterval: intervalMs,
    retry: 0,
    staleTime: intervalMs,
    enabled: !displayingMockedData,
  });
}
