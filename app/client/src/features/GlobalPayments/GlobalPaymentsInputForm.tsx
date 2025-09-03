import React, { useMemo } from "react";
import {
  Stack,
  Button,
  Group,
  Box,
  TextInput,
  LoadingOverlay,
  Code,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../../componentsV2/UnicornDropdown";
import {
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
import useSWRMutation from "swr/mutation";
import { useEnv } from "../../context/EnvContext";
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
  const { url } = useEnv();
  const { openDrawer } = useRequestPreview();

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
    return getAccountDetailsForPaymentType(form.values.paymentType).map(
      (account) => ({
        name: account.account.name,
        account: account.account.account,
      }),
    );
  }, [form.values.paymentType]);

  const debtorAccountOptions = availableDebtorAccounts.map((account) => ({
    label: account.account.name + " - " + account.account.account.accountNumber,
    value: JSON.stringify(account),
  }));

  const creditorAccountOptions = availableCreditorAccounts.map((account) => ({
    label: account.name + " - " + account.account.accountNumber,
    value: JSON.stringify(account),
  }));

  const handleSubmit = async (values: GlobalPaymentsFormValues) => {
    const requestData = getRequestData();
    const requestPayload = requestData.body;
    if (!onPaymentComplete) {
      // Just make the API call without saving if no callback
      await trigger({
        amount: values.amount,
        paymentType: values.paymentType,
        debtorDetails: values.debtorAccountDetails as AccountDetails,
        creditorDetails: values.creditorAccountDetails as PartyDetails,
      });
      return;
    }
    // Base payment data
    const basePaymentData = {
      requestId: requestPayload.paymentIdentifiers.endToEndId,
      paymentType: values.paymentType,
      accountNumber:
        values.debtorAccountDetails?.account.account.accountNumber || "Unknown",
      requestPayload: requestPayload,
    };
    const response = await trigger({
      amount: values.amount,
      paymentType: values.paymentType,
      debtorDetails: values.debtorAccountDetails as AccountDetails,
      creditorDetails: values.creditorAccountDetails as PartyDetails,
    });

    onPaymentComplete({
      ...basePaymentData,
      requestData: getRequestData(),
      responseData: response,
      status: response.title || "",
    });
  };

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

  // Reset account selections when payment type changes
  const handlePaymentTypeChange = (value: string) => {
    form.setFieldValue("paymentType", value as PaymentType);
    // Clear account selections when payment type changes
    form.setFieldValue("debtorAccountDetails", null);
    form.setFieldValue("creditorAccountDetails", null);
  };

  const PreviewRequestButton = () => (
    <Button
      variant="light"
      size="md"
      onClick={handlePreviewRequest}
      disabled={!form.isValid()}
    >
      Preview Request
    </Button>
  );

  return (
    <Box component="form" flex={1} pos={"relative"}>
      <LoadingOverlay
        visible={isMutating}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "pink", type: "bars" }}
      />

      {isMutating && (
        <Box
          style={{
            minHeight: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>Loading...</div>
        </Box>
      )}

      {!data && !error && !isMutating && (
        <Box style={{ position: "relative" }}>
          <Stack gap="md">
            <Box>
              <label
                htmlFor="paymentType"
                style={{
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "block",
                }}
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
                style={{
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "block",
                }}
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
                style={{
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "block",
                }}
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
                style={{
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "block",
                }}
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

            <Group justify="space-between" mt="md">
              <PreviewRequestButton />

              <Group>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
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
            </Group>
          </Stack>
        </Box>
      )}
      {data && !isMutating && (
        <Box>
          <Code block>{JSON.stringify(data, null, 2)}</Code>
          <Group justify="space-between" mt="md">
            <PreviewRequestButton />

            <Button
              type="button"
              variant="filled"
              onClick={() => {
                reset();
                form.reset();
              }}
            >
              Make another payment
            </Button>
          </Group>
        </Box>
      )}
      {error && !isMutating && (
        <Box>
          <Code block>
            {`Error: ${
              (error as Error).message || "An unknown error occurred"
            }`}
          </Code>
          <Group justify="space-between" mt="md">
            <PreviewRequestButton />

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(form.values)}
            >
              Try Again
            </Button>
          </Group>
        </Box>
      )}
    </Box>
  );
};

export default GlobalPaymentsInputForm;
