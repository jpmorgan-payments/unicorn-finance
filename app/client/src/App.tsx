import React from "react";
import { Route, Routes } from "react-router-dom";
import { EnvProvider } from "./context/EnvContext";
import { RequestPreviewProvider } from "./context/RequestPreviewContext";
import {
  MantineProvider,
  Button,
  Table,
  createTheme,
  Card,
} from "@mantine/core";

import Layout from "./components/Layout";
import PaymentsPage from "./pages/PaymentsPage";
import ValidationsPage from "./pages/ValidationsPage";
import { RequestPreviewDrawer } from "./components/RequestPreviewDrawer";
import "@mantine/core/styles.css";
import AccountsPage from "./pages/AccountPage";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

const theme = createTheme({
  components: {
    Button: Button.extend({
      classNames: (theme, params) => ({
        root: `
          ${params.variant === "filled" ? " !bg-gradient-to-r !from-pink-500 !to-red-500 !text-white !border-pink-500" : ""}
          ${params.variant === "outline" ? "!border-pink-500  hover:!bg-pink-600 !text-pink-500" : ""}
          ${params.variant === "light" ? "!bg-pink-50 !text-pink-600 !border-pink-200 hover:!bg-pink-100" : ""}
          ${params.disabled ? "!opacity-50 !cursor-not-allowed !bg-gray-300 !text-gray-500 !border-gray-300" : ""}
        `,
      }),
      defaultProps: {
        variant: "outline",
      },
    }),
    Table: Table.extend({
      classNames: (theme) => ({
        tr: "hover:!bg-pink-50",
      }),
    }),
    Card: Card.extend({
      classNames: (theme) => ({
        root: "hover:!shadow-lg transition-shadow duration-300 hover:!bg-pink-50",
      }),
    }),
  },
});

function App() {
  return (
    <EnvProvider>
      <RequestPreviewProvider>
        <MantineProvider theme={theme}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ValidationsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="validations" element={<ValidationsPage />} />
              <Route path="accounts" element={<AccountsPage />} />
            </Route>
          </Routes>
          <RequestPreviewDrawer />
        </MantineProvider>
      </RequestPreviewProvider>
    </EnvProvider>
  );
}

export default App;
