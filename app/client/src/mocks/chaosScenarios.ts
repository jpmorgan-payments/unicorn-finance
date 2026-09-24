// Shared between the mock handlers and the (production-bundled) Global
// Payments form, so this stays free of any `msw`/mock-fixture imports.
export type ChaosScenario =
  | "none"
  | "operational"
  | "funds-control"
  | "fraud-hold";

export const CHAOS_SCENARIOS: { value: ChaosScenario; label: string }[] = [
  { value: "none", label: "None" },
  { value: "operational", label: "Operational hiccup" },
  { value: "funds-control", label: "Funds check failed" },
  { value: "fraud-hold", label: "Fraud hold" },
];

export function isChaosScenario(value: string | null): value is ChaosScenario {
  return CHAOS_SCENARIOS.some((s) => s.value === value);
}

// A stage in a payment's GPI status lifecycle, in display order. Shared by the
// mock's status-stepping logic (which attaches GPI codes) and the Debug-mode
// stage track UI (which just needs the label/kind), so the two never drift.
export type Stage = {
  paymentStatus: string;
  paymentSubStatus: string;
  label: string;
  kind: "normal" | "retry" | "error";
};

const RECEIVED: Stage = { paymentStatus: "RECEIVED", paymentSubStatus: "RECEIVED", label: "Received", kind: "normal" };
const ACCEPTED: Stage = { paymentStatus: "ACCEPTED", paymentSubStatus: "ACCEPTED", label: "Accepted", kind: "normal" };
const PROCESSING: Stage = { paymentStatus: "PROCESSING", paymentSubStatus: "SENT_TO_CLEARING", label: "Processing", kind: "normal" };
const RETRY: Stage = { paymentStatus: "PROCESSING", paymentSubStatus: "RETRYING_CLEARING_SUBMISSION", label: "Retry", kind: "retry" };
const COMPLETED: Stage = { paymentStatus: "COMPLETED", paymentSubStatus: "DELIVERED_TO_RECIPIENT", label: "Completed", kind: "normal" };
const FUNDS_REJECTED: Stage = { paymentStatus: "REJECTED", paymentSubStatus: "FUNDS_CONTROL_FAILED", label: "Funds check failed", kind: "error" };
const FRAUD_REJECTED: Stage = { paymentStatus: "REJECTED", paymentSubStatus: "FRAUD_HOLD", label: "Fraud hold", kind: "error" };

export const CHAOS_TRACKS: Record<ChaosScenario, Stage[]> = {
  none: [RECEIVED, ACCEPTED, PROCESSING, COMPLETED],
  operational: [RECEIVED, ACCEPTED, PROCESSING, RETRY, COMPLETED],
  "funds-control": [RECEIVED, ACCEPTED, FUNDS_REJECTED],
  "fraud-hold": [RECEIVED, ACCEPTED, FRAUD_REJECTED],
};
