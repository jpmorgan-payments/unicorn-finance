import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Sidebar from "../components/sidebar";
import ErrorFallback from "../components/error_fallback";

interface LayoutProps {
  children?: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row h-full text-gray-900 min-h-screen w-full max-w-screen">
      <Sidebar />
      <main className="h-auto lg:h-full lg:min-h-screen lg:w-11/12 w-full">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children ? children : <Outlet />}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default Layout;
