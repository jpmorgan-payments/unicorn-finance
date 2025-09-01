import React from "react";
import {
  Button,
  Group,
  Code,
  Box,
  useCombobox,
  LoadingOverlay,
  NumberInput,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import useSWRMutation from "swr/mutation";

import UnicornDropdown from "../../componentsV2/UnicornDropdown";
import { useEnv } from "../../context/EnvContext";
import { AccountDetail } from "./GlobalPaymentsTypes";

interface PaymentFormProps {
  supportedPaymentMethods: string[];
  toAccountDetails: AccountDetail[];
}

interface FormValues {
  paymentType: string;
  accountDetails: string;
  amount?: number;
}

async function submitPayment(url: string, { arg }: { arg: string }) {
  const formValues: FormValues = JSON.parse(arg);

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(formValues),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("An error occurred while submitting the payment.");
  }

  return res.json();
}

const GlobalPaymentsInputForm: React.FC<PaymentFormProps> = ({
  supportedPaymentMethods,
  toAccountDetails,
}) => {
  const { url } = useEnv();

  // Form setup
  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      paymentType: "US-RTP",
      accountDetails: "",
    },
  });

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    `${url}/api/payment/v2/payments`,
    submitPayment,
  );

  const handleSubmit = () => {
    const values = form.getValues();
    console.log("Form submitted with values:", values);
    trigger(JSON.stringify(values));
  };
  const handlePreviewRequest = () => {
    // Implement preview logic if needed
    console.log("Preview Request clicked");
  };
  const paymentMethodOptions = supportedPaymentMethods.map((method) => ({
    label: method,
    value: method,
  }));

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
                {...form.getInputProps("paymentType")}
                options={paymentMethodOptions}
                key={form.key("paymentType")}
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
              <NumberInput
                {...form.getInputProps("amount")}
                key={form.key("amount")}
                label="Amount"
                decimalScale={2}
                fixedDecimalScale
                defaultValue={100}
                step={100}
                min={0.01}
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
                  onClick={handleSubmit}
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
export default GlobalPaymentsInputForm;
