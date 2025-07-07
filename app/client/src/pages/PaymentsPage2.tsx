import React from "react";
import PaymentForm from "../features/submitAndVerifyPayments/paymentStepperForm";
import { Grid } from "@mantine/core";

const SUPPORTED_PAYMENT_METHODS = ["US-RTP", "SEPA"];

const PaymentsPage2: React.FC = () => {
  // This page will allow a user to:
  // 1. Select a to/from account from dropdown
  // 2. Enter a payment amount
  // 3. Enter a payment description
  // 4. Verify the payment using AVS
  // 5. Include an account confidence score
  // 6. Submit the payment
  // 7. View previous payments in a grid format

  return (
    <div>
      <h1>Payments Page 2</h1>
      <Grid grow gutter={5}>
        <Grid.Col span={2}>
          <PaymentForm supportedPaymentMethods={SUPPORTED_PAYMENT_METHODS} />
        </Grid.Col>
        <Grid.Col span="auto">2</Grid.Col>
      </Grid>
    </div>
  );
};

export default PaymentsPage2;
