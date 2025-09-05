export type AVSAccountDetails = {
  accountNumber: string;
  financialInstitutionId: {
    clearingSystemId: {
      id: string;
      idType: string;
    };
  };
};

export type ValidationHistory = {
  requestId: string;
  validationType: string;
  accountNumber: string;
  requestData: any;
  responseData: any;
  status: "Success" | "Error";
  errorMessage?: string;
};
