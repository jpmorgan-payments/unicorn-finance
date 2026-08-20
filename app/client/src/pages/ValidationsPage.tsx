import React from "react";
import { Box, Flex, Group, Title, Stack } from "@mantine/core";
import { UnicornTable } from "../components/UnicornTable";
import type { ValidationHistory } from "../features/ValidationServices/ValidationServicesTypes";
import ValidationServicesInputForm from "../features/ValidationServices/ValidationServiceInputForm";
import { PoweredBy } from "../components/PoweredBy";
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
    <>
      <Group gap="xl" justify="space-between" align="center">
        <Title order={1}>Validation Services</Title>
        <PoweredBy
          apiName="Validation Services API"
          apiUrl="https://developer.payments.jpmorgan.com/docs/fraud-solutions/validation-services"
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
          <Title order={4}>Verify account details</Title>
          <ValidationServicesInputForm onValidationComplete={addEntry} />
        </Stack>

        <Stack
          className="lg:w-1/2"
          justify="flex-start"
          flex={1}
          align="stretch"
          mr={"md"}
        >
          <Group justify="space-between" mb="md">
            <Title order={4}>Validation History</Title>
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
            <Box
              p="md"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "4px" }}
            >
              <p className="text-sm text-gray-500 text-center">
                No validation requests yet. Submit a validation to see history
                here.
              </p>
            </Box>
          )}
        </Stack>
      </Flex>
    </>
  );
};

export default ValidationsPage;
