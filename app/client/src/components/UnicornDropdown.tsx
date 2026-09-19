import React from "react";

import {
  Combobox,
  InputBase,
  useCombobox,
  Input,
  ScrollArea,
  Text,
} from "@mantine/core";

export interface UnicornDropdownOption {
  label: string;
  value: string;
  /** Secondary line in the dropdown (e.g. the account number). */
  description?: string;
}

interface UnicornDropdownProps {
  options: UnicornDropdownOption[];
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
  const [selected, setSelected] = React.useState<UnicornDropdownOption | null>(
    () => options.find((o) => o.value === (value || defaultValue)) ?? null,
  );

  // Keep the displayed option in step with the controlled value, so a
  // form.reset() clears the control instead of leaving the old label behind.
  React.useEffect(() => {
    if (value === undefined) return;
    const next = options.find((o) => o.value === value) ?? null;
    setSelected((prev) => (prev?.value === next?.value ? prev : next));
  }, [value, options]);

  // Full text for the native tooltip, so a truncated value is still readable.
  const selectedText = selected
    ? [selected.label, selected.description].filter(Boolean).join(" - ")
    : "";

  return (
    <>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          const selectedOption = options.find((option) => option.value === val);
          setSelected(selectedOption ?? null);
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
            title={selectedText || undefined}
            classNames={{ input: "uf-dropdown-input" }}
          >
            {selected ? (
              <span className="uf-dropdown-value">
                <span>{selected.label}</span>
                {selected.description && (
                  <span className="uf-dropdown-value-desc">
                    {selected.description}
                  </span>
                )}
              </span>
            ) : (
              <Input.Placeholder>Pick value</Input.Placeholder>
            )}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            <ScrollArea.Autosize mah={300} type="auto">
              {options.map((option) => (
                <Combobox.Option
                  key={option.label + option.value}
                  value={option.value}
                  className="uf-dropdown-option"
                >
                  <Text size="sm" fw={500} lh={1.3}>
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text size="xs" c="dimmed" lh={1.3} mt={2}>
                      {option.description}
                    </Text>
                  )}
                </Combobox.Option>
              ))}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
};

export default UnicornDropdown;
