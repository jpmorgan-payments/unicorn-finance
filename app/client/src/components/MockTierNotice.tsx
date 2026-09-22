import React from "react";
import { Alert } from "@mantine/core";
import { Environment } from "../context/EnvContext";

/**
 * Shown on beats with no JPMC Mock-tier adapter. Global Payments and Account
 * Validation both have one now; FX doesn't because PDP offers no Mock server
 * for it at all (confirmed via its own published spec - see
 * docs/NEXT-STEPS.md), not because it's merely unwired.
 */
export const MockTierNotice: React.FC<{ environment: Environment }> = ({
  environment,
}) => {
  if (environment !== Environment.JPMC_MOCK) return null;

  return (
    <Alert color="yellow" variant="light" mb="md">
      No JPMC Mock tier for this beat - see docs/NEXT-STEPS.md. Use Local
      Mock instead.
    </Alert>
  );
};
