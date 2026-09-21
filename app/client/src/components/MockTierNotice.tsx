import React from "react";
import { Alert } from "@mantine/core";
import { Environment } from "../context/EnvContext";

/**
 * Shown on beats that don't have a JPMC Mock-tier request adapter yet (only
 * Global Payments does, mapped to /payment/v2/payments - see
 * docs/NEXT-STEPS.md). Without this, switching to JPMC Mock would silently
 * send these beats' CAT/gateway-shaped requests against api-mock and 404.
 */
export const MockTierNotice: React.FC<{ environment: Environment }> = ({
  environment,
}) => {
  if (environment !== Environment.JPMC_MOCK) return null;

  return (
    <Alert color="yellow" variant="light" mb="md">
      No JPMC Mock adapter for this beat yet - see docs/NEXT-STEPS.md. Use
      Local Mock, or JPMC CAT if onboarded.
    </Alert>
  );
};
