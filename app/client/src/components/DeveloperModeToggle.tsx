import React from "react";
import { Switch, Stack, Text } from "@mantine/core";
import { useEnv, Environment } from "../context/EnvContext";
import { useDeveloperMode } from "../context/DeveloperModeContext";

// Only meaningful on Local Mock today - it toggles Global Payments' Tracking
// (Play/Debug) and Chaos controls, which only exist against the in-browser mock.
const DeveloperModeToggle = () => {
  const { environment } = useEnv();
  const { developerMode, setDeveloperMode } = useDeveloperMode();

  if (environment !== Environment.LOCAL_MOCK) return null;

  return (
    <Stack gap={0} py="xs" px={4}>
      <Switch
        size="sm"
        label="Developer mode"
        checked={developerMode}
        onChange={(event) => setDeveloperMode(event.currentTarget.checked)}
        color="pink"
      />
      <Text size="xs" c="dimmed" ml={44}>
        Tracking & chaos controls
      </Text>
    </Stack>
  );
};

export default DeveloperModeToggle;
