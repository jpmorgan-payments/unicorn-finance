import type { AVSAccountDetails } from "./ValidationServicesTypes";
import { getPdpAuthHeaders } from "../../utils/pdpAuthHeaders";
import { parseJsonResponse } from "../../utils/parseJsonResponse";
import { Environment } from "../../context/EnvContext";

// JPMC Mock's own header values - confirmed by calling api-mock directly.
// These are the public sandbox routing constants from the Validation
// Services spec (x-client-id/x-program-id examples), not credentials: on
// Mock, x-program-id is what actually selects verify+authenticate
// (VERIAUTH) vs confidence score (VERIAUTHUS) - unlike CAT, where that's
// driven by the profileName body field below.
const MOCK_HEADERS_BY_PROFILE: Record<string, Record<string, string>> = {
  authentication: {
    "Content-Type": "application/json",
    "x-client-id": "CLIENTID",
    "x-program-id": "VERIAUTH",
    "x-program-id-type": "AVS",
  },
  acs: {
    "Content-Type": "application/json",
    "x-client-id": "CLIENTID",
    "x-program-id": "VERIAUTHUS",
    "x-program-id-type": "AVS",
  },
};

const getValidationHeaders = (
  environment: Environment,
  profileName: string,
  useEnvHeaders: boolean,
) => {
  if (environment === Environment.JPMC_MOCK) {
    return MOCK_HEADERS_BY_PROFILE[profileName] ?? MOCK_HEADERS_BY_PROFILE.acs;
  }
  return getPdpAuthHeaders(useEnvHeaders);
};

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
  environment: Environment,
  profileName: string,
  accountDetails: AVSAccountDetails,
  useEnvHeaders = true,
) => {
  return {
    endpoint: `${url}/api/tsapi/v2/validations/accounts`,
    method: "POST",
    headers: getValidationHeaders(environment, profileName, useEnvHeaders),
    body: generateAVSRequestBody(profileName, accountDetails),
  };
};

export async function submitValidationServicesRequest(
  url: string,
  {
    arg,
  }: {
    arg: {
      body: ReturnType<typeof generateAVSRequestBody>;
      environment: Environment;
      profileName: string;
    };
  },
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg.body),
    headers: getValidationHeaders(arg.environment, arg.profileName, true),
  });
  return parseJsonResponse(res, "Validation request");
}
