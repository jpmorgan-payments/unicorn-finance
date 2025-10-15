import { Group, Chip } from "@mantine/core";
import React from "react";
import { useEnv, Environment } from "../context/EnvContext";

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

const EnvironmentSwitcher = () => {
  const { environment, switchEnv } = useEnv();

  const onChange = (value: string) => {
    switchEnv(value as Environment);
  };

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
        "&:hover": {
          color: "black !important",
        },
      },
    },
  };

  return (
    <Chip.Group multiple={false} value={environment} onChange={onChange}>
      <Group
        gap={0}
        className="bg-gray-100 rounded-md"
        align="center"
        justify="center"
        p={4}
      >
        <Chip
          radius="sm"
          size="sm"
          value={Environment.MOCKED}
          icon={<CheckIcon />}
          color="white"
          variant="filled"
          styles={chipStyles}
          style={{ "--chip-hover": "white" }}
        >
          Mock
        </Chip>
        <Chip
          radius="sm"
          size="sm"
          value={Environment.CAT}
          icon={<CheckIcon />}
          color="white"
          variant="filled"
          styles={chipStyles}
          style={{ "--chip-hover": "white" }}
        >
          CAT
        </Chip>
      </Group>
    </Chip.Group>
  );
};

export default EnvironmentSwitcher;

// This component can be used to toggle between different environments (e.g., MOCKED and CAT).
// It can be placed in the layout or header of the application to allow users to switch environments easily.
