import React, { createContext, useContext } from "react";
import { useSecretGarage } from "../hooks/useSecretGarage";

interface SecretGarageContextValue {
  progress: number;
  total: number;
}

const SecretGarageContext = createContext<SecretGarageContextValue>({
  progress: 0,
  total: 0,
});

export const SecretGarageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const value = useSecretGarage();
  return (
    <SecretGarageContext.Provider value={value}>
      {children}
    </SecretGarageContext.Provider>
  );
};

export const useSecretGarageProgress = () => useContext(SecretGarageContext);
