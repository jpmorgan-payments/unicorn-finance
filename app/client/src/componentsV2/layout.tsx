import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Sidebar } from "../components/sidebar";
import ErrorFallback from "../components/error_fallback";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface LayoutProps {
  children?: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened] = useDisclosure(true);
  return (
    <AppShell
      padding="md"
      layout="alt"
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Header p="xs" hiddenFrom="sm">
        <Sidebar />
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children ? children : <Outlet />}
        </ErrorBoundary>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
