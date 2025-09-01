export type PaymentHistory = {
  requestId: string;
  paymentType: string;
  accountNumber: string;
  requestData: any;
  responseData: any;
  status: "Success" | "Error";
  errorMessage?: string;
};

export type AccountDetails = {
  accountNumber: string;
  financialInstitutionId: {
    clearingSystemId: {
      id: string;
      idType: string;
    };
  };
};
