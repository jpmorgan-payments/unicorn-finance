import React from "react";
import { Button, Group, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import UnicornDropdown from "../../components/UnicornDropdown";
import { ApiFormShell } from "../../components/ApiFormShell";
import type { FXHistory } from "./FXTypes";
import { DEFAULT_FX_ACCOUNTS, BASE_CURRENCY_OPTIONS } from "./FXConfig";
import {
  submitFXRequest,
  generateFXRequestData,
  FX_RATE_SHEET_PATH,
} from "./SubmitFXRequest";
import { useEnv } from "../../context/EnvContext";
import { useRequestPreview } from "../../context/RequestPreviewContext";
import useSWRMutation from "swr/mutation";

interface FXFormValues {
  accountId: string;
  currency: string;
}

interface FXInputFormProps {
  onRateSheetComplete?: (data: FXHistory) => void;
}

const FXInputForm: React.FC<FXInputFormProps> = ({ onRateSheetComplete }) => {
  const { url } = useEnv();
  const { openDrawer } = useRequestPreview();

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    `${url}${FX_RATE_SHEET_PATH}`,
    submitFXRequest,
  );

  const form = useForm<FXFormValues>({
    initialValues: {
      accountId: "",
      currency: "",
    },
    validate: {
      accountId: (value) => (value ? null : "Please select an account"),
      currency: (value) => (value ? null : "Please select a base currency"),
    },
  });

  const getRequestData = () => {
    return generateFXRequestData(
      url,
      form.values.accountId,
      form.values.currency,
      false, // masked headers for preview
    );
  };

  const handlePreviewRequest = () => {
    openDrawer(getRequestData(), null);
  };

  const handleSubmit = async (values: FXFormValues) => {
    if (!onRateSheetComplete) {
      await trigger({ accountId: values.accountId, currency: values.currency });
      return;
    }

    const response = await trigger({
      accountId: values.accountId,
      currency: values.currency,
    });

    onRateSheetComplete({
      accountId: values.accountId,
      currency: values.currency,
      requestData: getRequestData(),
      responseData: response,
      // `trigger` rejects on error, so reaching here means the call succeeded
      status: "Success",
    });
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
      resultActionLabel="Get another rate sheet"
      idleActions={
        <Group>
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
          htmlFor="accountId"
          style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}
        >
          Account *
        </label>
        <UnicornDropdown
          options={DEFAULT_FX_ACCOUNTS}
          value={form.values.accountId}
          onChange={(value) => form.setFieldValue("accountId", value)}
          error={form.errors.accountId}
        />
      </Box>

      <Box>
        <label
          htmlFor="currency"
          style={{ fontWeight: 500, marginBottom: "8px", display: "block" }}
        >
          Base Currency *
        </label>
        <UnicornDropdown
          options={BASE_CURRENCY_OPTIONS}
          value={form.values.currency}
          onChange={(value) => form.setFieldValue("currency", value)}
          error={form.errors.currency}
        />
      </Box>
    </ApiFormShell>
  );
};

export default FXInputForm;
