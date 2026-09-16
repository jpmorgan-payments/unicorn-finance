import React from "react";
import { Button, Grid, Stack } from "@mantine/core";
import GlobalPaymentsInputForm from "../features/GlobalPayments/GlobalPaymentsInputForm";
import { UnicornTable } from "../components/UnicornTable";
import { PaymentHistory } from "../features/GlobalPayments/GlobalPaymentTypes";
import { PoweredBy } from "../components/PoweredBy";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { EmptyState } from "../components/EmptyState";
import { useApiHistory } from "../hooks/useApiHistory";

const PaymentsPage: React.FC = () => {
  const { history, addEntry, clearHistory, handleRowClick, tableData } =
    useApiHistory<PaymentHistory>("unicorn-payment-history", (item) => [
      item.requestId,
      item.accountNumber,
      item.paymentType,
      item.status,
    ]);

  return (
    <Stack gap="lg">
      <PageHeader
        title="Global Payments"
        aside={
          <PoweredBy
            apiName="Global Payments 2 API"
            apiUrl="https://developer.payments.jpmorgan.com/docs/treasury/global-payments/capabilities/global-payments-2"
          />
        }
      />

      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, md: 5, xl: 4 }}>
          <Panel title="Submit a Payment">
            <GlobalPaymentsInputForm onPaymentComplete={addEntry} />
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7, xl: 8 }}>
          <Panel
            title="Payment History"
            action={
              history.length > 0 && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  onClick={clearHistory}
                >
                  Clear History
                </Button>
              )
            }
          >
            {history.length > 0 ? (
              <UnicornTable
                columns={["Request ID", "Account Number", "Payment Type", "Status"]}
                data={tableData}
                onRowClick={handleRowClick}
              />
            ) : (
              <EmptyState>
                No payment requests yet. Submit a payment to see history here.
              </EmptyState>
            )}
          </Panel>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default PaymentsPage;
