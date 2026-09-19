import React from "react";
import { Badge, Code, Drawer, Group, Stack, Text } from "@mantine/core";
import { useRequestPreview } from "../context/RequestPreviewContext";
import { JsonView } from "./JsonView";

const METHOD_COLOR: Record<string, string> = {
  GET: "teal",
  POST: "pink",
  PUT: "orange",
  PATCH: "orange",
  DELETE: "red",
};

export const RequestPreviewDrawer: React.FC = () => {
  const { isDrawerOpen, requestData, responseData, closeDrawer } =
    useRequestPreview();

  return (
    <Drawer
      opened={isDrawerOpen}
      onClose={closeDrawer}
      title="Request Preview"
      position="right"
      size="xl"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      styles={{
        title: { fontWeight: 600, fontSize: "var(--mantine-font-size-lg)" },
        content: { maxWidth: "100vw" },
      }}
    >
      {requestData && (
        <Stack gap="lg">
          <div>
            <Text size="sm" fw={600} mb={6}>
              API Endpoint:
            </Text>
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <Badge
                variant="light"
                color={METHOD_COLOR[requestData.method] ?? "gray"}
                radius="sm"
                size="lg"
                style={{ flexShrink: 0 }}
              >
                {requestData.method}
              </Badge>
              <Code block style={{ flex: 1, minWidth: 0 }}>
                {requestData.endpoint.replace("/cat-api", "").replace("/api", "")}
              </Code>
            </Group>
          </div>

          <div>
            <Text size="sm" fw={600} mb={6}>
              Request Method:
            </Text>
            <Code>{requestData.method}</Code>
          </div>

          <JsonView title="Headers" data={requestData.headers} maxHeight={260} />

          {requestData.body ? (
            <JsonView title="Request Body" data={requestData.body} />
          ) : (
            <div>
              <Text size="sm" fw={600} mb={6}>
                Request Body:
              </Text>
              <Text c="dimmed" size="sm">
                No request body available.
              </Text>
            </div>
          )}

          {responseData && (
            <JsonView title="Response Body" data={responseData} maxHeight={560} />
          )}
        </Stack>
      )}
    </Drawer>
  );
};
