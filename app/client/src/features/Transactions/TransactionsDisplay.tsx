import React from "react";
import { Box, LoadingOverlay, Stack, Text } from "@mantine/core";
import useSWR from "swr";
import { UnicornTable } from "../../components/UnicornTable";
import { EmptyState } from "../../components/EmptyState";
import type { Transaction, TransactionsResponse } from "./TransactionsTypes";
import {
  submitTransactionsRequest,
  generateTransactionsRequestData,
  TRANSACTIONS_PATH,
} from "./SubmitTransactionsRequest";
import { useEnv } from "../../context/EnvContext";
import { useRequestPreview } from "../../context/RequestPreviewContext";

const TransactionsDisplay: React.FC = () => {
  const { url } = useEnv();
  const { openDrawer } = useRequestPreview();

  const { data, error, isLoading } = useSWR<TransactionsResponse, Error>(
    `${url}${TRANSACTIONS_PATH}`,
    submitTransactionsRequest,
  );

  const transactions: Transaction[] = data?.transactions ?? [];

  const requestData = generateTransactionsRequestData(url, false);

  const tableData = transactions.map((t) => [
    t.transactionId,
    t.bookingDate,
    `${t.creditDebitIndicator === "CREDIT" ? "+" : "-"}${t.currency} ${Number(t.amount).toFixed(2)}`,
    t.status,
  ]);

  const handleRowClick = (rowIndex: number) => {
    const selected = transactions[rowIndex];
    if (selected) openDrawer(requestData, selected as any);
  };

  return (
    <Box flex={1} pos={"relative"}>
      <Stack align="stretch">
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
        {error && (
          <Text c="red" py="md">
            Error fetching transactions
          </Text>
        )}
        {!error && !isLoading && transactions.length > 0 && (
          <UnicornTable
            columns={["Transaction ID", "Date", "Amount", "Status"]}
            data={tableData}
            onRowClick={handleRowClick}
          />
        )}
        {!error && !isLoading && transactions.length === 0 && (
          <EmptyState>No transactions to display.</EmptyState>
        )}
      </Stack>
    </Box>
  );
};

export default TransactionsDisplay;
