import type { PartyDetails, AccountDetails } from "./GlobalPaymentTypes";
import { parseJsonResponse } from "../../utils/parseJsonResponse";

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
      body: ReturnType<typeof generateGlobalPaymentsRequestBody>;
      // Local-mock-only: selects a chaos scenario for the mock status
      // lifecycle. Ignored (and never sent) against JPMC Mock/CAT.
      chaos?: string;
    };
  },
) {
  const endpoint =
    arg.chaos && arg.chaos !== "none"
      ? `${url}?chaos=${encodeURIComponent(arg.chaos)}`
      : url;

  const res = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(arg.body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseJsonResponse(res, "Global payment request");
}

// GPI Payment Status Track and Trace - GET /payments/{paymentId}/status.
export async function fetchPaymentStatus(baseUrl: string, paymentId: string) {
  const res = await fetch(
    `${baseUrl}/api/digitalSignature/payment/v2/payments/${paymentId}/status`,
  );
  return parseJsonResponse(res, "Payment status request");
}
