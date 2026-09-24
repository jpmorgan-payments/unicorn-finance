import React from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  Anchor,
  Avatar,
  Box,
  Divider,
  Group,
  Image,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
  useComputedColorScheme,
} from "@mantine/core";
import EnvironmentSwitcher from "./EnvironmentSwitcher";

// Images
import ufLogoLarge from "../images/uf-logo.svg";
import ufLogoLargeDark from "../images/uf-logo-dark.svg";
import unicornMark from "../images/unicorn-mark.svg";
import github from "../images/github.png";

// Navigation configuration (Material Icons Outlined glyph names)
const links = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/payments", label: "Payments", icon: "payments" },
  { to: "/fx", label: "FX", icon: "currency_exchange" },
  { to: "/validations", label: "Validations", icon: "verified_user" },
];

const NavIcon = ({ name }: { name: string }) => (
  <span className="material-icons-outlined" style={{ fontSize: 20 }} aria-hidden>
    {name}
  </span>
);

interface SidebarProps {
  /** Called after a nav link is chosen - lets the mobile drawer close itself. */
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const colorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <Stack h="100%" gap={0}>
      <Box px="md" pt="lg" pb="md">
        <RouterNavLink to="/" onClick={onNavigate} style={{ display: "block" }}>
          {/* Navy wordmark on light, white wordmark on dark. */}
          <Image
            src={colorScheme === "dark" ? ufLogoLargeDark : ufLogoLarge}
            alt="Unicorn Finance Logo"
            w={168}
          />
        </RouterNavLink>
      </Box>

      <Box px="md" pb="md">
        <EnvironmentSwitcher />
      </Box>

      <Divider color="var(--uf-panel-border)" />

      <ScrollArea style={{ flex: 1 }} py="sm" type="never">
        <Stack gap={0}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              component={RouterNavLink}
              to={link.to}
              end={link.to === "/"}
              label={link.label}
              leftSection={<NavIcon name={link.icon} />}
              active={isActive(link.to)}
              onClick={onNavigate}
              className="uf-nav-link"
              variant="subtle"
              color="pink"
            />
          ))}
        </Stack>
      </ScrollArea>

      <Divider color="var(--uf-panel-border)" />

      <Stack gap="sm" px="md" py="md">
        <Anchor
          href="https://github.com/jpmorgan-payments/unicorn-finance"
          target="_blank"
          rel="noreferrer"
          size="xs"
          c="dimmed"
          underline="hover"
        >
          <Group gap={6} wrap="nowrap">
            <span>Github</span>
            <img
              src={github}
              alt="Github"
              width={16}
              height={16}
              className="dark:invert"
            />
          </Group>
        </Anchor>

        {/* Failsafe: click the unicorn to jump straight to the Payments
            Garage presentation, in case the Konami code isn't landing. */}
        <UnstyledButton
          onClick={() => {
            window.location.href = "/garage/index.html";
          }}
          title="Start the presentation"
          style={{ borderRadius: "var(--mantine-radius-md)" }}
        >
          <Group gap="sm" wrap="nowrap">
            <Avatar src={unicornMark} alt="Unicorn avatar" size="md" radius="md" />
            <Text size="sm" fw={600}>
              Business Unicorn
            </Text>
          </Group>
        </UnstyledButton>
      </Stack>
    </Stack>
  );
};
