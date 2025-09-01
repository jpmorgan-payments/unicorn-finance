import React from "react";
import { Drawer, Stack, Text, Code } from "@mantine/core";
import { useRequestPreview } from "../context/RequestPreviewContext";

export const RequestPreviewDrawer: React.FC = () => {
  const { isDrawerOpen, requestData, responseData, closeDrawer } =
    useRequestPreview();

  return (
    <Drawer
      opened={isDrawerOpen}
      onClose={closeDrawer}
      title="Request Preview"
      position="right"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
    >
      {requestData && (
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              API Endpoint:
            </Text>
            <Code block>{requestData.endpoint}</Code>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Request Method:
            </Text>
            <Code>{requestData.method}</Code>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Headers:
            </Text>
            <Code block>{JSON.stringify(requestData.headers, null, 2)}</Code>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Request Body:
            </Text>
            {requestData.body ? (
              <Code block>{JSON.stringify(requestData.body, null, 2)}</Code>
            ) : (
              <Text c="dimmed" size="sm">
                No request body available.
              </Text>
            )}
          </div>
          {responseData && (
            <div>
              <Text size="sm" fw={500} mb="xs">
                Response Body:
              </Text>

              <Code block>{JSON.stringify(responseData, null, 2)}</Code>
            </div>
          )}
        </Stack>
      )}
    </Drawer>
  );
};
