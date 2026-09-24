// Shared response handling for the feature submit functions: reject on a
// non-2xx status (or an empty body) instead of resolving with an error
// payload as if it were success data - the mistake that let failed FX/
// Transactions/Global Payments calls render as "Success" upstream.
export async function parseJsonResponse(res: Response, requestLabel: string) {
  const text = await res.text();
  if (!res.ok || !text) {
    throw new Error(
      `${requestLabel} failed (${res.status} ${res.statusText})${
        text ? `: ${text}` : ""
      }`,
    );
  }
  return JSON.parse(text);
}
