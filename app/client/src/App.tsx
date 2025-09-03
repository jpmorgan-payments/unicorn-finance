import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import { EnvProvider } from "./context/EnvContext";
import { RequestPreviewProvider } from "./context/RequestPreviewContext";

import Layout from "./componentsV2/Layout";
import PaymentsPage from "./pages/PaymentsPage";
import ValidationsPage from "./pages/ValidationsPage";
import { RequestPreviewDrawer } from "./componentsV2/RequestPreviewDrawer";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import AccountsPage from "./pages/AccountPagev2";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

function App() {
  return (
    <EnvProvider>
      <AppContextProvider>
        <RequestPreviewProvider>
          <MantineProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="validations" element={<ValidationsPage />} />
                <Route path="accounts2" element={<AccountsPage />} />
              </Route>
            </Routes>
            <RequestPreviewDrawer />
          </MantineProvider>
        </RequestPreviewProvider>
      </AppContextProvider>
    </EnvProvider>
  );
}

export default App;
