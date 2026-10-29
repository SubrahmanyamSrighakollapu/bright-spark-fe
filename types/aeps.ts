export type AEPSServiceType = 'CASH_WITHDRAWAL' | 'BALANCE_ENQUIRY' | 'MINI_STATEMENT' | 'CASH_DEPOSIT';
export type AEPSTransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'UNKNOWN';
export type AEPSBiometricState = 'IDLE' | 'DEVICE_READY' | 'CAPTURING' | 'CAPTURE_SUCCESS' | 'CAPTURE_FAILED' | 'CANCELLED';

export interface AEPSBank { id: string; name: string; }
export interface AEPSDevice { id: string; name: string; status: 'READY'; }
export interface AEPSMiniStatementEntry { id: string; date: string; description: string; debit?: number; credit?: number; balance: number; }
export interface AEPSTransaction {
  id: string;
  serviceType: AEPSServiceType;
  bankId: string;
  bankName: string;
  maskedAadhaar: string;
  maskedMobile: string;
  amount?: number;
  status: AEPSTransactionStatus;
  responseMessage: string;
  createdAt: string;
  customerBankBalance?: number;
  statement?: AEPSMiniStatementEntry[];
}

export interface AEPSCustomerInput {
  bankId: string;
  aadhaar: string;
  mobile: string;
  deviceId: string;
  consent: boolean;
  amount?: number;
}

export interface AEPSAgentState {
  onboardingStatus: 'NOT_STARTED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  kycStatus: 'UNKNOWN' | 'REQUIRED' | 'PENDING' | 'COMPLETED' | 'FAILED';
  daily2faStatus: 'UNKNOWN' | 'REQUIRED' | 'COMPLETED' | 'FAILED';
  lastProviderMessage?: string;
}

export interface AEPSEligibility {
  kycRequired: boolean;
  daily2faRequired: boolean;
  kycWadhValue?: string;
  amountForOtp: number;
  tranTypeForOtp?: string;
  message: string;
}

