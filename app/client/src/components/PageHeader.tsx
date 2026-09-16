import React, { ReactNode } from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

interface PageHeaderProps {
  title: string;
  /** Optional one-liner under the title. */
  description?: ReactNode;
  /** Right-aligned slot, e.g. the "Powered by" link. */
  aside?: ReactNode;
}

/** Consistent page title row: H1 on the left, an optional aside on the right. */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  aside,
}) => (
  <Group justify="space-between" align="flex-end" gap="md" wrap="wrap">
    <Stack gap={4}>
      <Title order={1}>{title}</Title>
      {description && (
        <Text c="dimmed" maw={760}>
          {description}
        </Text>
      )}
    </Stack>
    {aside}
  </Group>
);
