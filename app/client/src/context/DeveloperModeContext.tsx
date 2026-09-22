// DeveloperModeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// Gates the Global Payments beat's Tracking/Chaos controls (Local Mock only)
// behind an explicit opt-in, so the default form stays simple. Persisted so
// it survives a reload mid-demo.
interface DeveloperModeContextType {
  developerMode: boolean;
  setDeveloperMode: (value: boolean) => void;
}

const DeveloperModeContext = createContext<
  DeveloperModeContextType | undefined
>(undefined);

const STORAGE_KEY = "uf-developer-mode";

export const DeveloperModeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [developerMode, setDeveloperModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch (error) {
      console.warn("Failed to load developer mode from localStorage:", error);
      return false;
    }
  });

  const setDeveloperMode = (value: boolean) => {
    setDeveloperModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (error) {
      console.warn("Failed to save developer mode to localStorage:", error);
    }
  };

  return (
    <DeveloperModeContext.Provider value={{ developerMode, setDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  );
};

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  if (context === undefined) {
    throw new Error(
      "useDeveloperMode must be used within a DeveloperModeProvider",
    );
  }
  return context;
};
