import React from 'react';
import SendPaymentForm from '../components/sendPayments/send_payment_panel';
import PreviousPaymentsGrid from '../components/sendPayments/previous_payments_grid';

function PaymentsPage() {
  return (
    <div className="flex w-full min-h-screen flex-wrap gap-4 lg:flex-nowrap">
      <div className="w-full bg-gray-50 border-r border-gray-200 p-8 lg:w-3/5">
        <h2 className="mb-4 text-2xl font-medium">Send a Payment</h2>
        <SendPaymentForm />
      </div>
      <div className="flex-grow gap-4 w-full p-8">
        <PreviousPaymentsGrid />
      </div>
    </div>
  );
}

export default PaymentsPage;
