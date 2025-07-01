import React from "react";

import { Button, Group, useCombobox } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "./formElements/unicornDropdown";

interface InitPaymentFormProps {
  supportedPaymentMethods: string[];
}

const InitPaymentForm: React.FC<InitPaymentFormProps> = ({
  supportedPaymentMethods,
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      paymentType: "US-RTP",
    },
    onValuesChange: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <UnicornDropdown
        {...form.getInputProps("paymentType")}
        options={supportedPaymentMethods}
        key={form.key("paymentType")}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
};

export default InitPaymentForm;
