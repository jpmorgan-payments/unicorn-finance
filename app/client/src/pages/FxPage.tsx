import React from "react";
import { Box, Flex, Group, Title, Stack } from "@mantine/core";
import { UnicornTable } from "../components/UnicornTable";
import type { FXHistory } from "../features/FX/FXTypes";
import FXInputForm from "../features/FX/FXInputForm";
import { PoweredBy } from "../components/PoweredBy";
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
    <>
      <Group gap="xl" justify="space-between" align="center">
        <Title order={1}>FX Rate Sheet</Title>
        <PoweredBy
          apiName="FX Rate Sheet API"
          apiUrl="https://developer.payments.jpmorgan.com/docs/treasury/fx-rate-sheet/doc"
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
          <Title order={4}>Get a rate sheet</Title>
          <FXInputForm onRateSheetComplete={addEntry} />
        </Stack>

        <Stack
          className="lg:w-1/2"
          justify="flex-start"
          flex={1}
          align="stretch"
          mr={"md"}
        >
          <Group justify="space-between" mb="md">
            <Title order={4}>Rate Sheet History</Title>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear History
              </button>
            )}
          </Group>
          {history.length > 0 ? (
            <UnicornTable
              columns={["Account", "Base Currency", "Rates", "Status"]}
              data={tableData}
              onRowClick={handleRowClick}
            />
          ) : (
            <Box
              p="md"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "4px" }}
            >
              <p className="text-sm text-gray-500 text-center">
                No rate sheets yet. Request a rate sheet to see history here.
              </p>
            </Box>
          )}
        </Stack>
      </Flex>
    </>
  );
};

export default FxPage;
