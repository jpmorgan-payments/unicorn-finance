import type { AVSAccountDetails } from "./ValidationServicesTypes";
import { getPdpAuthHeaders } from "../../utils/pdpAuthHeaders";
import { parseJsonResponse } from "../../utils/parseJsonResponse";
import { Environment } from "../../context/EnvContext";
import { MOCK_ONLY_VALIDATION_TYPES } from "./ValidationServiceConfig";

// JPMC Mock's own header values - confirmed by calling api-mock directly.
// These are the public sandbox routing constants from the Validation
// Services spec (x-client-id/x-program-id examples), not credentials: on
// Mock, x-program-id is what actually selects verify+authenticate
// (VERIAUTH), confidence score (VERIAUTHUS) or one of the Mock-only programs in
// MOCK_ONLY_VALIDATION_TYPES - unlike CAT, where that's driven by the
// profileName body field below. Mock's reply is keyed by this header alone; it
// ignores the account you send. Local Mock (MSW) branches on the same header for
// the Mock-only programs so it replays the same responses offline.
const mockHeaders = (programId: string) => ({
  "Content-Type": "application/json",
  "x-client-id": "CLIENTID",
  "x-program-id": programId,
  "x-program-id-type": "AVS",
});

const MOCK_ONLY_HEADERS_BY_TYPE: Record<string, Record<string, string>> =
  Object.fromEntries(
    MOCK_ONLY_VALIDATION_TYPES.map((t) => [t.value, mockHeaders(t.programId)]),
  );

const MOCK_HEADERS_BY_PROFILE: Record<string, Record<string, string>> = {
  authentication: mockHeaders("VERIAUTH"),
  acs: mockHeaders("VERIAUTHUS"),
  ...MOCK_ONLY_HEADERS_BY_TYPE,
};

const getValidationHeaders = (
  environment: Environment,
  profileName: string,
  useEnvHeaders: boolean,
) => {
  if (environment === Environment.JPMC_MOCK) {
    return MOCK_HEADERS_BY_PROFILE[profileName] ?? MOCK_HEADERS_BY_PROFILE.acs;
  }
  if (environment === Environment.LOCAL_MOCK && MOCK_ONLY_HEADERS_BY_TYPE[profileName]) {
    return MOCK_ONLY_HEADERS_BY_TYPE[profileName];
  }
  return getPdpAuthHeaders(useEnvHeaders);
};

// Spec sample entity for the non-US example ("Account Validation Request (Non US)").
const NON_US_ENTITY = {
  individual: { firstName: "Jane", lastName: "Abbot", fullName: "Jane Abbot" },
};

type AVSRequestEntry = {
  requestId: string;
  profileName?: string;
  account: AVSAccountDetails;
  entity?: typeof NON_US_ENTITY;
  transactions?: unknown[];
};

export const generateAVSRequestBody = (
  profileName: string,
  accountDetails: AVSAccountDetails,
) => {
  const entry: AVSRequestEntry = {
    requestId: "UF" + new Date().getTime(),
    account: accountDetails,
  };
  // Real PDP contract (per the spec's own request examples): each validation
  // type has its own body shape.
  switch (profileName) {
    case "authentication":
      // "Account Validation Request (Palo Alto Supplier)": Verify + Authenticate
      // passes profileName: "authentication". Account Confidence Score (acs)
      // omits profileName entirely.
      entry.profileName = profileName;
      break;
    case "multi-provider":
      // "Account Validation Request Multi (US)": no profileName, empty transactions.
      entry.transactions = [];
      break;
    case "non-us":
      // "Account Validation Request (Non US)": IBAN/SWIFT account (see
      // NON_US_EXAMPLE_ACCOUNTS), an entity, empty transactions.
      entry.entity = NON_US_ENTITY;
      entry.transactions = [];
      break;
    case "micro-deposit":
      // "Micro-deposit Initial ACH Request (US)": profileName "verificationauth"
      // and empty transactions (the challenge call fills them with the two
      // deposit amounts).
      entry.profileName = "verificationauth";
      entry.transactions = [];
      break;
    default:
      break;
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
