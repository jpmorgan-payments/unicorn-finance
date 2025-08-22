import React from "react";
import PaymentForm from "../features/submitAndVerifyPayments/paymentStepperForm";
import { Grid, Group } from "@mantine/core";
import Layout from "../componentsV2/layout";
import EnvironmentSwitcher from "../componentsV2/environmentSwitcher";

const SUPPORTED_PAYMENT_METHODS = ["US-RTP", "SEPA"];

const TO_ACCOUNT_DETAILS = [
  {
    accountNumber: "123425",
    financialInstitutionId: {
      clearingSystemId: {
        id: "122199983",
        idType: "ABA",
      },
    },
  },
];

const PaymentsPage: React.FC = () => {
  return (
    <Layout>
      <div>
        <Group gap="xl">
          <h1>Payments Page 2</h1>
          <EnvironmentSwitcher />
        </Group>

        <Grid grow gutter={5}>
          <Grid.Col span={2}>
            <PaymentForm
              supportedPaymentMethods={SUPPORTED_PAYMENT_METHODS}
              toAccountDetails={TO_ACCOUNT_DETAILS}
            />
          </Grid.Col>
          <Grid.Col span="auto">2</Grid.Col>
        </Grid>
      </div>
    </Layout>
  );
};

export default PaymentsPage;
