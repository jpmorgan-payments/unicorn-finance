import React from "react";
import { Flex, Group, Title, Stack } from "@mantine/core";

import EnvironmentSwitcher from "../componentsV2/EnvironmentSwitcher";

import { useRequestPreview } from "../context/RequestPreviewContext";

const AccountsPage: React.FC = () => {
  const { openDrawer } = useRequestPreview();

  return (
    <>
      <Group gap="xl">
        <Title order={1}>Account Services</Title>
        <EnvironmentSwitcher />
      </Group>

      <Flex
        m="md"
        w={"100%"}
        gap="md"
        justify="space-between"
        align="flex-start"
        direction={{ base: "column", sm: "row" }}
      >
        <Stack align="stretch" justify="flex-start" flex={1}>
          <Title order={4}>Account Details</Title>
        </Stack>

        <Stack
          className="lg:w-1/2"
          justify="flex-start"
          flex={1}
          align="stretch"
        >
          <Group justify="space-between" mb="md">
            <Title order={4}>Transaction History</Title>
          </Group>
        </Stack>
      </Flex>
    </>
  );
};

export default AccountsPage;
