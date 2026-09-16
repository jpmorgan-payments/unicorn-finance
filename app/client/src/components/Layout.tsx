import React from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import {
  AppShell,
  Box,
  Burger,
  Button,
  Container,
  Group,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Sidebar } from "./Sidebar";
import ErrorFallback from "./ErrorFallback";
import { ThemeToggle } from "./ThemeToggle";

// Fixed shell sizes. The header is taller on phones so the demo notice can
// wrap to two lines next to the burger and theme toggle.
const HEADER_HEIGHT = { base: 76, sm: 56 };
const NAVBAR_WIDTH = { sm: 240, xl: 264 };

function Layout() {
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();

  return (
    <AppShell
      padding={{ base: "md", md: "lg", xl: "xl" }}
      layout="default"
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: NAVBAR_WIDTH,
        breakpoint: "sm",
        collapsed: { mobile: !navOpened },
      }}
    >
      <AppShell.Header className="uf-header">
        <Group h="100%" px={{ base: "sm", sm: "md" }} gap="sm" wrap="nowrap">
          <Burger
            opened={navOpened}
            onClick={toggleNav}
            hiddenFrom="sm"
            size="sm"
            color="#fff"
            aria-label="Toggle navigation"
          />
          <Text
            c="white"
            fw={500}
            fz={{ base: "xs", sm: "sm" }}
            lh={1.35}
            style={{ flex: 1, minWidth: 0 }}
          >
            This web application is a demo showcase for J.P.Morgan Payments.
            This is not a real product.
          </Text>
          <Group gap="xs" wrap="nowrap">
            <Button
              visibleFrom="md"
              variant="demo"
              size="xs"
              component="a"
              href="https://developer.payments.jpmorgan.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Payments Developer Portal →
            </Button>
            <ThemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="uf-navbar">
        <Sidebar onNavigate={closeNav} />
      </AppShell.Navbar>

      <AppShell.Main>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Container size={1600} px={0}>
            <Box component="section">
              <Outlet />
            </Box>
          </Container>
        </ErrorBoundary>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
