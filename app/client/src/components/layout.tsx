import React from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import JsonDialog from "./json_dialog";
import { Sidebar } from "./sidebar";
import WhatAPI from "./what_api";
import ErrorFallback from "./error_fallback";

function Layout() {
  return (
    <div className="flex flex-col lg:flex-row h-full text-gray-900 min-h-screen w-full max-w-screen">
      <Sidebar />
      <main className="h-auto lg:h-full lg:min-h-screen lg:w-11/12 w-full">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Outlet />
          <JsonDialog />
          <WhatAPI />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default Layout;
