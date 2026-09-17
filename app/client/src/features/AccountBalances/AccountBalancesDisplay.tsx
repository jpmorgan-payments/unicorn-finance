import React from "react";
import {
  Text,
  Group,
  Badge,
  Stack,
  Box,
  LoadingOverlay,
  Paper,
  ScrollArea,
  SimpleGrid,
} from "@mantine/core";
import type { Account, AccountBalances } from "./AccountBalancesTypes";
import { submitAccountBalancesRequest } from "./SubmitAccountBalancesRequest";
import { useRequestPreview } from "../../context/RequestPreviewContext";
import { useEnv } from "../../context/EnvContext";
import useSWR from "swr";

const AccountBalanceCard: React.FC<{
  account: Account;
  onClick: () => void;
}> = ({ account, onClick }) => {
  const balance = account.balanceList?.[0];
  return (
    <Paper
      className="uf-card-link"
      radius="md"
      p="md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      style={{ cursor: "pointer" }}
    >
      {/* One row per account: name + id on the left, currency + balance on
          the right, so dozens of accounts scan like a ledger. */}
      <Group justify="space-between" wrap="nowrap" align="center" gap="md">
        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={600} lh={1.3} style={{ overflowWrap: "anywhere" }}>
            {account.accountName || account.accountId}
          </Text>
          {account.accountName && (
            <Text size="xs" c="dimmed" ff="monospace" style={{ overflowWrap: "anywhere" }}>
              {account.accountId}
            </Text>
          )}
        </Stack>
        <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
          <Badge variant="light" color="pink" size="sm">
            {account.currency.code}
          </Badge>
          {!account.errors && balance && (
            <Text size="lg" fw={700} lh={1.2} style={{ whiteSpace: "nowrap" }}>
              ${balance.endingAvailableAmount.toFixed(2)}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
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
      // Mirror the payload actually sent by submitAccountBalancesRequest
      body: {
        relativeDateType: "CURRENT_DAY",
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
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "md", blur: 2 }}
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
      {error && !accountBalanceData && (
        <Text c="red" py="md">
          Error fetching account balances
        </Text>
      )}
      {!error && accountBalanceData && (
        // The list is long (dozens of accounts), so it scrolls inside the panel
        // and keeps the Transactions panel on screen next to it.
        <ScrollArea.Autosize
          mah={{ base: 560, md: "calc(100vh - 340px)" }}
          type="auto"
          scrollbars="y"
          offsetScrollbars
        >
          <SimpleGrid cols={{ base: 1, sm: 2, md: 1 }} spacing="sm">
            {accountBalanceData.accountList.map((account) => (
              <AccountBalanceCard
                key={account.accountId}
                account={account}
                onClick={() => handleClickOnAccount(account.accountId)}
              />
            ))}
          </SimpleGrid>
        </ScrollArea.Autosize>
      )}
    </Box>
  );
};

export default AccountBalancesDisplay;
