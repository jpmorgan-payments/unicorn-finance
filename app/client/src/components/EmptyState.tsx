import React, { ReactNode } from "react";
import { Paper, Text } from "@mantine/core";

/** Dashed placeholder for a history/table area with nothing in it yet. */
export const EmptyState: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Paper className="uf-empty" radius="md" p="xl">
    <Text size="sm" c="dimmed" ta="center">
      {children}
    </Text>
  </Paper>
);
