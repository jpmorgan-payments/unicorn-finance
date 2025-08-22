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
import useSWRMutation from "swr/mutation";

import UnicornDropdown from "./formElements/unicornDropdown";
import avsTemplate from "./jsonStubs/accountValidation.json";
import { useEnv } from "../../context/EnvContext";

interface PaymentFormProps {
  supportedPaymentMethods: string[];
  toAccountDetails: AccountDetail[];
}

interface AccountDetail {
  accountNumber: string;
  financialInstitutionId: {
    clearingSystemId: {
      id: string;
      idType: string;
    };
  };
}

interface FormValues {
  paymentType: string;
  accountDetails: string;
  amount?: number;
}

// Utility function to generate AVS request body
const generateAVSRequestBody = (formValues: FormValues) => {
  const requestBody = JSON.parse(JSON.stringify(avsTemplate)); // Deep copy
  requestBody[0].requestId = "UF" + new Date().getTime();

  if (formValues.accountDetails) {
    try {
      requestBody[0].account = JSON.parse(formValues.accountDetails);
    } catch (e) {
      // If parsing fails, use the raw value
      requestBody[0].account = formValues.accountDetails;
    }
  }

  console.log("AVS Request Body:", requestBody);
  return requestBody;
};

// API functions
async function validateAccountDetails(url: string, { arg }: { arg: string }) {
  const formValues: FormValues = JSON.parse(arg);

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(generateAVSRequestBody(formValues)),
    headers: {
      "Content-Type": "application/json",
      "x-client-id": import.meta.env.VITE_CLIENT_ID,
      "x-program-id": import.meta.env.VITE_PROGRAM_ID,
      "x-program-id-type": import.meta.env.VITE_PROGRAM_ID_TYPE,
    },
  });

  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }

  return res.json();
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

const PaymentForm: React.FC<PaymentFormProps> = ({
  supportedPaymentMethods,
  toAccountDetails,
}) => {
  const { url } = useEnv();
  const [active, setActive] = useState(0);
  const [showAVSRequestBody, setShowAVSRequestBody] = useState(false);

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

  // API mutations
  const {
    trigger: accountValidationTrigger,
    data: accountValidationData,
    error: accountValidationError,
    isMutating: accountValidationIsMutating,
    reset: accountValidationReset,
  } = useSWRMutation(
    `${url}/api/tsapi/v2/validations/accounts`,
    validateAccountDetails,
  );

  const {
    trigger: initPaymentTrigger,
    data: initPaymentData,
    error: initPaymentError,
    isMutating: initPaymentIsMutating,
    reset: initPaymentReset,
  } = useSWRMutation(`${url}/api/payment/v2/payments`, submitPayment);

  // Event handlers
  const handleValidationSubmit = () => {
    const values = form.getValues();
    console.log("Form submitted with values:", values);
    setShowAVSRequestBody(false);
    accountValidationTrigger(JSON.stringify(values));
    if (!accountValidationIsMutating) {
      nextStep();
    }
  };

  const handlePaymentSubmit = () => {
    const values = form.getValues();
    console.log("Form submitted with values:", values);
    initPaymentTrigger(JSON.stringify(values));
    if (!initPaymentIsMutating) {
      nextStep();
    }
  };

  const handleFormReset = () => {
    form.reset();
    combobox.resetSelectedOption();
    setActive(0);
    initPaymentReset();
    accountValidationReset();
  };

  const handleValidationRetry = () => {
    accountValidationTrigger(JSON.stringify(form.values));
  };

  const nextStep = () => {
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const toggleAVSRequestBody = () => {
    setShowAVSRequestBody(!showAVSRequestBody);
  };

  // Compute derived values
  const isLoading = accountValidationIsMutating || initPaymentIsMutating;
  const accountOptions = toAccountDetails.map((account) => ({
    label: account.accountNumber,
    value: JSON.stringify(account),
  }));
  const paymentMethodOptions = supportedPaymentMethods.map((method) => ({
    label: method,
    value: method,
  }));

  return (
    <Box pos="relative" m="md">
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Stepper active={active}>
        {/* Account Validation Step */}
        <Stepper.Step label="Account Validation">
          <UnicornDropdown
            {...form.getInputProps("accountDetails")}
            options={accountOptions}
            key={form.key("accountDetails")}
          />

          {showAVSRequestBody && (
            <Code block mt="md">
              {JSON.stringify(
                generateAVSRequestBody(form.getValues()),
                null,
                2,
              )}
            </Code>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="outline" size="sm" onClick={toggleAVSRequestBody}>
              {showAVSRequestBody ? "Hide" : "Show"} AVS Request Body
            </Button>
            <Button
              type="button"
              onClick={handleValidationSubmit}
              disabled={!form.values.accountDetails}
            >
              Validate Account Details
            </Button>
          </Group>
        </Stepper.Step>

        {/* Validation Results Step */}
        <Stepper.Step label="Validation Results">
          {accountValidationError && !accountValidationIsMutating ? (
            <>
              Error: {accountValidationError.message}
              <Group justify="flex-end" mt="md">
                <Button type="button" onClick={handleValidationRetry}>
                  Try Again
                </Button>
                <Button type="button" onClick={handleFormReset}>
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
                    generateAVSRequestBody(form.getValues()),
                    null,
                    2,
                  )}
                </Code>
              )}
              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAVSRequestBody}
                >
                  {showAVSRequestBody ? "Hide" : "Show"} AVS Request Body
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue with Payment
                </Button>
                <Button type="button" onClick={handleFormReset}>
                  Reset form
                </Button>
              </Group>
            </>
          )}
        </Stepper.Step>

        {/* Initialize Payment Step */}
        <Stepper.Step label="Initialise Payment">
          <UnicornDropdown
            {...form.getInputProps("paymentType")}
            options={paymentMethodOptions}
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
            <Button type="button" onClick={handleFormReset}>
              Reset form
            </Button>
            <Button type="button" onClick={handlePaymentSubmit}>
              Submit Payment
            </Button>
          </Group>
        </Stepper.Step>

        {/* Completion Step */}
        <Stepper.Completed>
          {initPaymentError ? (
            <>
              Payment Error: {initPaymentError.message}
              <Group justify="flex-end" mt="md">
                <Button type="button" onClick={handlePaymentSubmit}>
                  Try Again
                </Button>
                <Button type="button" onClick={handleFormReset}>
                  Reset form
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
