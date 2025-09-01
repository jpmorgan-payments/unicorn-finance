import React, { useState } from "react";
import GlobalPaymentsInputForm from "../features/GlobalPayments/GlobalPaymentsInputForm";
import { Box, Flex, Group, Stack, Title } from "@mantine/core";
import Layout from "../componentsV2/Layout";
import EnvironmentSwitcher from "../componentsV2/EnvironmentSwitcher";
import { useRequestPreview } from "../context/RequestPreviewContext";
import { UnicornTable } from "../componentsV2/UnicornTable";
import { PaymentHistory } from "../features/GlobalPayments/GlobalPaymentsTypes";

const SUPPORTED_PAYMENT_METHODS = ["US-RTP", "SEPA"];

const TO_ACCOUNT_DETAILS = [
  {
    accountNumber: "123425",
    financialInstitutionId: {
      clearingSystemId: {
        id: "122199983",
        idType: "ABA",
      },
    },
  },
];

const PaymentsPage: React.FC = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const { openDrawer } = useRequestPreview();

  const handlePaymentComplete = (paymentData: PaymentHistory) => {
    setPaymentHistory((prev) => [paymentData, ...prev]); // Add to beginning for newest first
  };

  const clearHistory = () => {
    setPaymentHistory([]);
  };

  const handleRowClick = (rowIndex: number) => {
    const selectedPayment = paymentHistory[rowIndex];
    console.log("Selected Payment:", selectedPayment);
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
    <Layout>
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
          <GlobalPaymentsInputForm
            supportedPaymentMethods={SUPPORTED_PAYMENT_METHODS}
            toAccountDetails={TO_ACCOUNT_DETAILS}
          />
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
    </Layout>
  );
};

export default PaymentsPage;
