import { Group, Chip, Tooltip } from "@mantine/core";
import React from "react";
import {
  useEnv,
  Environment,
  ENVIRONMENT_META,
  isEnvSelectable,
} from "../context/EnvContext";

const CheckIcon = () => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: "50%",
      backgroundColor: "#22c55e",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 6,
      flexShrink: 0,
    }}
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3L4.5 8.5L2 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// Graduation order: Local Mock -> JPMC Sandbox -> JPMC CAT.
const ENV_ORDER: Environment[] = [
  Environment.LOCAL_MOCK,
  Environment.JPMC_MOCK,
  Environment.JPMC_CAT,
];

const chipStyles = {
  root: {
    "&[dataChecked]": {
      backgroundColor: "white !important",
      color: "black !important",
      border: "1px solid #ccc !important",
      "&:hover": {
        backgroundColor: "white !important",
        color: "black !important",
        transform: "none !important",
        boxShadow: "none !important",
      },
    },
  },
  label: {
    color: "black",
    "&[dataChecked]": {
      fontWeight: "bold",
      "&:hover": { color: "black !important" },
    },
  },
};

const EnvironmentSwitcher = () => {
  const { environment, switchEnv } = useEnv();

  const onChange = (value: string) => {
    switchEnv(value as Environment);
  };

  return (
    <Chip.Group multiple={false} value={environment} onChange={onChange}>
      <Group
        gap={4}
        className="bg-gray-100 rounded-md"
        align="center"
        justify="center"
        p={4}
      >
        {ENV_ORDER.map((env) => {
          const { label, hint } = ENVIRONMENT_META[env];
          const selectable = isEnvSelectable(env);
          const tooltip = selectable ? hint : `${hint} (disabled - not configured)`;
          return (
            <Tooltip key={env} label={tooltip} multiline w={240} withArrow>
              {/* span wrapper so the tooltip still shows on a disabled chip */}
              <span>
                <Chip
                  radius="sm"
                  size="sm"
                  value={env}
                  icon={<CheckIcon />}
                  color="white"
                  variant="filled"
                  styles={chipStyles}
                  style={{ "--chip-hover": "white" }}
                  disabled={!selectable}
                >
                  {label}
                </Chip>
              </span>
            </Tooltip>
          );
        })}
      </Group>
    </Chip.Group>
  );
};

export default EnvironmentSwitcher;

// Toggles the API environment (Local Mock / JPMC Sandbox / JPMC CAT). The JPMC
// tiers are gated off until VITE_ENABLE_JPMC=true and the .env / certs are set up.
