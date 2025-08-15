import React, { useState } from "react";
import {
  Stepper,
  Button,
  Group,
  Code,
  Box,
  useCombobox,
  LoadingOverlay,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "./formElements/unicornDropdown";
import useSWRMutation from "swr/mutation";
import avsTemplate from "./jsonStubs/accountValidation.json";
import globalPaymentsTemplate from "./jsonStubs/globalPayments.json";

interface PaymentFormProps {
  supportedPaymentMethods: string[];
  toAccountDetails: {
    accountNumber: string;
    financialInstitutionId: {
      clearingSystemId: {
        id: string;
        idType: string;
      };
    };
  }[];
}

const getCurrentAVSRequestBody = (formValues: any) => {
  const requestBody = JSON.parse(JSON.stringify(avsTemplate)); // Deep copy

  requestBody[0].requestId = "UF" + new Date().getTime();

  if (formValues.accountDetails) {
    try {
      requestBody[0].account = JSON.parse(formValues.accountDetails);
    } catch (e) {
      // If parsing fails, show the raw value
      requestBody[0].account = formValues.accountDetails;
    }
  }
  console.log("AVS Request Body:", requestBody);

  return requestBody;
};

async function validateAccountDetails(url: string, { arg }: { arg: string }) {
  // Parse the form values passed as arg
  const formValues = JSON.parse(arg);

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(getCurrentAVSRequestBody(formValues)),
    headers: {
      "Content-Type": "application/json",
      "x-client-id": import.meta.env.VITE_CLIENT_ID,
      "x-program-id": import.meta.env.VITE_PROGRAM_ID,
      "x-program-id-type": import.meta.env.VITE_PROGRAM_ID_TYPE,
    },
  });
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
}

async function submitPayment(url: string, { arg }: { arg: string }) {
  const formValues = JSON.parse(arg);
  console.log(url, formValues);
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(formValues),
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

const PaymentForm: React.FC<PaymentFormProps> = ({
  supportedPaymentMethods,
  toAccountDetails, //Account details to sent money to for AVS validation
}) => {
  const [active, setActive] = useState(0);
  const [showAVSRequestBody, setShowAVSRequestBody] = useState(false);
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
  } = useSWRMutation("/api/payment/v2/payments", submitPayment);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      paymentType: "US-RTP",
      accountDetails: "",
    },
  });
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const onSubmitValidation = () => {
    const values = form.getValues();
    console.log("Form submitted with values:", values);
    setShowAVSRequestBody(false);
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
            {...form.getInputProps("accountDetails")}
            options={toAccountDetails.map((account) => ({
              label: account.accountNumber,
              value: JSON.stringify(account),
            }))}
            key={form.key("accountDetails")}
          />

          {showAVSRequestBody && (
            <Code block mt="md">
              {JSON.stringify(
                getCurrentAVSRequestBody(form.getValues()),
                null,
                2,
              )}
            </Code>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAVSRequestBody(!showAVSRequestBody)}
            >
              {showAVSRequestBody ? "Hide" : "Show"} AVS Request Body
            </Button>
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
              )}
              {showAVSRequestBody && (
                <Code block mt="md">
                  Request:{" "}
                  {JSON.stringify(
                    getCurrentAVSRequestBody(form.getValues()),
                    null,
                    2,
                  )}
                </Code>
              )}
              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAVSRequestBody(!showAVSRequestBody)}
                >
                  {showAVSRequestBody ? "Hide" : "Show"} AVS Request Body
                </Button>
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
            options={supportedPaymentMethods.map((method) => ({
              label: method,
              value: method,
            }))}
            key={form.key("paymentType")}
          />
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
