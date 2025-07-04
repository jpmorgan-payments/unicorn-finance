import React from "react";

import { Button, Group, useCombobox } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "./formElements/unicornDropdown";
import useSWRMutation from "swr/mutation";
import { fetcher } from "../../App";
import { on } from "events";

interface InitPaymentFormProps {
  supportedPaymentMethods: string[];
}

async function validateAccountDetails(url: string, { arg }: { arg: string }) {
  await fetch(url, {
    method: "POST",
    body: arg,
  });
}

const PaymentForm: React.FC<InitPaymentFormProps> = ({
  supportedPaymentMethods,
}) => {
  const { trigger, data, error } = useSWRMutation(
    "/api/tsapi/v2/validation/accounts",
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

  const onSubmit = (values: { paymentType: string }) => {
    console.log("Form submitted with values:", values);
    trigger(JSON.stringify(values));
  };

  return (
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
  );
};

export default PaymentForm;
