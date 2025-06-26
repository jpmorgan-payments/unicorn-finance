import { BIC } from "./accountTypes";

export type GlobalPaymentRequest = {
  paymentType: string;
  requestedExecutionDate: string;
  paymentIdentifiers: {
    endToEndId: string;
  };
  value: {
    currency: string;
    amount: string;
  };
  debtor: {
    name: string;
    account: PaymentAccount;
  };
  debtorAgent?: AgentType;
  creditorAgent?: AgentType;
  creditor: {
    name: string;
    account: PaymentAccount;
  };
  transferType: string;
};
export type PaymentsResponse = {
  paymentInitiationResponse?: APISuccessMessage;
  errors?: {
    endToEndId?: string;
    errorDetails: [Error];
  };
};

export type AgentType = {
  financialInstitutionIds: [
    | { bic: BIC }
    | {
        id: string;
        idType?: string;
      }
  ];
};

export type PaymentAccount = {
  accountNumber?: string;
  accountCurrency?: string;
  accountType?: "DDA" | "VAM" | "IBAN" | "BDA";
};

export type APISuccessMessage = {
  endToEndId: string;
  firmRootId?: string;
};

export type APIErrorMessage = {
  errors: {
    endToEndId: string;
    errorDetails: Error[];
  };
};

export type Error = {
  errorCode: string;
  errorDescription?: string;
  ruleDefinition?: string;
};

export type PaymentStatusResponseType = {
  paymentStatus: {
    createDateTime?: string;
    status:
      | "PENDING"
      | "PENDING_POSTING"
      | "BLOCKED"
      | "REJECTED"
      | "COMPLETED"
      | "COMPLETED_CREDITED"
      | "RETURNED";
    exception?: Error[];
  };
  identifiers: APISuccessMessage;
};
export type FormValuesType = {
  debtorAccount: string;
  creditorAccount: string;
  amount: string;
  date: Date;
  paymentType: string;
};
