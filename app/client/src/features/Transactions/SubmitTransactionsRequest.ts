// OBTS Transactions API path (retrieve side). Single constant so it's easy to
// confirm/point at the real CAT gateway later.
export const TRANSACTIONS_PATH = "/api/tsapi/v3/transactions";

export const generateTransactionsRequestData = (
  url: string,
  useEnvHeaders = true,
) => {
  const headers = useEnvHeaders
    ? {
        "Content-Type": "application/json",
        "x-client-id": import.meta.env.VITE_CLIENT_ID,
        "x-program-id": import.meta.env.VITE_PROGRAM_ID,
        "x-program-id-type": import.meta.env.VITE_PROGRAM_ID_TYPE,
      }
    : {
        "Content-Type": "application/json",
        "x-client-id": "***",
        "x-program-id": "***",
        "x-program-id-type": "***",
      };

  return {
    endpoint: `${url}${TRANSACTIONS_PATH}`,
    method: "GET",
    headers,
    body: null,
  };
};

export async function submitTransactionsRequest(url: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": import.meta.env.VITE_CLIENT_ID,
      "x-program-id": import.meta.env.VITE_PROGRAM_ID,
      "x-program-id-type": import.meta.env.VITE_PROGRAM_ID_TYPE,
    },
  });
  return res.json();
}
