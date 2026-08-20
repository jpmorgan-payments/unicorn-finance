import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

interface BeatCard {
  to: string;
  beat: string; // the dimension this API owns
  api: string;
  persona: string; // who actually uses it
  description: string;
}

// One card per beat. Personas mirror "who actually uses it" from the workshop.
const BEATS: BeatCard[] = [
  {
    to: "/payments",
    beat: "Reach",
    api: "Global Payments",
    persona: "Marketplaces paying out, payroll & supplier payments, PSPs embedding payouts",
    description:
      "Move money across rails worldwide from one API - RTP, ACH, wires, cross-border.",
  },
  {
    to: "/fx",
    beat: "Speed",
    api: "FX Rate Sheet",
    persona: "Treasury desks and platforms pricing or settling in local currency",
    description:
      "Pull a real-time rate sheet - lockable (guaranteed) vs indicative rates before you move.",
  },
  {
    to: "/validations",
    beat: "Confidence",
    api: "Account Validation",
    persona: "AP / procurement onboarding suppliers, Confirmation of Payee",
    description:
      "Know the account is right before you pay it - a confidence score, not a yes/no.",
  },
  {
    to: "/accounts",
    beat: "Retrieve",
    api: "Balances & Transactions",
    persona: "Treasury & ops reconciling what they've sent and received",
    description:
      "The query side - retrieve balances and transactions to reconcile activity.",
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={1}>Unicorn Finance</Title>
        <Text c="dimmed" maw={760}>
          A sample app showcasing J.P. Morgan Payments APIs. Pick what you are
          trying to do below - every call runs offline against a built-in mock,
          and the <strong>Preview Request</strong> drawer shows the exact API
          call. No keys needed to explore.
        </Text>
      </Stack>

      <Title order={4}>What are you trying to do?</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {BEATS.map((b) => (
          <Card
            key={b.to}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: "pointer" }}
            onClick={() => navigate(b.to)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(b.to);
            }}
          >
            <Group justify="space-between" mb="xs" wrap="nowrap">
              <Text fw={600} size="lg">
                {b.api}
              </Text>
              <Badge className="!bg-pink-100 !text-pink-500 !border-pink-500">
                {b.beat}
              </Badge>
            </Group>
            <Text size="sm" fw={500} mb={4}>
              For: {b.persona}
            </Text>
            <Text size="sm" c="dimmed">
              {b.description}
            </Text>
            <Text size="sm" c="pink" mt="md" fw={500}>
              Try it →
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Text size="sm" c="dimmed" maw={760}>
        Everything here runs on <strong>Local Mock</strong> (offline, in this
        app). When you are ready, onboard at{" "}
        <a
          href="https://developer.payments.jpmorgan.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--mantine-color-pink-6)" }}
        >
          developer.payments.jpmorgan.com
        </a>{" "}
        and switch the environment (top-left) to JPMC Mock or JPMC CAT.
      </Text>
    </Stack>
  );
};

export default HomePage;
