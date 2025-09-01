import React from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import JsonDialog from "./json_dialog";
import { Sidebar } from "../componentsV2/Sidebar";
import WhatAPI from "./what_api";
import ErrorFallback from "../componentsV2/ErrorFallback";

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
