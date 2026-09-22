import React from "react";
import { Route, Routes } from "react-router-dom";
import { EnvProvider } from "./context/EnvContext";
import { RequestPreviewProvider } from "./context/RequestPreviewContext";
import { DeveloperModeProvider } from "./context/DeveloperModeContext";
import {
  MantineProvider,
  Button,
  Table,
  Card,
  Chip,
  Code,
  createTheme,
  rem,
} from "@mantine/core";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PaymentsPage from "./pages/PaymentsPage";
import ValidationsPage from "./pages/ValidationsPage";
import FxPage from "./pages/FxPage";
import { RequestPreviewDrawer } from "./components/RequestPreviewDrawer";
import "@mantine/core/styles.css";
import { SecretGarageProvider } from "./context/SecretGarageContext";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

const FONT_STACK =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Button variant -> look. Each class only sets Mantine's --button-* variables
// (see styles.css) so disabled/loading/focus states are untouched.
const BUTTON_VARIANT_CLASS: Record<string, string> = {
  filled: "uf-btn-filled",
  outline: "uf-btn-outline",
  light: "uf-btn-light",
  demo: "uf-btn-demo",
};

const theme = createTheme({
  // The signature pink. Shade 5 is the exact brand tone (#ec4899); the gradient
  // used by filled buttons runs from it into red-500.
  primaryColor: "pink",
  primaryShade: { light: 5, dark: 4 },
  colors: {
    pink: [
      "#fdf2f8",
      "#fce7f3",
      "#fbcfe8",
      "#f9a8d4",
      "#f472b6",
      "#ec4899",
      "#db2777",
      "#be185d",
      "#9d174d",
      "#831843",
    ],
  },
  defaultGradient: { from: "#ec4899", to: "#ef4444", deg: 90 },
  fontFamily: FONT_STACK,
  fontFamilyMonospace:
    'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
  defaultRadius: "md",
  // Slightly larger than Mantine's defaults so table cells, hints and chips
  // stay legible when the app is projected. styles.css also bumps
  // --mantine-scale on very wide viewports, which multiplies all of these.
  fontSizes: {
    xs: rem(13),
    sm: rem(14.5),
    md: rem(16),
    lg: rem(18),
    xl: rem(21),
  },
  headings: {
    fontFamily: FONT_STACK,
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(32), lineHeight: "1.2" },
      h2: { fontSize: rem(26), lineHeight: "1.25" },
      h3: { fontSize: rem(21), lineHeight: "1.3" },
      h4: { fontSize: rem(17), lineHeight: "1.4", fontWeight: "600" },
    },
  },
  components: {
    Button: Button.extend({
      defaultProps: { variant: "outline" },
      classNames: (_theme, params) => ({
        root: BUTTON_VARIANT_CLASS[params.variant ?? "outline"] ?? "",
      }),
    }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: "sm", horizontalSpacing: "md" },
      classNames: { table: "uf-table" },
    }),
    Card: Card.extend({
      classNames: { root: "uf-card-link" },
    }),
    Chip: Chip.extend({
      defaultProps: { variant: "light", radius: "sm" },
    }),
    Code: Code.extend({
      classNames: { root: "uf-code" },
    }),
  },
});

function App() {
  return (
    <EnvProvider>
      <DeveloperModeProvider>
        <RequestPreviewProvider>
          <SecretGarageProvider>
            <MantineProvider theme={theme} defaultColorScheme="auto">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="fx" element={<FxPage />} />
                  <Route path="validations" element={<ValidationsPage />} />
                </Route>
              </Routes>
              <RequestPreviewDrawer />
            </MantineProvider>
          </SecretGarageProvider>
        </RequestPreviewProvider>
      </DeveloperModeProvider>
    </EnvProvider>
  );
}

export default App;
