import React from "react";
import { Grid, Group, Title } from "@mantine/core";
import Layout from "../componentsV2/layout";
import EnvironmentSwitcher from "../componentsV2/environmentSwitcher";
import ValidationServicesInputForm from "../features/validationServices/validationServicesInputForm";

const ValidationsPage: React.FC = () => {
  return (
    <Layout>
      <Group gap="xl">
        <Title order={1}>Validation Services</Title>
        <EnvironmentSwitcher />
      </Group>

      <Grid grow gutter={5}>
        <Grid.Col span={2}>
          <ValidationServicesInputForm />
        </Grid.Col>
        <Grid.Col span="auto">
          <Title order={4}>Validation Requests and Callbacks</Title>
        </Grid.Col>
      </Grid>
    </Layout>
  );
};

export default ValidationsPage;
