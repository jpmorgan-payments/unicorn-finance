import React from "react";
import { Stack, Button, Group, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../submitAndVerifyPayments/formElements/unicornDropdown";

interface ValidationFormValues {
  validationType: string;
  accountNumber: string;
}

interface ValidationServicesInputFormProps {
  onSubmit?: (values: ValidationFormValues) => void;
  accountNumbers?: string[];
}

const ValidationServicesInputForm: React.FC<
  ValidationServicesInputFormProps
> = ({
  onSubmit,
  accountNumbers = [
    "123456789",
    "987654321",
    "555444333",
    "111222333",
    "999888777",
  ],
}) => {
  const form = useForm<ValidationFormValues>({
    initialValues: {
      validationType: "",
      accountNumber: "",
    },
    validate: {
      validationType: (value) =>
        value ? null : "Please select a validation type",
      accountNumber: (value) =>
        value ? null : "Please select an account number",
    },
  });

  const validationTypeOptions = [
    { label: "Verify and authenticate account", value: "authentication" },
    { label: "Account Confidence Score", value: "acs" },
  ];

  const accountNumberOptions = accountNumbers.map((account) => ({
    label: account,
    value: account,
  }));

  const handleSubmit = (values: ValidationFormValues) => {
    console.log("Form submitted with values:", values);
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Box>
          <label
            htmlFor="validationType"
            style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}
          >
            Validation Type *
          </label>
          <UnicornDropdown
            options={validationTypeOptions}
            value={form.values.validationType}
            onChange={(value) => form.setFieldValue("validationType", value)}
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
            value={form.values.accountNumber}
            onChange={(value) => form.setFieldValue("accountNumber", value)}
            error={form.errors.accountNumber}
          />
        </Box>

        <Group justify="flex-end" mt="md">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit">Submit</Button>
        </Group>
      </Stack>
    </Box>
  );
};

export default ValidationServicesInputForm;
