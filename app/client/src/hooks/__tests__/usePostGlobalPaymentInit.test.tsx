/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../../config";
import { sendPostGlobalPaymentInit } from "../usePostGlobalPaymentInit";
import { PaymentsResponse } from "../../types/globalPaymentApiTypes";

const HOSTNAME = "http://localhost:80";
const queryClient = new QueryClient();

describe("Test responses from server for balances", () => {
  test("Successful response", async () => {
    queryClient.clear();

    const result: PaymentsResponse | void = await sendPostGlobalPaymentInit(
      `${HOSTNAME}${config.paymentConfig.apiDetails[0].backendPath}?statusCode=200`,
      ""
    );
    expect(result?.paymentInitiationResponse?.endToEndId).toBe("1234");
    expect(result?.paymentInitiationResponse?.firmRootId).toBe("5679");
  });
});
