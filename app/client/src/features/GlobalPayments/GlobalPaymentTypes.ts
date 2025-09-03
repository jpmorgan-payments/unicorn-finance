export type PaymentHistory = {
  requestId: string;
  paymentType: string;
  accountNumber: string;
  requestData: any;
  responseData: any;
  status: "Success" | "Error";
  errorMessage?: string;
};

export type PartyDetails = {
  name: string;
  account: {
    accountNumber: string;
    accountType?: string;
  };
  postalAddress?: {
    addressType: string;
    streetName: string;
    buildingNumber: string;
    postalCode: string;
    city: string;
    country: string;
    countrySubDivision: string;
  };
};
export type AgentDetails = {
  name?: string;
  financialInstitutionIds: [
    {
      id: string;
      idType: string;
    },
  ];
};

export type AccountDetails = {
  account: PartyDetails;
  agent?: AgentDetails;
};
