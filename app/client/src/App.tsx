import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";

import Layout from "./components/layout";
import AccountPage from "./pages/AccountPage";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentsPage2 from "./pages/PaymentsPage2";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

function App() {
  return (
    <AppContextProvider>
      <MantineProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<AccountPage />} />
            <Route path="accounts" element={<AccountPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="payments2" element={<PaymentsPage2 />} />
          </Route>
        </Routes>
      </MantineProvider>
    </AppContextProvider>
  );
}

export default App;
