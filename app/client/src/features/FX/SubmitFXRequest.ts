import { getPdpAuthHeaders } from "../../utils/pdpAuthHeaders";
import { parseJsonResponse } from "../../utils/parseJsonResponse";

// FX Rate Sheet API path. Kept as a single constant: confirm the exact
// path/version with the API owners before pointing at the real CAT sandbox.
export const FX_RATE_SHEET_PATH = "/api/fxapi/v1/rate-sheets";

export const generateFXRequestBody = (accountId: string, currency: string) => {
  return {
    accountId,
    currency,
  };
};

export const generateFXRequestData = (
  url: string,
  accountId: string,
  currency: string,
  useEnvHeaders = true,
) => {
  return {
    endpoint: `${url}${FX_RATE_SHEET_PATH}`,
    method: "POST",
    headers: getPdpAuthHeaders(useEnvHeaders),
    body: generateFXRequestBody(accountId, currency),
  };
};

export async function submitFXRequest(
  url: string,
  {
    arg,
  }: {
    arg: {
      accountId: string;
      currency: string;
    };
  },
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(generateFXRequestBody(arg.accountId, arg.currency)),
    headers: getPdpAuthHeaders(),
  });
  return parseJsonResponse(res, "FX rate sheet request");
}
