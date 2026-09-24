import React from "react";
import { Anchor, Text } from "@mantine/core";

export const PoweredBy = ({
  apiName,
  apiUrl,
}: {
  apiName: string;
  apiUrl: string;
}) => (
  <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
    Powered by{" "}
    <Anchor
      href={apiUrl}
      target="_blank"
      rel="noopener noreferrer"
      size="xs"
      fw={600}
      c="pink"
      underline="always"
    >
      {apiName}
    </Anchor>{" "}
    →
  </Text>
);
