import React from "react";
import { Button, Grid, Stack } from "@mantine/core";
import { UnicornTable } from "../components/UnicornTable";
import type { FXHistory } from "../features/FX/FXTypes";
import FXInputForm from "../features/FX/FXInputForm";
import { PoweredBy } from "../components/PoweredBy";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { EmptyState } from "../components/EmptyState";
import { useApiHistory } from "../hooks/useApiHistory";

const FxPage: React.FC = () => {
  const { history, addEntry, clearHistory, handleRowClick, tableData } =
    useApiHistory<FXHistory>("unicorn-fx-history", (item) => [
      item.accountId,
      item.currency,
      String(item.responseData?.data?.length ?? 0),
      item.status,
    ]);

  return (
    <Stack gap="lg">
      <PageHeader
        title="FX Rate Sheet"
        aside={
          <PoweredBy
            apiName="FX Rate Sheet API"
            apiUrl="https://developer.payments.jpmorgan.com/docs/treasury/fx-rate-sheet/doc"
          />
        }
      />

      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, md: 5, xl: 4 }}>
          <Panel title="Get a rate sheet">
            <FXInputForm onRateSheetComplete={addEntry} />
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7, xl: 8 }}>
          <Panel
            title="Rate Sheet History"
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
                columns={["Account", "Base Currency", "Rates", "Status"]}
                data={tableData}
                onRowClick={handleRowClick}
              />
            ) : (
              <EmptyState>
                No rate sheets yet. Request a rate sheet to see history here.
              </EmptyState>
            )}
          </Panel>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default FxPage;
