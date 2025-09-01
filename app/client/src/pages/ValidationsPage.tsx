import React from "react";
import { Box, Flex, Group, Title } from "@mantine/core";
import Layout from "../componentsV2/Layout";
import EnvironmentSwitcher from "../componentsV2/EnvironmentSwitcher";
import ValidationServicesInputForm from "../features/ValidationServices/ValidationServicesInputForm";

const ValidationsPage: React.FC = () => {
  return (
    <Layout>
      <Group gap="xl">
        <Title order={1}>Validation Services</Title>
        <EnvironmentSwitcher />
      </Group>

      <Flex
        m="md"
        w={"100%"}
        gap="md"
        justify="space-between"
        align="center"
        direction={{ base: "column", sm: "row" }}
      >
        <ValidationServicesInputForm />
        <Box w="40%">
          <Title order={4}>Validation Requests and Callbacks</Title>
        </Box>
      </Flex>
    </Layout>
  );
};

export default ValidationsPage;
