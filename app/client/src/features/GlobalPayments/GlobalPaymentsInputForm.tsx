import React, { useMemo, useState } from "react";
import {
  Stack,
  Button,
  Chip,
  Group,
  Box,
  Paper,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../../components/UnicornDropdown";
import { ApiFormShell } from "../../components/ApiFormShell";
import type {
  AccountDetails,
  PartyDetails,
  PaymentHistory,
} from "./GlobalPaymentTypes";
import {
  PaymentType,
  paymentTypes,
  getAccountDetailsForPaymentType,
} from "./GlobalPaymentsConfig";
import {
  generateGlobalPaymentsRequestData,
  submitGlobalPaymentsRequest,
} from "./SubmitGlobalPaymentsRequest";
import { PaymentStatusPanel } from "./PaymentStatusPanel";
import { CHAOS_SCENARIOS, type ChaosScenario } from "../../mocks/chaosScenarios";
import useSWRMutation from "swr/mutation";
import { Environment, useEnv } from "../../context/EnvContext";
import { useRequestPreview } from "../../context/RequestPreviewContext";

interface GlobalPaymentsFormValues {
  paymentType: PaymentType;
  debtorAccountDetails: AccountDetails | null;
  creditorAccountDetails: PartyDetails | null;
  amount: string;
}

interface GlobalPaymentsInputFormProps {
  onPaymentComplete?: (paymentData: PaymentHistory) => void;
}

const GlobalPaymentsInputForm: React.FC<GlobalPaymentsInputFormProps> = ({
  onPaymentComplete,
}) => {
  const { url, environment } = useEnv();
  const { openDrawer } = useRequestPreview();
  const isLocalMock = environment === Environment.LOCAL_MOCK;

  // Play/Debug tracking mode and Chaos scenario are local-mock-only: the mock
  // server is what actually steps through (or diverts) the status lifecycle.
  const [trackingMode, setTrackingMode] = useState<"play" | "debug">("play");
  const [chaosScenario, setChaosScenario] = useState<ChaosScenario>("none");

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    `${url}/api/digitalSignature/payment/v2/payments`,
    submitGlobalPaymentsRequest,
  );

  const form = useForm<GlobalPaymentsFormValues>({
    initialValues: {
      paymentType: paymentTypes[0].value as PaymentType,
      debtorAccountDetails: null,
      creditorAccountDetails: null,
      amount: "100",
    },
    validate: {
      paymentType: (value) => (value ? null : "Please select a payment type"),
      debtorAccountDetails: (value) =>
        value ? null : "Please select a debtor account",
      creditorAccountDetails: (value) =>
        value ? null : "Please select a creditor account",
      amount: (value) => {
        if (!value) return "Please enter an amount";
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) {
          return "Please enter a valid amount greater than 0";
        }
        return null;
      },
    },
  });

  // Get accounts based on selected payment type
  const availableDebtorAccounts = useMemo(() => {
    return getAccountDetailsForPaymentType(form.values.paymentType);
  }, [form.values.paymentType]);

  // For now, creditor accounts will be the same as debtor accounts
  // In a real implementation, these might be different
  const availableCreditorAccounts = useMemo(() => {
    return availableDebtorAccounts.map((account) => ({
      name: account.account.name,
      account: account.account.account,
    }));
  }, [availableDebtorAccounts]);

  const debtorAccountOptions = availableDebtorAccounts.map((account) => ({
    label: account.account.name,
    description: account.account.account.accountNumber,
    value: JSON.stringify(account),
  }));

  const creditorAccountOptions = availableCreditorAccounts.map((account) => ({
    label: account.name,
    description: account.account.accountNumber,
    value: JSON.stringify(account),
  }));

  const getRequestData = () => {
    return generateGlobalPaymentsRequestData(
      url,
      form.values.amount,
      form.values.paymentType,
      form.values.debtorAccountDetails as AccountDetails,
      form.values.creditorAccountDetails as PartyDetails,
    );
  };

  const handlePreviewRequest = () => {
    openDrawer(getRequestData(), null);
  };

  const handleSubmit = async (values: GlobalPaymentsFormValues) => {
    const requestData = getRequestData();
    const requestPayload = requestData.body;

    const response = await trigger({
      body: requestPayload,
      chaos: isLocalMock ? chaosScenario : undefined,
    });

    // `trigger` rejects on error, so reaching here means the call succeeded
    onPaymentComplete?.({
      requestId: requestPayload.paymentIdentifiers.endToEndId,
      paymentType: values.paymentType,
      accountNumber:
        values.debtorAccountDetails?.account.account.accountNumber || "Unknown",
      requestData,
      responseData: response,
      status: "Success",
    });
  };

  // Reset account selections when payment type changes
  const handlePaymentTypeChange = (value: string) => {
    form.setFieldValue("paymentType", value as PaymentType);
    // Clear account selections when payment type changes
    form.setFieldValue("debtorAccountDetails", null);
    form.setFieldValue("creditorAccountDetails", null);
  };

  return (
    <ApiFormShell
      isMutating={isMutating}
      data={data}
      error={error}
      onPreview={handlePreviewRequest}
      previewDisabled={!form.isValid()}
      onReset={() => {
        reset();
        form.reset();
      }}
      resultActionLabel="Make another payment"
      successExtra={
        data?.response?.paymentId ? (
          <PaymentStatusPanel
            url={url}
            paymentId={data.response.paymentId}
            mode={isLocalMock ? trackingMode : "debug"}
            scenario={isLocalMock ? chaosScenario : "none"}
          />
        ) : undefined
      }
      idleActions={
        <Group gap="sm">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={!form.isValid()}
            onClick={() => handleSubmit(form.values)}
          >
            Submit
          </Button>
        </Group>
      }
    >
      <Box>
        <label
          htmlFor="paymentType"
          className="uf-field-label"
        >
          Payment Type *
        </label>
        <UnicornDropdown
          options={paymentTypes}
          value={form.values.paymentType}
          onChange={handlePaymentTypeChange}
          error={form.errors.paymentType}
        />
      </Box>

      <Box>
        <label
          htmlFor="debtorAccountDetails"
          className="uf-field-label"
        >
          Debtor Account * (From account)
        </label>
        <UnicornDropdown
          options={debtorAccountOptions}
          value={
            form.values.debtorAccountDetails
              ? JSON.stringify(form.values.debtorAccountDetails)
              : ""
          }
          onChange={(value) => {
            const selectedAccount = value
              ? (JSON.parse(value) as AccountDetails)
              : null;
            form.setFieldValue("debtorAccountDetails", selectedAccount);
          }}
          key={`debtor-${form.values.paymentType}`}
          error={form.errors.debtorAccountDetails}
        />
      </Box>

      <Box>
        <label
          htmlFor="accountNumber"
          className="uf-field-label"
        >
          Creditor Account * (To account)
        </label>
        <UnicornDropdown
          options={creditorAccountOptions}
          value={
            form.values.creditorAccountDetails
              ? JSON.stringify(form.values.creditorAccountDetails)
              : ""
          }
          onChange={(value) => {
            const selectedAccount = value
              ? (JSON.parse(value) as PartyDetails)
              : null;
            form.setFieldValue("creditorAccountDetails", selectedAccount);
          }}
          key={`creditor-${form.values.paymentType}`}
          error={form.errors.creditorAccountDetails}
        />
      </Box>

      <Box>
        <label
          htmlFor="amount"
          className="uf-field-label"
        >
          Amount *
        </label>
        <TextInput
          id="amount"
          placeholder="0.00"
          value={form.values.amount}
          onChange={(event) =>
            form.setFieldValue("amount", event.currentTarget.value)
          }
          error={form.errors.amount}
          leftSection="$"
          type="number"
          step="0.01"
          min="0"
        />
      </Box>

      {isLocalMock && (
        // Mock-only knobs: how status tracking plays out after submit, and
        // which chaos scenario the mock server should inject.
        <Paper className="uf-empty" radius="md" p="sm">
          <Stack gap={8}>
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Text size="xs" fw={600} w={64} pt={4} style={{ flexShrink: 0 }}>
                Tracking
              </Text>
              <Chip.Group
                multiple={false}
                value={trackingMode}
                onChange={(value) => setTrackingMode(value as "play" | "debug")}
              >
                <Group gap={6} style={{ flex: 1 }}>
                  <Chip value="play" size="xs">
                    Play
                  </Chip>
                  <Chip value="debug" size="xs">
                    Debug
                  </Chip>
                </Group>
              </Chip.Group>
            </Group>
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Text size="xs" fw={600} w={64} pt={4} style={{ flexShrink: 0 }}>
                Chaos
              </Text>
              <Chip.Group
                multiple={false}
                value={chaosScenario}
                onChange={(value) => setChaosScenario(value as ChaosScenario)}
              >
                <Group gap={6} style={{ flex: 1 }}>
                  {CHAOS_SCENARIOS.map((scenario) => (
                    <Chip key={scenario.value} value={scenario.value} size="xs">
                      {scenario.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Group>
          </Stack>
        </Paper>
      )}
    </ApiFormShell>
  );
};

export default GlobalPaymentsInputForm;
