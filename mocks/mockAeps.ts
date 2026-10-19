import type { AEPSBank, AEPSDevice, AEPSMiniStatementEntry, AEPSTransaction } from '@/types/aeps';

export const AEPS_BANKS: AEPSBank[] = [
  { id: 'SBI', name: 'State Bank of India' },
  { id: 'HDFC', name: 'HDFC Bank' },
  { id: 'ICICI', name: 'ICICI Bank' },
  { id: 'KOTAK', name: 'Kotak Mahindra Bank' },
  { id: 'PNB', name: 'Punjab National Bank' },
  { id: 'AXIS', name: 'Axis Bank' },
];

export const AEPS_DEVICES: AEPSDevice[] = [
  { id: 'MANTRA_L1', name: 'Mantra L1 RD Service', status: 'READY' },
  { id: 'MORPHO', name: 'Morpho RD Service', status: 'READY' },
  { id: 'STARTEK', name: 'Startek RD Service', status: 'READY' },
];

export const AEPS_LIMITS = { withdrawalMin: 100, withdrawalMax: 10_000 } as const;
export const AEPS_SYNTHETIC_CUSTOMER = { aadhaar: '999988887777', mobile: '9876501234' } as const;

export const AEPS_MINI_STATEMENT: AEPSMiniStatementEntry[] = [
  { id: 'MS1', date: '15 Oct 2026', description: 'Grocery purchase', debit: 420, balance: 1356.74 },
  { id: 'MS2', date: '14 Oct 2026', description: 'Account credit', credit: 1500, balance: 1776.74 },
  { id: 'MS3', date: '12 Oct 2026', description: 'Mobile recharge', debit: 249, balance: 276.74 },
];

export const AEPS_SEED_TRANSACTIONS: AEPSTransaction[] = [
  { id: 'BSPAEPS-0001', serviceType: 'CASH_WITHDRAWAL', bankId: 'KOTAK', bankName: 'Kotak Mahindra Bank', maskedAadhaar: 'XXXX XXXX 7777', maskedMobile: 'XXXXXX1234', amount: 2000, status: 'SUCCESS', responseMessage: 'Cash withdrawal successful', customerBankBalance: 8356.74, createdAt: '2026-10-17T09:30:00.000Z' },
  { id: 'BSPAEPS-0002', serviceType: 'MINI_STATEMENT', bankId: 'SBI', bankName: 'State Bank of India', maskedAadhaar: 'XXXX XXXX 7777', maskedMobile: 'XXXXXX1234', status: 'SUCCESS', responseMessage: 'Mini statement retrieved successfully', customerBankBalance: 1356.74, statement: AEPS_MINI_STATEMENT, createdAt: '2026-10-17T10:15:00.000Z' },
];

