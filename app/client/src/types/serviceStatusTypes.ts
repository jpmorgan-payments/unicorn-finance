import { ErrorType } from './globalTypes';

export type ServiceStatusDataType = {
  bankStatus?: BankType[]
  errors?: ErrorType[]
};

type BankStatusType = 'COMPLETE' | 'OFFLINE' | 'INTERMITTENT';
export type BankType = {
  clearingSystem: string,
  participantId: string,
  participantName: string,
  'status': BankStatusType
};
