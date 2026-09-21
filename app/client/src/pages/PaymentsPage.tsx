import React from "react";
import { Box, Flex, Group, Stack, Title } from "@mantine/core";
import GlobalPaymentsInputForm from "../features/GlobalPayments/GlobalPaymentsInputForm";
import { UnicornTable } from "../components/UnicornTable";
import { PaymentHistory } from "../features/GlobalPayments/GlobalPaymentTypes";
import { PoweredBy } from "../components/PoweredBy";
import { useApiHistory } from "../hooks/useApiHistory";
import DeveloperModeToggle from "../components/DeveloperModeToggle";
import { DevOptionsProvider } from "../features/GlobalPayments/DevOptionsContext";
import { DevOptionsPanel } from "../features/GlobalPayments/DevOptionsPanel";

const PaymentsPage: React.FC = () => {
  const { history, addEntry, clearHistory, handleRowClick, tableData } =
    useApiHistory<PaymentHistory>("unicorn-payment-history", (item) => [
      item.requestId,
      item.accountNumber,
      item.paymentType,
      item.status,
    ]);

  return (
    <DevOptionsProvider>
      <Group gap="xl" justify="space-between" align="center" wrap="wrap">
        <Title order={1}>Global Payments</Title>
        <PoweredBy
          apiName="Global Payments 2 API"
          apiUrl="https://developer.payments.jpmorgan.com/docs/treasury/global-payments/capabilities/global-payments-2"
        />
      </Group>
      <DeveloperModeToggle />
      <DevOptionsPanel />
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
          <GlobalPaymentsInputForm onPaymentComplete={addEntry} />
        </Stack>

        <Stack
          className="lg:w-1/2"
          justify="flex-start"
          flex={1}
          align="stretch"
          mr={"md"}
        >
          <Group justify="space-between" mb="md">
            <Title order={4}>Payment History</Title>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear History
              </button>
            )}
          </Group>
          {history.length > 0 ? (
            <UnicornTable
              columns={["Request ID", "Account Number", "Payment Type", "Status"]}
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
    </DevOptionsProvider>
  );
};

export default PaymentsPage;
