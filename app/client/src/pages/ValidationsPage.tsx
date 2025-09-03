import React, { useState } from "react";
import { Box, Flex, Group, Title, Stack } from "@mantine/core";
import EnvironmentSwitcher from "../componentsV2/EnvironmentSwitcher";
import ValidationServicesInputForm from "../features/ValidationServices/ValidationServicesInputForm";
import { UnicornTable } from "../componentsV2/UnicornTable";
import { ValidationHistory } from "../features/ValidationServices/ValidationServicesTypes";
import { useRequestPreview } from "../context/RequestPreviewContext";
const PAYMENT_HISTORY_KEY = "unicorn-validation-history";

const ValidationsPage: React.FC = () => {
  const [validationHistory, setValidationHistory] = useState<
    ValidationHistory[]
  >(() => {
    // Initialize from localStorage if available
    try {
      const stored = localStorage.getItem(PAYMENT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading payment history from localStorage:", error);
      return [];
    }
  });
  const { openDrawer } = useRequestPreview();

  const handleValidationComplete = (validationData: ValidationHistory) => {
    setValidationHistory((prev) => [validationData, ...prev]); // Add to beginning for newest first
  };

  const clearHistory = () => {
    setValidationHistory([]);
  };

  const handleRowClick = (rowIndex: number) => {
    const selectedValidation = validationHistory[rowIndex];
    if (selectedValidation) {
      openDrawer(
        selectedValidation.requestData,
        selectedValidation.responseData,
      );
    }
  };

  // Transform history data for table display
  const tableData = validationHistory.map((item) => [
    item.requestId,
    item.accountNumber,
    item.validationType,
    item.status,
  ]);

  return (
    <>
      <Group gap="xl">
        <Title order={1}>Validation Services</Title>
        <EnvironmentSwitcher />
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
          <ValidationServicesInputForm
            onValidationComplete={handleValidationComplete}
          />
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
            {validationHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear History
              </button>
            )}
          </Group>
          {validationHistory.length > 0 ? (
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
