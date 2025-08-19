// EnvContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export enum Environment {
  MOCKED = "MOCKED",
  CAT = "CAT",
}

const ENVIRONMENT_URLS: Record<Environment, string> = {
  [Environment.MOCKED]: "", // Use /api proxy for mocked environment (goes to localhost:8081)
  [Environment.CAT]: "/cat-api", // Use /cat-api proxy for CAT environment (goes to localhost:8082)
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
      const savedEnv = localStorage.getItem("env");
      if (
        savedEnv &&
        Object.values(Environment).includes(savedEnv as Environment)
      ) {
        return savedEnv as Environment;
      }
    } catch (error) {
      console.warn("Failed to load environment from localStorage:", error);
    }
    return Environment.MOCKED; // Default fallback
  });

  const switchEnv = (newEnv: Environment) => {
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
