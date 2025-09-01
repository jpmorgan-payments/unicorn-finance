import React from "react";
import { Stack, Button, Group, Box, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../../componentsV2/UnicornDropdown";
import { AccountDetails } from "./GlobalPaymentsTypes";
import {
  PaymentType,
  PAYMENT_TYPE_OPTIONS,
  DEFAULT_ACCOUNT_OPTIONS,
} from "./GlobalPaymentsConfig";

interface GlobalPaymentsFormValues {
  paymentType: PaymentType | "";
  accountDetails: AccountDetails | null;
  amount: string;
}

interface GlobalPaymentsInputFormProps {
  accountDetails?: AccountDetails[];
  onSubmit?: (values: GlobalPaymentsFormValues) => void;
}

const GlobalPaymentsInputForm: React.FC<GlobalPaymentsInputFormProps> = ({
  accountDetails = DEFAULT_ACCOUNT_OPTIONS,
  onSubmit,
}) => {
  const form = useForm<GlobalPaymentsFormValues>({
    initialValues: {
      paymentType: "",
      accountDetails: null,
      amount: "",
    },
    validate: {
      paymentType: (value) => (value ? null : "Please select a payment type"),
      accountDetails: (value) => (value ? null : "Please select an account"),
      amount: (value) => {
        if (!value) return "Please enter an amount";
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) {
          return "Please enter a valid amount greater than 0";
        }
        return null;
      },
    },
  });

  const accountNumberOptions = accountDetails.map((account) => ({
    label: account.accountNumber,
    value: JSON.stringify(account),
  }));

  const handleSubmit = (values: GlobalPaymentsFormValues) => {
    console.log("Form submitted with values:", values);
    onSubmit?.(values);
  };

  return (
    <Box component="form" flex={1}>
      <Stack gap="md">
        <Box>
          <label
            htmlFor="paymentType"
            style={{
              fontWeight: 500,
              marginBottom: "8px",
              display: "block",
            }}
          >
            Payment Type *
          </label>
          <UnicornDropdown
            options={PAYMENT_TYPE_OPTIONS}
            value={form.values.paymentType}
            onChange={(value) =>
              form.setFieldValue("paymentType", value as PaymentType)
            }
            error={form.errors.paymentType}
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
                ? (JSON.parse(value) as AccountDetails)
                : null;
              form.setFieldValue("accountDetails", selectedAccount);
            }}
            error={form.errors.accountDetails}
          />
        </Box>

        <Box>
          <label
            htmlFor="amount"
            style={{
              fontWeight: 500,
              marginBottom: "8px",
              display: "block",
            }}
          >
            Amount *
          </label>
          <TextInput
            id="amount"
            placeholder="0.00"
            value={form.values.amount}
            onChange={(event) =>
              form.setFieldValue("amount", event.currentTarget.value)
            }
            error={form.errors.amount}
            leftSection="$"
            type="number"
            step="0.01"
            min="0"
          />
        </Box>

        <Group justify="space-between" mt="md">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
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
      </Stack>
    </Box>
  );
};

export default GlobalPaymentsInputForm;
