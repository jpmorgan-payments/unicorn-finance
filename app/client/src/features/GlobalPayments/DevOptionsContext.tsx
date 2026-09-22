import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ChaosScenario } from "../../mocks/chaosScenarios";

// Tracking mode + chaos scenario for the Global Payments beat's Developer
// options panel. Lifted out of the form itself so the panel can render at
// the top of the page (under the Developer mode toggle) while the form and
// PaymentStatusPanel still read/drive the same values.
export type TrackingMode = "play" | "debug";

interface DevOptionsContextType {
  trackingMode: TrackingMode;
  setTrackingMode: (value: TrackingMode) => void;
  chaosScenario: ChaosScenario;
  setChaosScenario: (value: ChaosScenario) => void;
}

const DevOptionsContext = createContext<DevOptionsContextType | undefined>(
  undefined,
);

export const DevOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("play");
  const [chaosScenario, setChaosScenario] = useState<ChaosScenario>("none");

  return (
    <DevOptionsContext.Provider
      value={{ trackingMode, setTrackingMode, chaosScenario, setChaosScenario }}
    >
      {children}
    </DevOptionsContext.Provider>
  );
};

export const useDevOptions = () => {
  const context = useContext(DevOptionsContext);
  if (context === undefined) {
    throw new Error("useDevOptions must be used within a DevOptionsProvider");
  }
  return context;
};
