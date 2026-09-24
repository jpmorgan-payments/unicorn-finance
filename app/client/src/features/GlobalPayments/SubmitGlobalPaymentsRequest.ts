import type { PartyDetails, AccountDetails } from "./GlobalPaymentTypes";
import { parseJsonResponse } from "../../utils/parseJsonResponse";
import { Environment } from "../../context/EnvContext";

// JPMC CAT signs the request body and routes it through the digital-signature
// service; JPMC Mock has no certs, so it hits the plain Global Payments v2
// path directly and gets its Bearer token attached server-side (see the
// /mockapi proxy in app/server/app.js) - same contract, same body, just no
// signature wrapping.
export function getGlobalPaymentsEndpoint(
  url: string,
  environment: Environment,
) {
  return environment === Environment.JPMC_MOCK
    ? `${url}/api/payment/v2/payments`
    : `${url}/api/digitalSignature/payment/v2/payments`;
}

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
  environment: Environment,
  amount: string,
  paymentType: string,
  debtorDetails: AccountDetails,
  creditorDetails: PartyDetails,
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  return {
    endpoint: getGlobalPaymentsEndpoint(url, environment),
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
export async function fetchPaymentStatus(
  baseUrl: string,
  paymentId: string,
  environment: Environment,
) {
  const res = await fetch(
    `${getGlobalPaymentsEndpoint(baseUrl, environment)}/${paymentId}/status`,
  );
  return parseJsonResponse(res, "Payment status request");
}
