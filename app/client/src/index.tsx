import React from "react";
import { createRoot } from "react-dom/client";
import { worker } from "./mocks/browser";

import { BrowserRouter } from "react-router-dom";
import App from "./App";

async function prepare() {
  return worker.start({
    onUnhandledRequest: "bypass", // Temporarily set to 'warn' to debug
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

prepare().then(() => {
  const root = createRoot(document.getElementById("root") as HTMLElement);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
});
