import type { AVSAccountDetails } from "./TYPEHELLO";

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
    endpoint: `${url}/api/tsapi/v2/validations/accounts`,
    method: "POST",
    headers,
    body: generateAVSRequestBody(profileName, accountDetails),
  };
};

export async function submitValidationServicesRequest(
  url: string,
  {
    arg,
  }: {
    arg: {
      profileName: string;
      accountDetails: AVSAccountDetails;
    };
  },
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(
      generateAVSRequestBody(arg.profileName, arg.accountDetails),
    ),
    headers: {
      "Content-Type": "application/json",
      "x-client-id": import.meta.env.VITE_CLIENT_ID,
      "x-program-id": import.meta.env.VITE_PROGRAM_ID,
      "x-program-id-type": import.meta.env.VITE_PROGRAM_ID_TYPE,
    },
  });
  return res.json();
}
