import type { AVSAccountDetails } from "./ValidationServicesTypes";
import { getPdpAuthHeaders } from "../../utils/pdpAuthHeaders";
import { parseJsonResponse } from "../../utils/parseJsonResponse";

export const generateAVSRequestBody = (
  profileName: string,
  accountDetails: AVSAccountDetails,
) => {
  const entry: { requestId: string; profileName?: string; account: AVSAccountDetails } = {
    requestId: "UF" + new Date().getTime(),
    account: accountDetails,
  };
  // Real PDP contract (per the spec's own "Account Validation Request
  // (Palo Alto Supplier)" example, which this app's example is modeled on):
  // Verify + Authenticate passes profileName: "authentication" in the body.
  // Account Confidence Score omits profileName entirely.
  if (profileName === "authentication") {
    entry.profileName = profileName;
  }
  return [entry];
};

export const generateAVSRequestData = (
  url: string,
  profileName: string,
  accountDetails: AVSAccountDetails,
  useEnvHeaders = true,
) => {
  return {
    endpoint: `${url}/api/tsapi/v2/validations/accounts`,
    method: "POST",
    headers: getPdpAuthHeaders(useEnvHeaders),
    body: generateAVSRequestBody(profileName, accountDetails),
  };
};

export async function submitValidationServicesRequest(
  url: string,
  { arg }: { arg: { body: ReturnType<typeof generateAVSRequestBody> } },
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg.body),
    headers: getPdpAuthHeaders(),
  });
  return parseJsonResponse(res, "Validation request");
}
