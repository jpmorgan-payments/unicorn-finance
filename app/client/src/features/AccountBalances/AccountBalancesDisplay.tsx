import React from "react";
import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Container,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { Account, AccountBalances } from "./AccountBalancesTypes.d";
import { submitAccountBalancesRequest } from "./SubmitAccountBalancesRequest";
import { useRequestPreview } from "../../context/RequestPreviewContext";
import { useEnv } from "../../context/EnvContext";
import useSWR from "swr";

const AccountBalanceCard: React.FC<{
  account: Account;
  onClick: () => void;
}> = ({ account, onClick }) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <Card.Section>
        <Group justify="space-between" mt="md" mb="xs" px="lg">
          <Text fw={500} size="lg">
            {account.accountName
              ? `${account.accountName} - ${account.accountId}`
              : account.accountId}
          </Text>
          <Badge
            className="!bg-pink-100 !text-pink-500 !border-pink-500"
            variant="light"
          >
            {account.currency.code}
          </Badge>
        </Group>
      </Card.Section>
      {!account.errors &&
        account.balanceList &&
        account.balanceList.length > 0 && (
          <Card.Section>
            <Text size="xl" mt="md" mb="xs" px="lg" fw={700}>
              ${account.balanceList[0].endingAvailableAmount.toFixed(2)}
            </Text>
          </Card.Section>
        )}
    </Card>
  );
};
const AccountBalancesDisplay: React.FC = () => {
  const { url } = useEnv();
  const { openDrawer } = useRequestPreview();
  const { data, error, isLoading } = useSWR<any, Error>(
    `${url}/api/accessapi/balance`,
    submitAccountBalancesRequest,
  );
  const accountBalanceData: AccountBalances | undefined = data;

  const getRequestData = (accountId: string) => {
    return {
      endpoint: `${url}/api/accessapi/balance`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        relativeDateType: "CURRENT_DAY",
        accountList: [
          {
            accountId: accountId,
          },
        ],
      },
    };
  };

  const handleClickOnAccount = (accountId: string) => {
    const response = accountBalanceData?.accountList.find(
      (account) => account.accountId === accountId,
    );
    openDrawer(getRequestData(accountId), response as any);
  };

  return (
    <Box flex={1} pos={"relative"}>
      <Stack align="stretch">
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "pink", type: "bars" }}
        />
        {isLoading && (
          <Box
            style={{
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>Loading...</div>
          </Box>
        )}
        {error && (
          <Container size="xl" py="md">
            <Text c="red">Error fetching account balances</Text>
          </Container>
        )}
        {accountBalanceData &&
          accountBalanceData.accountList.map((account) => (
            <AccountBalanceCard
              key={account.accountId}
              account={account}
              onClick={() => handleClickOnAccount(account.accountId)}
            />
          ))}
      </Stack>
    </Box>
  );
};

export default AccountBalancesDisplay;
