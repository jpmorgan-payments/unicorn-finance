import React from "react";
import {
  Text,
  Group,
  Stack,
  Box,
  LoadingOverlay,
  ScrollArea,
  UnstyledButton,
} from "@mantine/core";
import type { Account, AccountBalances } from "./AccountBalancesTypes";
import { submitAccountBalancesRequest } from "./SubmitAccountBalancesRequest";
import { useRequestPreview } from "../../context/RequestPreviewContext";
import { useEnv } from "../../context/EnvContext";
import useSWR from "swr";

// "$4,250,000.00" / "-$15,480,165.59" - grouped digits and a leading sign so a
// long column of balances scans like a statement.
const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const AccountBalanceRow: React.FC<{
  account: Account;
  onClick: () => void;
}> = ({ account, onClick }) => {
  const balance = account.balanceList?.[0];
  const hasBalance = !account.errors && !!balance;
  const negative = hasBalance && balance.endingAvailableAmount < 0;

  return (
    <UnstyledButton className="uf-ledger-row" onClick={onClick}>
      <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
        <Text size="sm" fw={600} lh={1.3} truncate>
          {account.accountName || account.accountId}
        </Text>
        {account.accountName && (
          <Text size="xs" c="dimmed" ff="monospace" lh={1.3}>
            {account.accountId}
          </Text>
        )}
      </Stack>
      <Group gap="xs" wrap="nowrap" align="baseline" style={{ flexShrink: 0 }}>
        {hasBalance ? (
          <Text
            size="sm"
            fw={600}
            lh={1.3}
            className="uf-ledger-amount"
            c={negative ? "red" : undefined}
          >
            {formatAmount(balance.endingAvailableAmount, account.currency.code)}
          </Text>
        ) : (
          <Text size="sm" c="dimmed" lh={1.3}>
            {account.errors?.errorMsg ?? "—"}
          </Text>
        )}
        <Text size="xs" c="dimmed" fw={500} className="uf-ledger-ccy">
          {account.currency.code}
        </Text>
        <span className="material-icons-outlined uf-ledger-chevron" aria-hidden>
          chevron_right
        </span>
      </Group>
    </UnstyledButton>
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

  const asOf = accountBalanceData?.accountList.find(
    (a) => a.balanceList?.[0]?.asOfDate,
  )?.balanceList[0].asOfDate;

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
        // Statement-style ledger: one hairline row per account, amounts in a
        // right-aligned tabular column. The list is long (dozens of accounts),
        // so it scrolls inside the panel with the column header pinned.
        <Box className="uf-ledger">
          <div className="uf-ledger-head">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.04em">
              Account
            </Text>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.04em">
              {asOf ? `Available · ${asOf}` : "Available"}
            </Text>
          </div>
          <ScrollArea.Autosize
            mah={{ base: 520, md: "calc(100vh - 380px)" }}
            type="auto"
            scrollbars="y"
          >
            {accountBalanceData.accountList.map((account) => (
              <AccountBalanceRow
                key={account.accountId}
                account={account}
                onClick={() => handleClickOnAccount(account.accountId)}
              />
            ))}
          </ScrollArea.Autosize>
        </Box>
      )}
    </Box>
  );
};

export default AccountBalancesDisplay;
