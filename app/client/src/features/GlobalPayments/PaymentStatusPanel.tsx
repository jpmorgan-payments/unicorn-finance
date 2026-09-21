import React, { useEffect, useRef, useState } from "react";
import { Badge, Box, Button, Group, Stack, Text } from "@mantine/core";
import { fetchPaymentStatus } from "./SubmitGlobalPaymentsRequest";
import { CHAOS_TRACKS, type ChaosScenario, type Stage } from "../../mocks/chaosScenarios";
import type { Environment } from "../../context/EnvContext";

interface PaymentStatusPanelProps {
  url: string;
  environment: Environment;
  paymentId: string;
  /**
   * "play" auto-advances on an interval until a terminal status is reached.
   * "debug" reverts to a manual "click to advance one step" button, rendered
   * as a stage track - both local-mock-only, since the mock server steps a
   * fixed lifecycle per call.
   */
  mode: "play" | "debug";
  /** Which chaos scenario (if any) this payment was submitted with - drives the Debug-mode stage track. */
  scenario: ChaosScenario;
}

const STATUS_COLOR: Record<string, string> = {
  RECEIVED: "gray",
  ACCEPTED: "blue",
  PROCESSING: "yellow",
  COMPLETED: "green",
  REJECTED: "red",
};

const REJECTION_MESSAGES: Record<string, string> = {
  FUNDS_CONTROL_FAILED: "Funds check failed.",
  FRAUD_HOLD: "Fraud hold - payment blocked.",
};

const STAGE_KIND_COLOR: Record<Stage["kind"], string> = {
  normal: "#22C55E",
  retry: "#F59E0B",
  error: "#EF4444",
};

const PLAY_POLL_INTERVAL_MS = 1200;

/**
 * A straight "tube" line of dots, one per stage in the payment's chaos-scenario
 * track. Dots already passed (or the current one) are filled in the color for
 * their kind - green for a normal stage, amber for an absorbed retry, red for
 * an error - so a failure or retry is flagged right at the stage it happened,
 * not just in a trailing message.
 */
const StageTrack: React.FC<{ track: Stage[]; stepIndex: number }> = ({
  track,
  stepIndex,
}) => (
  <Box style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
    {track.map((stage, idx) => {
      const reached = idx <= stepIndex;
      const isCurrent = idx === stepIndex;
      const color = reached ? STAGE_KIND_COLOR[stage.kind] : "#D1D5DB";
      return (
        <React.Fragment key={`${stage.paymentStatus}-${stage.paymentSubStatus}`}>
          {idx > 0 && (
            <Box
              style={{
                flex: 1,
                height: 2,
                marginTop: 7,
                background: idx <= stepIndex ? STAGE_KIND_COLOR[track[idx - 1].kind] : "#E5E7EB",
              }}
            />
          )}
          <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 64 }}>
            <Box
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: reached ? color : "#fff",
                border: `2px solid ${color}`,
                boxShadow: isCurrent ? `0 0 0 4px ${color}33` : undefined,
                transition: "background .2s, border-color .2s",
              }}
            />
            <Text
              size="xs"
              ta="center"
              c={reached ? undefined : "dimmed"}
              fw={isCurrent ? 700 : 500}
            >
              {stage.label}
            </Text>
          </Box>
        </React.Fragment>
      );
    })}
  </Box>
);

/**
 * Follow-up to a successful payment: GPI Payment Status Track and Trace
 * (GET /payments/{paymentId}/status).
 *
 * The mock server advances one status step per call for a given paymentId. In
 * "play" mode this component polls on an interval so the payment's lifecycle
 * (RECEIVED -> ACCEPTED -> PROCESSING -> COMPLETED, or a chaos-scenario
 * variant ending in REJECTED) just plays out. In "debug" mode it renders the
 * full stage track for the selected scenario and steps through it one click
 * at a time, so retries/errors are visible at the exact stage they occur.
 */
export const PaymentStatusPanel: React.FC<PaymentStatusPanelProps> = ({
  url,
  environment,
  paymentId,
  mode,
  scenario,
}) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);

  const isTerminal =
    status?.paymentStatus === "COMPLETED" || status?.paymentStatus === "REJECTED";

  const handleTrack = async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await fetchPaymentStatus(url, paymentId, environment));
      setStepIndex((i) => i + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to fetch payment status",
      );
    } finally {
      setLoading(false);
    }
  };

  // Track the latest terminal state in a ref so the polling interval (set up
  // once on mount) can stop itself without re-subscribing every tick.
  const isTerminalRef = useRef(isTerminal);
  isTerminalRef.current = isTerminal;

  useEffect(() => {
    if (mode !== "play") return;

    let cancelled = false;
    const tick = async () => {
      if (cancelled || isTerminalRef.current) return;
      try {
        const next = await fetchPaymentStatus(url, paymentId, environment);
        if (!cancelled) setStatus(next);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to fetch payment status",
          );
        }
      }
    };

    tick();
    const interval = setInterval(() => {
      if (isTerminalRef.current) {
        clearInterval(interval);
        return;
      }
      tick();
    }, PLAY_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rerun only when the tracked payment/mode changes
  }, [mode, url, paymentId, environment]);

  if (error) {
    return (
      <Text size="xs" c="red" mt="sm">
        {error}
      </Text>
    );
  }

  if (mode === "debug") {
    const track = CHAOS_TRACKS[scenario];
    return (
      <Stack gap={10} mt="sm">
        <StageTrack track={track} stepIndex={stepIndex} />
        {status?.paymentStatus === "REJECTED" && (
          <Text size="xs" c="red">
            {REJECTION_MESSAGES[status.paymentSubStatus] ?? "Payment rejected."}
          </Text>
        )}
        {status?.chaosHandled && (
          <Text size="xs" c="dimmed">
            Hiccup absorbed, retrying...
          </Text>
        )}
        {!isTerminal && (
          <Group>
            <Button
              variant="subtle"
              size="xs"
              loading={loading}
              onClick={handleTrack}
            >
              {status ? "Check again" : "Track this payment (GPI status)"}
            </Button>
          </Group>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={6} mt="sm">
      {status && (
        <Group gap="xs">
          <Badge size="sm" color={STATUS_COLOR[status.paymentStatus] ?? "gray"}>
            {status.paymentStatus}
          </Badge>
          <Text size="xs" c={status.paymentStatus === "REJECTED" ? "red" : "dimmed"}>
            {status.paymentStatus === "REJECTED"
              ? REJECTION_MESSAGES[status.paymentSubStatus] ?? "Payment rejected."
              : status.chaosHandled
                ? "Hiccup absorbed, retrying..."
                : status.gpi?.statusDescription}
          </Text>
        </Group>
      )}
    </Stack>
  );
};
