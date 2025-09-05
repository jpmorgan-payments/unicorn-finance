import React, { createContext, useContext, useState, ReactNode } from "react";

interface RequestPreviewData {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body: any;
}

interface RequestPreviewContextType {
  isDrawerOpen: boolean;
  requestData: RequestPreviewData | null;
  responseData: string | null;
  openDrawer: (data: RequestPreviewData, response: string | null) => void;
  closeDrawer: () => void;
}

const RequestPreviewContext = createContext<
  RequestPreviewContextType | undefined
>(undefined);

interface RequestPreviewProviderProps {
  children: ReactNode;
}

export const RequestPreviewProvider: React.FC<RequestPreviewProviderProps> = ({
  children,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [requestData, setRequestData] = useState<RequestPreviewData | null>(
    null,
  );

  const [responseData, setResponseData] = useState<string | null>(null);

  const openDrawer = (data: RequestPreviewData, response: string | null) => {
    setRequestData(data);
    setResponseData(response);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setResponseData(null);
    setRequestData(null);
  };

  return (
    <RequestPreviewContext.Provider
      value={{
        isDrawerOpen,
        requestData,
        responseData,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </RequestPreviewContext.Provider>
  );
};

export const useRequestPreview = () => {
  const context = useContext(RequestPreviewContext);
  if (context === undefined) {
    throw new Error(
      "useRequestPreview must be used within a RequestPreviewProvider",
    );
  }
  return context;
};
