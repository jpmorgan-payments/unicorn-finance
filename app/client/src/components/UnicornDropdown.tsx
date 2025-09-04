import React from "react";

import { Combobox, InputBase, useCombobox, Input } from "@mantine/core";

interface UnicornDropdownProps {
  options: {
    label: string;
    value: string;
  }[];
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  error?: React.ReactNode;
}

const UnicornDropdown: React.FC<UnicornDropdownProps> = ({
  options,
  value,
  onChange,
  defaultValue,
  error,
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [displayValue, setDisplayValue] = React.useState(value || defaultValue);
  return (
    <>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          const selectedOption = options.find((option) => option.value === val);
          setDisplayValue(selectedOption ? selectedOption.label : defaultValue);
          onChange?.(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            pointer
            rightSection={<Combobox.Chevron />}
            onClick={() => combobox.toggleDropdown()}
            rightSectionPointerEvents="none"
            error={error}
          >
            {displayValue || <Input.Placeholder>Pick value</Input.Placeholder>}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            {options.map((paymentType) => (
              <Combobox.Option
                key={paymentType.label}
                value={paymentType.value}
              >
                {paymentType.label}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
};

export default UnicornDropdown;
