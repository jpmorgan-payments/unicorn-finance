import { Group, SegmentedControl, Stack, Text, Tooltip } from "@mantine/core";
import React from "react";
import {
  useEnv,
  Environment,
  ENVIRONMENT_META,
  isEnvSelectable,
} from "../context/EnvContext";

// Graduation order: Local Mock -> JPMC Sandbox -> JPMC CAT.
const ENV_ORDER: Environment[] = [
  Environment.LOCAL_MOCK,
  Environment.JPMC_MOCK,
  Environment.JPMC_CAT,
];

const EnvironmentSwitcher = () => {
  const { environment, switchEnv } = useEnv();

  const onChange = (value: string) => {
    switchEnv(value as Environment);
  };

  return (
    <Stack gap={6}>
      <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.04em">
        Environment
      </Text>
      <SegmentedControl
        className="uf-env-switch"
        orientation="vertical"
        fullWidth
        radius="md"
        size="sm"
        withItemsBorders={false}
        value={environment}
        onChange={onChange}
        data={ENV_ORDER.map((env) => {
          const { label, hint } = ENVIRONMENT_META[env];
          const selectable = isEnvSelectable(env);
          const tooltip = selectable
            ? hint
            : `${hint} (disabled - not configured)`;
          return {
            value: env,
            disabled: !selectable,
            label: (
              <Tooltip label={tooltip} multiline w={260} withArrow position="right">
                {/* span wrapper so the tooltip still shows on a disabled item */}
                <Group gap={8} wrap="nowrap" component="span" w="100%">
                  <span
                    className="uf-env-dot"
                    data-live={environment === env ? "" : undefined}
                    aria-hidden
                  />
                  <span>{label}</span>
                </Group>
              </Tooltip>
            ),
          };
        })}
      />
    </Stack>
  );
};

export default EnvironmentSwitcher;

// Toggles the API environment (Local Mock / JPMC Sandbox / JPMC CAT). The JPMC
// tiers are gated off until VITE_ENABLE_JPMC=true and the .env / certs are set up.
