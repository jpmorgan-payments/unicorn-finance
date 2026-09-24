import React from "react";
import { Group, Text } from "@mantine/core";
import { KONAMI_CODE } from "../hooks/useSecretGarage";
import { useSecretGarageProgress } from "../context/SecretGarageContext";

const SYMBOLS: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  a: "A",
  b: "B",
};

// Shows how far through the Konami code the last keystrokes got, so the
// sequence feels discoverable instead of silent. Only visible mid-entry.
export const KonamiProgress: React.FC = () => {
  const { progress } = useSecretGarageProgress();

  if (progress === 0) return null;

  return (
    <Group
      gap={4}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        backgroundColor: "rgba(12, 6, 32, 0.85)",
        padding: "8px 12px",
        borderRadius: 8,
        pointerEvents: "none",
      }}
    >
      {KONAMI_CODE.map((key, i) => (
        <Text
          key={i}
          fw={700}
          size="sm"
          c={i < progress ? "pink" : "gray"}
          style={{ opacity: i < progress ? 1 : 0.35 }}
        >
          {SYMBOLS[key] ?? key.toUpperCase()}
        </Text>
      ))}
    </Group>
  );
};
