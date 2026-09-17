import React from "react";
import { Grid, Stack } from "@mantine/core";
import AccountBalancesDisplay from "../features/AccountBalances/AccountBalancesDisplay";
import TransactionsDisplay from "../features/Transactions/TransactionsDisplay";
import { PoweredBy } from "../components/PoweredBy";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";

const AccountsPage: React.FC = () => {
  return (
    <Stack gap="lg">
      <PageHeader
        title="Account Services"
        aside={
          <PoweredBy
            apiName="Transactions API"
            apiUrl="https://developer.payments.jpmorgan.com/docs/treasury/global-payments/capabilities/receivables"
          />
        }
      />

      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, md: 5, xl: 4 }}>
          <Panel title="Today's Balances">
            <AccountBalancesDisplay />
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7, xl: 8 }}>
          <Panel title="Transaction History">
            <TransactionsDisplay />
          </Panel>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default AccountsPage;
