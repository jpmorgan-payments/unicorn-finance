import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Anchor,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { KonamiProgress } from "../components/KonamiProgress";
import { PageHeader } from "../components/PageHeader";

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
    persona: "Treasury desks, marketplaces paying out, payroll & supplier payments, PSPs embedding payouts",
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
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <KonamiProgress />
      <PageHeader
        title="Unicorn Finance"
        description={
          <>
            A sample app showcasing J.P. Morgan Payments APIs. Pick what you
            are trying to do below - every call runs offline against a built-in
            mock, and the <strong>Preview Request</strong> drawer shows the
            exact API call. No keys needed to explore.
          </>
        }
      />

      <Title order={4}>What are you trying to do?</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="lg">
        {BEATS.map((b) => (
          <Card
            key={b.to}
            padding="lg"
            radius="lg"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(b.to)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(b.to);
            }}
          >
            <Stack gap="xs" h="100%">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Text fw={600} size="lg" lh={1.3}>
                  {b.api}
                </Text>
                <Badge variant="light" color="pink" size="sm">
                  {b.beat}
                </Badge>
              </Group>
              <Text size="sm" fw={500}>
                For: {b.persona}
              </Text>
              <Text size="sm" c="dimmed">
                {b.description}
              </Text>
              <Text size="sm" c="pink" fw={600} mt="auto" pt="sm">
                Try it →
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Text size="sm" c="dimmed" maw={760}>
        Everything here runs on <strong>Local Mock</strong> (offline, in this
        app) by default. When you're ready, it takes a few minutes to onboard
        at{" "}
        <Anchor
          href="https://developer.payments.jpmorgan.com"
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          c="pink"
          fw={500}
        >
          developer.payments.jpmorgan.com
        </Anchor>{" "}
        and get your own keys - then switch the environment (top-left) to
        JPMC Mock.
      </Text>
    </Stack>
  );
};

export default HomePage;
