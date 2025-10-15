import React from "react";
import { Flex, Group, Title, Stack, Text, Card, Badge } from "@mantine/core";
import EnvironmentSwitcher from "../components/EnvironmentSwitcher";
import AccountBalancesDisplay from "../features/AccountBalances/AccountBalancesDisplay";

const AccountsPage: React.FC = () => {
  return (
    <>
      <Group gap="xl">
        <Title order={1}>Account Services</Title>
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
            <Badge className="!bg-pink-100 !text-pink-500 !border-pink-500">
              Coming Soon
            </Badge>
          </Group>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack align="center" gap="md" py="xl">
              <Text size="lg" fw={500} c="dimmed">
                🚧 Transaction History
              </Text>
              <Text size="sm" ta="center" c="dimmed">
                This feature is currently under development. You'll soon be able
                to view detailed transaction history for each account.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Flex>
    </>
  );
};

export default AccountsPage;
