import React from "react";
import { Stack, Button, Group, Box, LoadingOverlay, Code } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../../componentsV2/UnicornDropdown";
import {
  AVSAccountDetails,
  ValidationHistory,
} from "./ValidationServicesTypes";
import {
  DEFAULT_ACCOUNT_NUMBERS,
  VALIDATION_TYPE_OPTIONS,
  ValidationType,
} from "./ValidationServicesConfig";
import {
  submitValidationServicesRequest,
  generateAVSRequestData,
} from "../ValidationServices/SubmitValidationServicesRequest";
import { useEnv } from "../../context/EnvContext";
import { useRequestPreview } from "../../context/RequestPreviewContext";
import useSWRMutation from "swr/mutation";

interface ValidationFormValues {
  validationType: ValidationType | "";
  accountDetails: AVSAccountDetails | null;
}

interface ValidationServicesInputFormProps {
  accountDetails?: AVSAccountDetails[];
  onValidationComplete?: (validationData: ValidationHistory) => void;
}

const ValidationServicesInputForm: React.FC<
  ValidationServicesInputFormProps
> = ({ accountDetails = DEFAULT_ACCOUNT_NUMBERS, onValidationComplete }) => {
  const { url } = useEnv();
  const { openDrawer } = useRequestPreview();

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    `${url}/api/tsapi/v2/validations/accounts`,
    submitValidationServicesRequest,
  );

  const form = useForm<ValidationFormValues>({
    initialValues: {
      validationType: "",
      accountDetails: null,
    },
    validate: {
      validationType: (value) =>
        value ? null : "Please select a validation type",
      accountDetails: (value) =>
        value ? null : "Please select an account number",
    },
  });

  const getRequestData = () => {
    if (!form.values.validationType || !form.values.accountDetails) {
      return {
        endpoint: `${url}/api/tsapi/v2/validations/accounts`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": "***",
          "x-program-id": "***",
          "x-program-id-type": "***",
        },
        body: null,
      };
    }

    return generateAVSRequestData(
      url,
      form.values.validationType,
      form.values.accountDetails,
      false, // Use masked headers for preview
    );
  };

  const handlePreviewRequest = () => {
    openDrawer(getRequestData(), null);
  };

  const accountNumberOptions = accountDetails.map((account) => ({
    label: account.accountNumber,
    value: JSON.stringify(account),
  }));

  const handleSubmit = async (values: ValidationFormValues) => {
    console.log("Form submitted with values:", values);

    const requestData = getRequestData();
    const requestPayload = requestData.body;

    if (!onValidationComplete || !requestPayload) {
      // Just make the API call without saving if no callback
      await trigger({
        profileName: values.validationType,
        accountDetails: values.accountDetails as AVSAccountDetails,
      });
      return;
    }

    // Base validation data
    const baseValidationData = {
      requestId: requestPayload[0].requestId,
      validationType: values.validationType,
      accountNumber: values.accountDetails?.accountNumber || "Unknown",
      requestPayload: requestPayload,
    };

    try {
      const response = await trigger({
        profileName: values.validationType,
        accountDetails: values.accountDetails as AVSAccountDetails,
      });

      onValidationComplete({
        ...baseValidationData,
        requestData: getRequestData(),
        responseData: response,
        status: "Success" as const,
      });
    } catch (error) {
      onValidationComplete({
        ...baseValidationData,
        requestData: getRequestData(),
        responseData: null,
        status: "Error" as const,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const PreviewRequestButton = () => (
    <Button variant="light" size="md" onClick={handlePreviewRequest}>
      Preview Request
    </Button>
  );

  return (
    <Box component="form" flex={1}>
      {!data && !error && !isMutating && (
        <Box style={{ position: "relative" }}>
          <LoadingOverlay
            visible={isMutating}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Stack gap="md">
            <Box>
              <label
                htmlFor="validationType"
                style={{
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Validation Type *
              </label>
              <UnicornDropdown
                options={VALIDATION_TYPE_OPTIONS}
                value={form.values.validationType}
                onChange={(value) =>
                  form.setFieldValue("validationType", value as ValidationType)
                }
                error={form.errors.validationType}
              />
            </Box>

            <Box>
              <label
                htmlFor="accountNumber"
                style={{
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Account Number *
              </label>
              <UnicornDropdown
                options={accountNumberOptions}
                value={
                  form.values.accountDetails
                    ? JSON.stringify(form.values.accountDetails)
                    : ""
                }
                onChange={(value) => {
                  const selectedAccount = value
                    ? (JSON.parse(value) as AVSAccountDetails)
                    : null;
                  form.setFieldValue("accountDetails", selectedAccount);
                }}
                error={form.errors.accountDetails}
              />
            </Box>

            <Group justify="space-between" mt="md">
              <PreviewRequestButton />

              <Group>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={!form.isValid()}
                  onClick={() => handleSubmit(form.values)}
                >
                  Submit
                </Button>
              </Group>
            </Group>
          </Stack>
        </Box>
      )}
      {data && !isMutating && (
        <Box>
          <Code block>{JSON.stringify(data, null, 2)}</Code>
          <Group justify="space-between" mt="md">
            <PreviewRequestButton />

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                form.reset();
              }}
            >
              Validate Another
            </Button>
          </Group>
        </Box>
      )}
      {error && !isMutating && (
        <Box>
          <Code block>
            {`Error: ${
              (error as Error).message || "An unknown error occurred"
            }`}
          </Code>
          <Group justify="space-between" mt="md">
            <PreviewRequestButton />

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                form.reset();
              }}
            >
              Try Again
            </Button>
          </Group>
        </Box>
      )}
    </Box>
  );
};

export default ValidationServicesInputForm;
