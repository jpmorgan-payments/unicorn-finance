import React, { useState } from "react";
import {
  Stepper,
  Button,
  Group,
  TextInput,
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

const PaymentForm: React.FC<InitPaymentFormProps> = ({
  supportedPaymentMethods,
}) => {
  const [active, setActive] = useState(0);
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    "/api/tsapi/v2/validations/accounts",
    validateAccountDetails,
  );
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
    trigger(JSON.stringify(values));
    if (!isMutating) {
      nextStep();
    }
  };

  const onResetForm = () => {
    form.reset();
    combobox.resetSelectedOption();
    setActive(0);
    reset();
  };

  const onRetryValidation = () => {
    trigger(JSON.stringify(form.values));
  };

  const nextStep = () =>
    setActive((current) => {
      return current < 3 ? current + 1 : current;
    });

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Box pos="relative" m="md">
      <LoadingOverlay
        visible={isMutating}
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
          {error && !isMutating ? (
            <Box m="md">
              Error: {error.message}
              <Group justify="flex-end" mt="md">
                <Button type="button" onClick={onRetryValidation}>
                  Try Again
                </Button>
                <Button type="button" onClick={onResetForm}>
                  Reset form
                </Button>
              </Group>
            </Box>
          ) : (
            <div></div>
          )}
        </Stepper.Step>

        <Stepper.Step label="Final step" description="Social media">
          <TextInput
            label="Website"
            placeholder="Website"
            key={form.key("website")}
            {...form.getInputProps("website")}
          />
          <TextInput
            mt="md"
            label="GitHub"
            placeholder="GitHub"
            key={form.key("github")}
            {...form.getInputProps("github")}
          />
        </Stepper.Step>
        <Stepper.Completed>
          Completed! Form values:
          <Code block mt="xl">
            {JSON.stringify(form.getValues(), null, 2)}
          </Code>
        </Stepper.Completed>
      </Stepper>
    </Box>
  );
};
export default PaymentForm;
