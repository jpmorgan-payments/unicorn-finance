import React from "react";
import { Button, Group, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../../components/UnicornDropdown";
import { ApiFormShell } from "../../components/ApiFormShell";
import type {
  AVSAccountDetails,
  ValidationHistory,
} from "./ValidationServicesTypes";
import type { NamedExampleAccount } from "./ValidationServiceConfig";
import {
  EXAMPLE_ACCOUNTS,
  VALIDATION_TYPE_OPTIONS,
  ValidationType,
} from "./ValidationServiceConfig";
import {
  submitValidationServicesRequest,
  generateAVSRequestData,
} from "./SubmitValidationServicesRequest";
import { useEnv } from "../../context/EnvContext";
import { useRequestPreview } from "../../context/RequestPreviewContext";
import { MockTierNotice } from "../../components/MockTierNotice";
import useSWRMutation from "swr/mutation";

interface ValidationFormValues {
  validationType: ValidationType | "";
  accountDetails: AVSAccountDetails | null;
}

interface ValidationServicesInputFormProps {
  exampleAccounts?: NamedExampleAccount[];
  onValidationComplete?: (validationData: ValidationHistory) => void;
}

const ValidationServicesInputForm: React.FC<
  ValidationServicesInputFormProps
> = ({ exampleAccounts = EXAMPLE_ACCOUNTS, onValidationComplete }) => {
  const { url, environment } = useEnv();
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

  const accountNumberOptions = exampleAccounts.map((example) => ({
    label: `${example.label} (…${example.account.accountNumber}) — ${example.expectedOutcome}`,
    value: JSON.stringify(example.account),
  }));

  const handleSubmit = async (values: ValidationFormValues) => {
    const requestData = getRequestData();
    const requestPayload = requestData.body;

    const response = await trigger({ body: requestPayload });

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
    <>
      <MockTierNotice environment={environment} />
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
    </>
  );
};

export default ValidationServicesInputForm;
