import { AVSAccountDetails } from "./validationServicesTypes";

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

  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }

  return res.json();
}
const generateAVSRequestBody = (
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
  console.log("AVS Request Body:", requestBody);
  return requestBody;
};
