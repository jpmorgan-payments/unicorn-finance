import React, { useState, useEffect } from "react";
import { Box, Flex, Group, Title, Stack } from "@mantine/core";
import EnvironmentSwitcher from "../components/EnvironmentSwitcher";
import { useEnv } from "../context/EnvContext";
import { UnicornTable } from "../components/UnicornTable";
import type { ValidationHistory } from "../features/ValidationServices/ValidationServicesTypes";
import { useRequestPreview } from "../context/RequestPreviewContext";
import ValidationServicesInputForm from "../features/ValidationServices/ValidationServiceInputForm";

const VALIDATION_HISTORY_BASE_KEY = "unicorn-validation-history";

const ValidationsPage: React.FC = () => {
  const { environment } = useEnv();
  const { openDrawer } = useRequestPreview();

  // Create environment-specific localStorage key
  const getValidationHistoryKey = () =>
    `${VALIDATION_HISTORY_BASE_KEY}-${environment}`;

  const [validationHistory, setValidationHistory] = useState<
    ValidationHistory[]
  >([]);

  // Load validation history when component mounts or environment changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getValidationHistoryKey());
      setValidationHistory(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error(
        "Error loading validation history from localStorage:",
        error,
      );
      setValidationHistory([]);
    }
  }, [environment]);

  // Save to localStorage whenever validationHistory changes
  useEffect(() => {
    try {
      localStorage.setItem(
        getValidationHistoryKey(),
        JSON.stringify(validationHistory),
      );
    } catch (error) {
      console.error("Error saving validation history to localStorage:", error);
    }
  }, [validationHistory]);

  const handleValidationComplete = (validationData: ValidationHistory) => {
    setValidationHistory((prev) => [validationData, ...prev]); // Add to beginning for newest first
  };

  const clearHistory = () => {
    setValidationHistory([]);
    localStorage.removeItem(getValidationHistoryKey());
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
