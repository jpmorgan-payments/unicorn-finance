import { Switch, Group } from "@mantine/core";
import React from "react";
import { useEnv, Environment } from "../context/EnvContext";

const EnvironmentSwitcher = () => {
  const { environment, switchEnv } = useEnv();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switchEnv(
      event.currentTarget.checked ? Environment.MOCKED : Environment.CAT,
    );
  };
  return (
    <Group justify="center">
      <Switch
        size="xl"
        onLabel={Environment.MOCKED}
        offLabel={Environment.CAT}
        checked={environment === Environment.MOCKED}
        onChange={onChange}
      />
    </Group>
  );
};

export default EnvironmentSwitcher;

// This component can be used to toggle between different environments (e.g., MOCKED and CAT).
// It can be placed in the layout or header of the application to allow users to switch environments easily.
