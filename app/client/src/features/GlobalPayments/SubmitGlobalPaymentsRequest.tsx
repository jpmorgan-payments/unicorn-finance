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
    endpoint: `${url}/api/digitalSignature/payment/v2/payments`,
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

// We send this to our backend which forwards it to Global Payments after generating a digital signature
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

  return res.json();
}
