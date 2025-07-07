import React, { useEffect } from "react";

import { Button, Group, useCombobox, Box, LoadingOverlay } from "@mantine/core";
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
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    "/api/tsapi/v2/validations/accounts",
    validateAccountDetails,
  );

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      paymentType: "US-RTP",
    },
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  const onSubmit = (values: { paymentType: string }) => {
    console.log("Form submitted with values:", values);
    trigger(JSON.stringify(values));
  };

  const onResetForm = () => {
    form.reset();
    combobox.resetSelectedOption();
    reset();
  };

  const onRetryValidation = () => {
    trigger(JSON.stringify(form.values));
  };

  return (
    <Box pos="relative" m="md">
      <LoadingOverlay
        visible={isMutating}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
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
        <form onSubmit={form.onSubmit(onSubmit)}>
          <UnicornDropdown
            {...form.getInputProps("paymentType")}
            options={supportedPaymentMethods}
            key={form.key("paymentType")}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit">Validate Account Details</Button>
          </Group>
        </form>
      )}
    </Box>
  );
};

export default PaymentForm;
