import React, { useState } from "react";
import {
  Stepper,
  Button,
  Group,
  Code,
  Box,
  useCombobox,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "./formElements/unicornDropdown";
import useSWRMutation from "swr/mutation";

interface InitPaymentFormProps {
  supportedPaymentMethods: string[];
}

async function validateAccountDetails(url: string, { arg }: { arg: string }) {
  const res = await fetch(url, {
    method: "POST",
    body: arg,
  });
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
}

async function submitPayment(url: string, { arg }: { arg: string }) {
  const res = await fetch(url, {
    method: "POST",
    body: arg,
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const error = new Error("An error occurred while submitting the payment.");
    throw error;
  }
  return res.json();
}

const PaymentForm: React.FC<InitPaymentFormProps> = ({
  supportedPaymentMethods,
}) => {
  const [active, setActive] = useState(0);
  const {
    trigger: accountValidationTrigger,
    data: accountValidationData,
    error: accountValidationError,
    isMutating: accountValidationIsMutating,
    reset: accountValidationReset,
  } = useSWRMutation(
    "/api/tsapi/v2/validations/accounts",
    validateAccountDetails,
  );
  const {
    trigger: initPaymentTrigger,
    data: initPaymentData,
    error: initPaymentError,
    isMutating: initPaymentIsMutating,
    reset: initPaymentReset,
  } = useSWRMutation("/api/tsapi/v2/payments/submit", submitPayment);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      paymentType: "US-RTP",
    },
  });
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const onSubmitValidation = () => {
    const values = form.getValues();
    console.log("Form submitted with values:", values);
    accountValidationTrigger(JSON.stringify(values));
    if (!accountValidationIsMutating) {
      nextStep();
    }
  };

  const onSubmitPayment = () => {
    const values = form.getValues();
    console.log("Form submitted with values:", values);
    initPaymentTrigger(JSON.stringify(values));
    if (!initPaymentIsMutating) {
      nextStep();
    }
  };

  const onResetForm = () => {
    form.reset();
    combobox.resetSelectedOption();
    setActive(0);
    initPaymentReset();
    accountValidationReset();
  };

  const onRetryValidation = () => {
    accountValidationTrigger(JSON.stringify(form.values));
  };

  const nextStep = () =>
    setActive((current) => {
      return current < 3 ? current + 1 : current;
    });

  return (
    <Box pos="relative" m="md">
      <LoadingOverlay
        visible={accountValidationIsMutating || initPaymentIsMutating}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Stepper active={active}>
        <Stepper.Step label="Account Validation">
          <UnicornDropdown
            {...form.getInputProps("paymentType")}
            options={supportedPaymentMethods}
            key={form.key("paymentType")}
          />

          <Group justify="flex-end" mt="md">
            <Button type="button" onClick={onSubmitValidation}>
              Validate Account Details
            </Button>
          </Group>
        </Stepper.Step>

        <Stepper.Step label="Validation Results">
          {accountValidationError && !accountValidationIsMutating ? (
            <>
              Error: {accountValidationError.message}
              <Group justify="flex-end" mt="md">
                <Button type="button" onClick={onRetryValidation}>
                  Try Again
                </Button>
                <Button type="button" onClick={onResetForm}>
                  Reset form
                </Button>
              </Group>
            </>
          ) : (
            <>
              {accountValidationData && (
                <Code block mt="md">
                  Response: {JSON.stringify(accountValidationData, null, 2)}
                </Code>
              )}{" "}
              <Group justify="flex-end" mt="md">
                <Button type="button" onClick={nextStep}>
                  Continue with Payment
                </Button>
                <Button type="button" onClick={onResetForm}>
                  Reset form
                </Button>
              </Group>
            </>
          )}
        </Stepper.Step>

        <Stepper.Step label="Initialise Payment">
          <UnicornDropdown
            {...form.getInputProps("paymentType")}
            options={supportedPaymentMethods}
            key={form.key("paymentType")}
          />

          <Group justify="flex-end" mt="md">
            <Button type="button" onClick={onSubmitPayment}>
              Submit Payment
            </Button>
          </Group>
        </Stepper.Step>
        <Stepper.Completed>
          {initPaymentError ? (
            <>
              Payment Error: {initPaymentError.message}
              <Group justify="flex-end" mt="md">
                <Button type="button" onClick={onSubmitPayment}>
                  Try Again
                </Button>
              </Group>
            </>
          ) : (
            <>
              Payment Completed!
              {initPaymentData && (
                <Code block mt="md">
                  Response: {JSON.stringify(initPaymentData, null, 2)}
                </Code>
              )}
            </>
          )}
        </Stepper.Completed>
      </Stepper>
    </Box>
  );
};
export default PaymentForm;
