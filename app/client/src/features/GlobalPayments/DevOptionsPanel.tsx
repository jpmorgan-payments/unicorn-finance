import React from "react";
import { Chip, Group, Paper, Stack, Text } from "@mantine/core";
import { Environment, useEnv } from "../../context/EnvContext";
import { useDeveloperMode } from "../../context/DeveloperModeContext";
import { CHAOS_SCENARIOS } from "../../mocks/chaosScenarios";
import { useDevOptions } from "./DevOptionsContext";

// Rendered at the top of the Payments page (under the Developer mode
// toggle), not inside the form itself - Local Mock only, and only when
// Developer mode is switched on.
export const DevOptionsPanel = () => {
  const { environment } = useEnv();
  const { developerMode } = useDeveloperMode();
  const { trackingMode, setTrackingMode, chaosScenario, setChaosScenario } =
    useDevOptions();

  if (environment !== Environment.LOCAL_MOCK || !developerMode) return null;

  return (
    <Paper withBorder radius="md" p="sm">
      <Stack gap={8}>
        <Text size="xs" fw={700} c="dimmed">
          Developer options
        </Text>
        <Group gap="xs" align="center">
          <Text size="xs" fw={500}>
            Tracking
          </Text>
          <Chip.Group
            multiple={false}
            value={trackingMode}
            onChange={(value) => setTrackingMode(value as "play" | "debug")}
          >
            <Group gap={4}>
              <Chip value="play" size="xs">
                Play
              </Chip>
              <Chip value="debug" size="xs">
                Debug
              </Chip>
            </Group>
          </Chip.Group>
        </Group>
        <Group gap="xs" align="center">
          <Text size="xs" fw={500}>
            Chaos
          </Text>
          <Chip.Group
            multiple={false}
            value={chaosScenario}
            onChange={(value) => setChaosScenario(value as typeof chaosScenario)}
          >
            <Group gap={4}>
              {CHAOS_SCENARIOS.map((scenario) => (
                <Chip key={scenario.value} value={scenario.value} size="xs">
                  {scenario.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Group>
      </Stack>
    </Paper>
  );
};
