import React from "react";
import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";

/**
 * Light / dark switch in the header. The choice is persisted by Mantine in
 * localStorage ("mantine-color-scheme-value") and pre-applied by the inline
 * script in index.html, so a reload never flashes the wrong scheme.
 */
export const ThemeToggle: React.FC = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = computed === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        className="uf-header-icon"
        variant="outline"
        color="white"
        size="md"
        radius="md"
        aria-label={label}
        onClick={() => setColorScheme(isDark ? "light" : "dark")}
      >
        <span className="material-icons-outlined" style={{ fontSize: 18 }}>
          {isDark ? "light_mode" : "dark_mode"}
        </span>
      </ActionIcon>
    </Tooltip>
  );
};
