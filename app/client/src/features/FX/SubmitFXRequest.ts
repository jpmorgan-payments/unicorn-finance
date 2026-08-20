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
    endpoint: `${url}${FX_RATE_SHEET_PATH}`,
    method: "POST",
    headers,
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
    headers: {
      "Content-Type": "application/json",
      "x-client-id": import.meta.env.VITE_CLIENT_ID,
      "x-program-id": import.meta.env.VITE_PROGRAM_ID,
      "x-program-id-type": import.meta.env.VITE_PROGRAM_ID_TYPE,
    },
  });
  return res.json();
}
