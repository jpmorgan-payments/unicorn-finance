import React from "react";
import { Button } from "@mantine/core";

/**
 * "Preview Request" button shared by every feature form - opens the request
 * preview drawer so attendees can see the exact API call before sending it.
 */
export const PreviewRequestButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Button variant="light" size="md" onClick={onClick} disabled={disabled}>
    Preview Request
  </Button>
);
