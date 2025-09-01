import React from "react";
import { Stack, Button, Group, Box, LoadingOverlay, Code } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../submitAndVerifyPayments/formElements/unicornDropdown";
import { AVSAccountDetails } from "./validationServicesTypes";
import {
  DEFAULT_ACCOUNT_NUMBERS,
  VALIDATION_TYPE_OPTIONS,
  ValidationType,
} from "./validationServicesConfig";
import { submitValidationServicesRequest } from "./submitValidationServicesRequest";
import { useEnv } from "../../context/EnvContext";
import useSWRMutation from "swr/mutation";

interface ValidationFormValues {
  validationType: ValidationType | "";
  accountDetails: AVSAccountDetails | null;
}

interface ValidationServicesInputFormProps {
  accountDetails?: AVSAccountDetails[];
}

const ValidationServicesInputForm: React.FC<
  ValidationServicesInputFormProps
> = ({ accountDetails = DEFAULT_ACCOUNT_NUMBERS }) => {
  const { url } = useEnv();

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

  const accountNumberOptions = accountDetails.map((account) => ({
    label: account.accountNumber,
    value: JSON.stringify(account),
  }));

  const handleSubmit = (values: ValidationFormValues) => {
    console.log("Form submitted with values:", values);
    trigger({
      profileName: values.validationType,
      accountDetails: values.accountDetails as AVSAccountDetails,
    });
  };

  return (
    <Box component="form">
      <LoadingOverlay
        visible={isMutating}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      {!data && !error && !isMutating && (
        <Stack gap="md">
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

          <Group justify="flex-end" mt="md">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" onClick={() => handleSubmit(form.values)}>
              Submit
            </Button>
          </Group>
        </Stack>
      )}
      {data && !isMutating && (
        <Box>
          <Code block>{JSON.stringify(data, null, 2)}</Code>
          <Group justify="flex-end" mt="md">
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
          <Group justify="flex-end" mt="md">
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
