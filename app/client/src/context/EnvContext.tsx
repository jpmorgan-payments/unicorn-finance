// EnvContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// PDP-aligned environment tiers, in graduation order:
//   Local Mock - in-app MSW mock; offline, no credentials (the demo default)
//   JPMC Mock  - PDP's hosted "Mock" environment (api-mock.payments.jpmorgan.com),
//                reached with an OAuth2 client-credentials Bearer token. Global
//                Payments and Account Validation have a Mock-shaped adapter; FX
//                doesn't (no Mock tier exists for it, per PDP's own spec).
//   JPMC CAT   - Client Acceptance Testing; the last step before production,
//                real integration via mTLS + signed JWT. Disabled for now.
export enum Environment {
  LOCAL_MOCK = "LOCAL_MOCK",
  JPMC_MOCK = "JPMC_MOCK",
  JPMC_CAT = "JPMC_CAT",
}

const ENVIRONMENT_URLS: Record<Environment, string> = {
  [Environment.LOCAL_MOCK]: "", // /api/* is intercepted in-browser by MSW
  [Environment.JPMC_MOCK]: "/mock-api", // server proxy -> api-mock (OAuth2 Bearer)
  [Environment.JPMC_CAT]: "/cat-api", // server proxy -> CAT (mTLS + signed JWT)
};

export const ENVIRONMENT_META: Record<
  Environment,
  { label: string; hint: string }
> = {
  [Environment.LOCAL_MOCK]: {
    label: "Local Mock",
    hint: "Runs in this app (MSW) - offline, no keys.",
  },
  [Environment.JPMC_MOCK]: {
    label: "JPMC Mock",
    hint: "PDP Mock environment (api-mock) via OAuth2 client credentials. Global Payments and Account Validation are wired up; FX isn't - PDP doesn't offer a Mock tier for it.",
  },
  [Environment.JPMC_CAT]: {
    label: "JPMC CAT",
    hint: "Client Acceptance Testing - the step between Mock and production, real integration via mTLS certs + signed JWT. Needs onboarding + the server. Disabled for now.",
  },
};

// The JPMC tiers require onboarding (credentials/certs) plus the express server,
// so they are gated off by default. Set VITE_ENABLE_JPMC=true (and complete the
// setup in .env) to make them selectable.
export const jpmcEnvsEnabled = import.meta.env.VITE_ENABLE_JPMC === "true";

export const isEnvSelectable = (env: Environment): boolean => {
  if (env === Environment.LOCAL_MOCK) return true;
  // JPMC CAT disabled for now - re-enable once it's back in scope.
  if (env === Environment.JPMC_CAT) return false;
  return jpmcEnvsEnabled;
};

interface EnvContextType {
  environment: Environment;
  url: string;
  switchEnv: (newEnv: Environment) => void;
}

interface EnvProviderProps {
  children: ReactNode;
}

const EnvContext = createContext<EnvContextType | undefined>(undefined);

export const EnvProvider = ({ children }: EnvProviderProps) => {
  const [environment, setEnvironment] = useState<Environment>(() => {
    try {
      const savedEnv = localStorage.getItem("env") as Environment | null;
      if (
        savedEnv &&
        Object.values(Environment).includes(savedEnv) &&
        isEnvSelectable(savedEnv)
      ) {
        return savedEnv;
      }
    } catch (error) {
      console.warn("Failed to load environment from localStorage:", error);
    }
    return Environment.LOCAL_MOCK; // Default fallback
  });

  const switchEnv = (newEnv: Environment) => {
    // Never land on a gated tier (defensive - the switcher also disables them).
    if (!isEnvSelectable(newEnv)) return;
    setEnvironment(newEnv);
    try {
      localStorage.setItem("env", newEnv);
    } catch (error) {
      console.warn("Failed to save environment to localStorage:", error);
    }
  };

  const url = ENVIRONMENT_URLS[environment];

  return (
    <EnvContext.Provider value={{ environment, url, switchEnv }}>
      {children}
    </EnvContext.Provider>
  );
};

export const useEnv = () => {
  const context = useContext(EnvContext);
  if (context === undefined) {
    throw new Error("useEnv must be used within an EnvProvider");
  }
  return context;
};

export { EnvContext };
