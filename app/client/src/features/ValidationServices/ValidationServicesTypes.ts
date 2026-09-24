export type AVSAccountDetails = {
  accountNumber: string;
  // Non-US accounts (e.g. "IBAN"); US ABA accounts omit it.
  accountNumberType?: string;
  financialInstitutionId: {
    clearingSystemId: {
      id: string;
      idType: string;
    };
    postalAddress?: { country: string };
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
