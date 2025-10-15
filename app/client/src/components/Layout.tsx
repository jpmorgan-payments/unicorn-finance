import React from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Sidebar } from "./Sidebar";
import ErrorFallback from "./ErrorFallback";
import { AppShell, Button, Container, Paper, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Environment } from "../context/EnvContext";
import EnvironmentSwitcher from "./EnvironmentSwitcher";

const DemoBar = () => (
  <Paper
    style={{
      backgroundColor: "#31A88C",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "8px",
    }}
  >
    <Text c="white" p="xs" style={{ flex: "1 1 auto", minWidth: "200px" }}>
      This web application is a demo showcase for J.P.Morgan Payments. This is
      not a real product.
    </Text>
    <Button
      visibleFrom="md"
      variant="demo"
      color="white"
      size="xs"
      m="xs"
      component="a"
      href="https://developer.payments.jpmorgan.com/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        whiteSpace: "normal",
        wordWrap: "break-word",
        textAlign: "center",
        minWidth: "120px",
        height: "auto",
        lineHeight: "1.2",
        flex: "0 0 auto",
      }}
    >
      Payments Developer Portal →
    </Button>
  </Paper>
);
function Layout() {
  const [mobileOpened] = useDisclosure();
  const [desktopOpened] = useDisclosure(true);
  console.log(mobileOpened, desktopOpened);
  return (
    <AppShell
      padding="md"
      layout="default"
      header={{ height: 50 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Header style={{ backgroundColor: "#31A88C" }} mb={20}>
        <DemoBar />
      </AppShell.Header>

      <AppShell.Navbar p="xs" visibleFrom="md">
        <EnvironmentSwitcher />
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Container hiddenFrom="md">
            <Sidebar />
            <EnvironmentSwitcher />
          </Container>
          <Outlet />
        </ErrorBoundary>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
