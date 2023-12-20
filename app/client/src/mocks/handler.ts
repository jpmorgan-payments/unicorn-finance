import { HttpResponse, http } from "msw";
import transactionsMockedResponse from "../mockedJson/uf-transactions.json";
import accountBalanceMockedResponse from "../mockedJson/uf-balances.json";
import serviceStatusMockedResponse from "../mockedJson/uf-service-status.json";

const errorResponse = {
  errors: [
    {
      errorCode: "GCA-099",
      errorMsg: "System is Unavailable",
    },
  ],
};

export const paymentInitiationResponse = {
  endToEndId: "1234",
  firmRootId: "5679",
};
// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  http.get("*/api/tsapi/v3/transactions", ({ request }) => {
    const url = new URL(request.url);
    const statusCode = url.searchParams.get("statusCode");
    if (statusCode === "500") {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
    return HttpResponse.json(
      { data: transactionsMockedResponse },
      { status: 200 }
    );
  }),
  http.get("*/api/tsapi/v1/participants", ({ request }) => {
    const url = new URL(request.url);
    const statusCode = url.searchParams.get("statusCode");
    if (statusCode === "500") {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
    return HttpResponse.json(
      { bankStatus: serviceStatusMockedResponse },
      { status: 200 }
    );
  }),
  http.post("*/api/accessapi/balance", ({ request }) => {
    const url = new URL(request.url);
    const statusCode = url.searchParams.get("statusCode");
    if (statusCode === "500") {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
    return HttpResponse.json(
      { accountList: accountBalanceMockedResponse },
      { status: 200 }
    );
  }),
  http.post("*/api/digitalSignature/tsapi/v1/payments", ({ request }) => {
    const url = new URL(request.url);
    const statusCode = url.searchParams.get("statusCode");
    if (statusCode === "401") {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
    return HttpResponse.json({ paymentInitiationResponse }, { status: 200 });
  }),
];
