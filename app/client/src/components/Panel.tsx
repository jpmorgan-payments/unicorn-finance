import React, { ReactNode } from "react";
import { Group, Paper, PaperProps, Stack, Title } from "@mantine/core";

interface PanelProps extends PaperProps {
  title: string;
  /** Right-aligned slot in the panel header (e.g. a "Clear History" button). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Bordered content panel with a compact title row. Every page uses it for
 * both the form column and the history column so padding, radius and title
 * sizing stay identical across features.
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  action,
  children,
  ...paperProps
}) => (
  <Paper
    className="uf-panel"
    radius="lg"
    p={{ base: "md", sm: "lg", xl: "xl" }}
    h="100%"
    {...paperProps}
  >
    <Stack gap="md" h="100%">
      <Group justify="space-between" align="center" wrap="nowrap" mih={28}>
        <Title order={4}>{title}</Title>
        {action}
      </Group>
      {children}
    </Stack>
  </Paper>
);
