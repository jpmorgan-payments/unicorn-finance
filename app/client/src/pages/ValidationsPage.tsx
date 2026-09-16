import React from "react";
import { Button, Grid, Stack } from "@mantine/core";
import { UnicornTable } from "../components/UnicornTable";
import type { ValidationHistory } from "../features/ValidationServices/ValidationServicesTypes";
import ValidationServicesInputForm from "../features/ValidationServices/ValidationServiceInputForm";
import { PoweredBy } from "../components/PoweredBy";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { EmptyState } from "../components/EmptyState";
import { useApiHistory } from "../hooks/useApiHistory";

const ValidationsPage: React.FC = () => {
  const { history, addEntry, clearHistory, handleRowClick, tableData } =
    useApiHistory<ValidationHistory>("unicorn-validation-history", (item) => [
      item.requestId,
      item.accountNumber,
      item.validationType,
      item.status,
    ]);

  return (
    <Stack gap="lg">
      <PageHeader
        title="Validation Services"
        aside={
          <PoweredBy
            apiName="Validation Services API"
            apiUrl="https://developer.payments.jpmorgan.com/docs/fraud-solutions/validation-services"
          />
        }
      />

      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, md: 5, xl: 4 }}>
          <Panel title="Verify account details">
            <ValidationServicesInputForm onValidationComplete={addEntry} />
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7, xl: 8 }}>
          <Panel
            title="Validation History"
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
                columns={[
                  "Request ID",
                  "Account Number",
                  "Validation Type",
                  "Status",
                ]}
                data={tableData}
                onRowClick={handleRowClick}
              />
            ) : (
              <EmptyState>
                No validation requests yet. Submit a validation to see history
                here.
              </EmptyState>
            )}
          </Panel>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default ValidationsPage;
