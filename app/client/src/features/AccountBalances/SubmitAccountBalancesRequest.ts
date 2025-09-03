export async function submitAccountBalancesRequest(url: string) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ relativeDateType: "CURRENT_DAY" }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.json();
}
