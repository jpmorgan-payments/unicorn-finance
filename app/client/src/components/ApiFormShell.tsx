import React, { ReactNode } from "react";
import { Box, Stack, Group, LoadingOverlay, Code, Button } from "@mantine/core";
import { PreviewRequestButton } from "./PreviewRequestButton";

/**
 * Shared three-state shell for the feature forms (Payments, Validations, FX,
 * Transactions). Renders the loading overlay, the idle form (the caller's
 * fields + a Preview button and the caller's action buttons), the success
 * result as pretty-printed JSON, and the error state - so every beat behaves
 * and looks identical and a new beat only supplies its fields.
 */
interface ApiFormShellProps {
  isMutating: boolean;
  data: unknown;
  error: unknown;
  /** Open the request preview drawer. */
  onPreview: () => void;
  previewDisabled: boolean;
  /** Reset the mutation + form (used by the success and error states). */
  onReset: () => void;
  /** Label for the button shown after a successful call. */
  resultActionLabel: string;
  /** Label for the button shown after an error (defaults to "Try Again"). */
  errorActionLabel?: string;
  /** The caller's Reset/Submit buttons, shown next to Preview in the idle state. */
  idleActions: ReactNode;
  /** The caller's form fields, shown in the idle state. */
  children: ReactNode;
  /** Optional extra content shown under the JSON result on success (e.g. a follow-up action). */
  successExtra?: ReactNode;
}

export const ApiFormShell: React.FC<ApiFormShellProps> = ({
  isMutating,
  data,
  error,
  onPreview,
  previewDisabled,
  onReset,
  resultActionLabel,
  errorActionLabel = "Try Again",
  idleActions,
  children,
  successExtra,
}) => (
  <Box
    component="form"
    onSubmit={(event) => event.preventDefault()}
    flex={1}
    style={{ position: "relative" }}
  >
    <LoadingOverlay
      visible={isMutating}
      zIndex={1000}
      overlayProps={{ radius: "md", blur: 2 }}
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
      <Stack gap="md">
        {children}
        <Group justify="space-between" mt="sm" gap="sm">
          <PreviewRequestButton onClick={onPreview} disabled={previewDisabled} />
          {idleActions}
        </Group>
      </Stack>
    )}

    {!!data && !isMutating && (
      <Stack gap="md">
        <Code block>{JSON.stringify(data, null, 2)}</Code>
        {successExtra}
        <Group justify="space-between" mt="sm" gap="sm">
          <PreviewRequestButton onClick={onPreview} disabled={previewDisabled} />
          <Button type="button" variant="filled" onClick={onReset}>
            {resultActionLabel}
          </Button>
        </Group>
      </Stack>
    )}

    {!!error && !isMutating && (
      <Stack gap="md">
        <Code block c="red">
          {`Error: ${(error as Error).message || "An unknown error occurred"}`}
        </Code>
        <Group justify="space-between" mt="sm" gap="sm">
          <PreviewRequestButton onClick={onPreview} disabled={previewDisabled} />
          <Button type="button" variant="outline" onClick={onReset}>
            {errorActionLabel}
          </Button>
        </Group>
      </Stack>
    )}
  </Box>
);
