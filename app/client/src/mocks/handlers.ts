import { HttpResponse, http } from "msw";
import accountBalanceMockedResponse from "./mockedJson/AccountBalances.json";
import validationServicesACSResponse from "./mockedJson/ValidationServicesACS.json";
import validationServicesAuthResponse from "./mockedJson/ValidationServicesAuth.json";
import globalPaymentsResponse from "./mockedJson/GlobalPayments.json";
const errorResponse = {
  errors: [
    {
      errorCode: "GCA-099",
      errorMsg: "System is Unavailable",
    },
  ],
};

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [
  http.post("/api/accessapi/balance", ({ request }) => {
    const url = new URL(request.url);
    const statusCode = url.searchParams.get("statusCode");
    if (statusCode === "500") {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
    return HttpResponse.json(
      { accountList: accountBalanceMockedResponse },
      { status: 200 },
    );
  }),
  http.post(
    "/api/digitalSignature/payment/v2/payments",
    async ({ request }) => {
      const url = new URL(request.url);
      const statusCode = url.searchParams.get("statusCode");
      if (statusCode === "401") {
        return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
      }

      // Parse request body to get requestId
      let endToEndId = "default-endToEnd-id";
      let response: { endToEndId?: string; paymentId?: string } | null = {};
      const requestBody = (await request.json()) as any[];
      console.log("Request Body:", requestBody);
      if (requestBody && requestBody.length > 0) {
        endToEndId = requestBody[0].endToEndId || "id";
      }

      if (response) {
        response.endToEndId = endToEndId || "default-endToEnd-id";
        response.paymentId = crypto.randomUUID();
        return HttpResponse.json({ response }, { status: 200 });
      } else {
        return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
      }
    },
  ),
  http.post("/api/tsapi/v2/validations/accounts", async ({ request }) => {
    const url = new URL(request.url);
    const statusCode = url.searchParams.get("statusCode");
    if (statusCode === "401") {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
    // Parse request body to get requestId
    let requestId = "default-request-id";
    let profile = "authentication";
    let response;
    const requestBody = (await request.json()) as any[];
    console.log("Request Body:", requestBody);
    if (requestBody && requestBody.length > 0) {
      requestId = requestBody[0].requestId || "default-request-id";
      profile = requestBody[0].profile || "authentication";
    }

    if (profile === "authentication") {
      response = validationServicesAuthResponse.at(
        validationServicesAuthResponse.length * Math.random(),
      ) as any;
    } else {
      response = validationServicesACSResponse.at(
        validationServicesACSResponse.length * Math.random(),
      ) as any;
    }

    if (response) {
      response.requestId = requestId || "default-request-id";
      return HttpResponse.json({ response }, { status: 200 });
    } else {
      return new HttpResponse(JSON.stringify(errorResponse), { status: 500 });
    }
  }),
];
