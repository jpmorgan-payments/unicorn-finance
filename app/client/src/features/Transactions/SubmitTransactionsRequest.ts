import { getPdpAuthHeaders } from "../../utils/pdpAuthHeaders";
import { parseJsonResponse } from "../../utils/parseJsonResponse";

// OBTS Transactions API path (retrieve side). Single constant so it's easy to
// confirm/point at the real CAT gateway later.
export const TRANSACTIONS_PATH = "/api/tsapi/v3/transactions";

export const generateTransactionsRequestData = (
  url: string,
  useEnvHeaders = true,
) => {
  return {
    endpoint: `${url}${TRANSACTIONS_PATH}`,
    method: "GET",
    headers: getPdpAuthHeaders(useEnvHeaders),
    body: null,
  };
};

export async function submitTransactionsRequest(url: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: getPdpAuthHeaders(),
  });
  return parseJsonResponse(res, "Transactions request");
}
