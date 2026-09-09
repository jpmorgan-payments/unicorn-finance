import React from "react";
import { Button, Group, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../../components/UnicornDropdown";
import { ApiFormShell } from "../../components/ApiFormShell";
import type {
  AVSAccountDetails,
  ValidationHistory,
} from "./ValidationServicesTypes";
import {
  DEFAULT_ACCOUNT_NUMBERS,
  VALIDATION_TYPE_OPTIONS,
  ValidationType,
} from "./ValidationServiceConfig";
import {
  submitValidationServicesRequest,
  generateAVSRequestData,
} from "./SubmitValidationServicesRequest";
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
    return generateAVSRequestData(
      url,
      form.values.validationType,
      form.values.accountDetails as AVSAccountDetails,
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
    const requestData = getRequestData();
    const requestPayload = requestData.body;

    const response = await trigger({
      profileName: values.validationType,
      accountDetails: values.accountDetails as AVSAccountDetails,
    });

    // `trigger` rejects on error, so reaching here means the call succeeded
    onValidationComplete?.({
      requestId: requestPayload[0].requestId,
      validationType: values.validationType,
      accountNumber: values.accountDetails?.accountNumber || "Unknown",
      requestData,
      responseData: response,
      status: "Success" as const,
    });
  };

  return (
    <ApiFormShell
      isMutating={isMutating}
      data={data}
      error={error}
      onPreview={handlePreviewRequest}
      previewDisabled={!form.isValid()}
      onReset={() => {
        reset();
        form.reset();
      }}
      resultActionLabel="Validate Another"
      idleActions={
        <Group>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={!form.isValid()}
            onClick={() => handleSubmit(form.values)}
          >
            Submit
          </Button>
        </Group>
      }
    >
      <Box>
        <label
          htmlFor="validationType"
          style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}
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
          style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}
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
    </ApiFormShell>
  );
};

export default ValidationServicesInputForm;
