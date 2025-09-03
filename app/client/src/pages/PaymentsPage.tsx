import React, { useState, useEffect } from "react";
import GlobalPaymentsInputForm from "../features/GlobalPayments/GlobalPaymentsInputForm";
import { Box, Flex, Group, Stack, Title } from "@mantine/core";
import EnvironmentSwitcher from "../componentsV2/EnvironmentSwitcher";
import { useRequestPreview } from "../context/RequestPreviewContext";
import { UnicornTable } from "../componentsV2/UnicornTable";
import { PaymentHistory } from "../features/GlobalPayments/GlobalPaymentTypes";

const PAYMENT_HISTORY_KEY = "unicorn-payment-history";

const PaymentsPage: React.FC = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(() => {
    // Initialize from localStorage if available
    try {
      const stored = localStorage.getItem(PAYMENT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading payment history from localStorage:", error);
      return [];
    }
  });
  const { openDrawer } = useRequestPreview();

  // Save to localStorage whenever paymentHistory changes
  useEffect(() => {
    try {
      localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(paymentHistory));
    } catch (error) {
      console.error("Error saving payment history to localStorage:", error);
    }
  }, [paymentHistory]);

  const handlePaymentComplete = (paymentData: PaymentHistory) => {
    setPaymentHistory((prev) => [paymentData, ...prev]); // Add to beginning for newest first
  };

  const clearHistory = () => {
    setPaymentHistory([]);
    localStorage.removeItem(PAYMENT_HISTORY_KEY);
  };

  const handleRowClick = (rowIndex: number) => {
    const selectedPayment = paymentHistory[rowIndex];
    if (selectedPayment) {
      openDrawer(selectedPayment.requestData, selectedPayment.responseData);
    }
  };

  // Transform history data for table display
  const tableData = paymentHistory.map((item) => [
    item.requestId,
    item.accountNumber,
    item.paymentType,
    item.status,
  ]);

  return (
    <>
      <Group gap="xl">
        <Title order={1}>Global Payments</Title>
        <EnvironmentSwitcher />
      </Group>
      <Flex
        m="md"
        w={"100%"}
        gap="md"
        justify="space-between"
        align="flex-start"
        direction={{ base: "column", sm: "row" }}
      >
        <Stack align="stretch" justify="flex-start" flex={1}>
          <Title order={4}>Submit a Payment</Title>
          <GlobalPaymentsInputForm onPaymentComplete={handlePaymentComplete} />
        </Stack>

        <Stack
          className="lg:w-1/2"
          justify="flex-start"
          flex={1}
          align="stretch"
        >
          <Group justify="space-between" mb="md">
            <Title order={4}>Payment History</Title>
            {paymentHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear History
              </button>
            )}
          </Group>
          {paymentHistory.length > 0 ? (
            <UnicornTable
              columns={[
                "Request ID",
                "Account Number",
                "Payment Type",
                "Status",
              ]}
              data={tableData}
              onRowClick={handleRowClick}
            />
          ) : (
            <Box
              p="md"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "4px" }}
            >
              <p className="text-sm text-gray-500 text-center">
                No payment requests yet. Submit a payment to see history here.
              </p>
            </Box>
          )}
        </Stack>
      </Flex>
    </>
  );
};

export default PaymentsPage;
