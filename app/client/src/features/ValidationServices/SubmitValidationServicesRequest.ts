import type { AVSAccountDetails } from "./ValidationServicesTypes";
import { getPdpAuthHeaders } from "../../utils/pdpAuthHeaders";
import { parseJsonResponse } from "../../utils/parseJsonResponse";

export const generateAVSRequestBody = (
  profileName: string,
  accountDetails: AVSAccountDetails,
) => {
  const requestBody = [
    {
      requestId: "UF" + new Date().getTime(),
      profileName: profileName,
      account: accountDetails,
    },
  ];
  return requestBody;
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
