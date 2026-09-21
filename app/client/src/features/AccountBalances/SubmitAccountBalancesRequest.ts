import { parseJsonResponse } from "../../utils/parseJsonResponse";

export async function submitAccountBalancesRequest(url: string) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ relativeDateType: "CURRENT_DAY" }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseJsonResponse(res, "Account balances request");
}
