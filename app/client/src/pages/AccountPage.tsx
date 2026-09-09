import React from "react";
import { Flex, Group, Title, Stack } from "@mantine/core";
import AccountBalancesDisplay from "../features/AccountBalances/AccountBalancesDisplay";
import TransactionsDisplay from "../features/Transactions/TransactionsDisplay";
import { PoweredBy } from "../components/PoweredBy";

const AccountsPage: React.FC = () => {
  return (
    <>
      <Group gap="xl" justify="space-between" align="center">
        <Title order={1}>Account Services</Title>
        <PoweredBy
          apiName="Transactions API"
          apiUrl="https://developer.payments.jpmorgan.com/docs/treasury/global-payments/capabilities/receivables"
        />
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
          <Title order={4}>Today's Balances</Title>
          <AccountBalancesDisplay />
        </Stack>

        <Stack
          className="lg:w-1/2"
          justify="flex-start"
          flex={1}
          align="stretch"
          mr={"md"}
        >
          <Group justify="space-between" mb="md">
            <Title order={4}>Transaction History</Title>
          </Group>
          <TransactionsDisplay />
        </Stack>
      </Flex>
    </>
  );
};

export default AccountsPage;
