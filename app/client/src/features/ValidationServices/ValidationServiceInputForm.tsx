import React, { useEffect } from "react";
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
  NON_US_EXAMPLE_ACCOUNTS,
  formatExampleAccountLabel,
  getValidationTypeOptions,
  isMockOnlyValidationType,
  ValidationType,
} from "./ValidationServiceConfig";
import {
  submitValidationServicesRequest,
  generateAVSRequestData,
} from "./SubmitValidationServicesRequest";
import { Environment, useEnv } from "../../context/EnvContext";
import { useRequestPreview } from "../../context/RequestPreviewContext";
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

  // The type list depends on the environment (some types are mock-only), so drop
  // a selection the new environment doesn't offer instead of sending it there.
  const validationTypeOptions = getValidationTypeOptions(environment);
  useEffect(() => {
    if (
      form.values.validationType &&
      !validationTypeOptions.some((o) => o.value === form.values.validationType)
    ) {
      form.setFieldValue("validationType", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rerun only when the environment changes
  }, [environment]);

  // Non-US validation needs an IBAN/SWIFT account, not the US ABA examples; swap
  // the account list (and clear a now-invalid pick) when the type crosses over.
  const accountKind = form.values.validationType === "non-us" ? "non-us" : "us";
  useEffect(() => {
    form.setFieldValue("accountDetails", null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the list of accounts changes
  }, [accountKind]);

  const getRequestData = () => {
    return generateAVSRequestData(
      url,
      environment,
      form.values.validationType,
      form.values.accountDetails as AVSAccountDetails,
      false, // Use masked headers for preview
    );
  };

  const handlePreviewRequest = () => {
    openDrawer(getRequestData(), null);
  };

  // The "Expect:" result is scripted per account by Local Mock only. JPMC Mock
  // ignores the account (its reply is keyed by the validation type), and the
  // Mock-only types return a fixed response too, so a hint would mislead there.
  const showOutcome =
    environment === Environment.LOCAL_MOCK &&
    !isMockOnlyValidationType(form.values.validationType);
  const accountNumberOptions = (
    accountKind === "non-us" ? NON_US_EXAMPLE_ACCOUNTS : exampleAccounts
  ).map((example) => ({
    label: formatExampleAccountLabel(example, showOutcome),
    value: JSON.stringify(example.account),
  }));

  const handleSubmit = async (values: ValidationFormValues) => {
    const requestData = getRequestData();
    const requestPayload = requestData.body;

    const response = await trigger({
      body: requestPayload,
      environment,
      profileName: values.validationType,
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
          // UnicornDropdown keeps its own displayed label, so remount it when
          // the environment (and with it the option list) changes.
          key={environment}
          options={validationTypeOptions}
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
          Account to validate *
        </label>
        <UnicornDropdown
          // Remount so the displayed label follows the swapped account list and
          // the show/hide of the "Expect:" hint.
          key={`${accountKind}-${showOutcome}`}
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
