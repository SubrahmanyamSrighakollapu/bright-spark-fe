import type { AEPSBank, AEPSDevice, AEPSMiniStatementEntry, AEPSTransaction } from '@/types/aeps';

export const AEPS_BANKS: AEPSBank[] = [
  { id: '607094', name: 'State Bank of India' },
  { id: '607152', name: 'HDFC Bank' },
  { id: '508534', name: 'ICICI Bank' },
  { id: '990309', name: 'Kotak Mahindra Bank' },
  { id: '607027', name: 'Punjab National Bank' },
  { id: '607153', name: 'Axis Bank' },
];

export const AEPS_DEVICES: AEPSDevice[] = [
  { id: 'MANTRA_L1', name: 'Mantra L1 RD Service', status: 'READY' },
  { id: 'MORPHO', name: 'Morpho RD Service', status: 'READY' },
  { id: 'STARTEK', name: 'Startek RD Service', status: 'READY' },
];

export const AEPS_LIMITS = { withdrawalMin: 100, withdrawalMax: 10_000 } as const;

export const AEPS_MINI_STATEMENT: AEPSMiniStatementEntry[] = [
  { id: 'MS1', date: '15 Oct 2026', description: 'Grocery purchase', debit: 420, balance: 1356.74 },
  { id: 'MS2', date: '14 Oct 2026', description: 'Account credit', credit: 1500, balance: 1776.74 },
  { id: 'MS3', date: '12 Oct 2026', description: 'Mobile recharge', debit: 249, balance: 276.74 },
];

export const AEPS_SEED_TRANSACTIONS: AEPSTransaction[] = [];

