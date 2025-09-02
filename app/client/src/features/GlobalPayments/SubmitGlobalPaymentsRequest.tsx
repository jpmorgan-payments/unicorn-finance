import { PartyDetails, AccountDetails } from "./GlobalPaymentTypes";

function generateGlobalPaymentsRequestBody(
  amount: string,
  paymentType: string,
  debtorDetails: AccountDetails,
  creditorDetails: PartyDetails,
) {
  const requestBody = {
    requestedExecutionDate: new Date().toISOString().split("T")[0],
    paymentIdentifiers: {
      endToEndId: "UF" + new Date().getTime(),
    },
    transferType: "CREDIT",
    value: {
      currency: "USD",
      amount: amount,
    },
    paymentType: paymentType,
    debtor: debtorDetails.account,
    debtorAgent: debtorDetails.agent,
    creditor: creditorDetails,
  };
  console.log("Global Payments Request Body:", requestBody);
  return requestBody;
}

export const generateGlobalPaymentsRequestData = (
  url: string,
  amount: string,
  paymentType: string,
  debtorDetails: AccountDetails,
  creditorDetails: PartyDetails,
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  return {
    endpoint: `${url}/api/tsapi/v2/validations/accounts`,
    method: "POST",
    headers,
    body: generateGlobalPaymentsRequestBody(
      amount,
      paymentType,
      debtorDetails,
      creditorDetails,
    ),
  };
};

export async function submitGlobalPaymentsRequest(
  url: string,
  {
    arg,
  }: {
    arg: {
      amount: string;
      paymentType: string;
      debtorDetails: AccountDetails;
      creditorDetails: PartyDetails;
    };
  },
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(
      generateGlobalPaymentsRequestBody(
        arg.amount,
        arg.paymentType,
        arg.debtorDetails,
        arg.creditorDetails,
      ),
    ),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }

  return res.json();
}
