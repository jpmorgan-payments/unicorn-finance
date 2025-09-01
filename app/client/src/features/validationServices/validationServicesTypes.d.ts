export type AVSAccountDetails = {
  accountNumber: string;
  financialInstitutionId: {
    clearingSystemId: {
      id: string;
      idType: string;
    };
  };
};
