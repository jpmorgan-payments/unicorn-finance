import React, { useState } from "react";
import InitPaymentForm from "../features/initPayment/initPaymentForm";

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
      <p>Welcome to the Payments Page 2!</p>
      <InitPaymentForm supportedPaymentMethods={SUPPORTED_PAYMENT_METHODS} />
    </div>
  );
};

export default PaymentsPage2;
