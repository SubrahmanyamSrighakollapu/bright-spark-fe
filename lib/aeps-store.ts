'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AEPS_SEED_TRANSACTIONS } from '@/mocks/mockAeps';
import type { AEPSTransaction } from '@/types/aeps';

interface AEPSStore {
  authenticatedAt: string | null;
  operatorSessionExpiresAt: string | null;
  transactions: AEPSTransaction[];
  amountForOtp: number;
  tranTypeForOtp: string | null;
  setAuthenticatedAt: (value: string | null) => void;
  clearOperatorSession: () => void;
  addTransaction: (transaction: AEPSTransaction) => void;
  setTransactions: (transactions: AEPSTransaction[]) => void;
  setOtpPolicy: (amount: number, transactionType?: string) => void;
}

export const useAEPSStore = create<AEPSStore>()(persist(
  (set) => ({
    authenticatedAt: null,
    operatorSessionExpiresAt: null,
    transactions: AEPS_SEED_TRANSACTIONS,
    amountForOtp: 0,
    tranTypeForOtp: null,
    setAuthenticatedAt: (authenticatedAt) => set({
      authenticatedAt,
      operatorSessionExpiresAt: authenticatedAt
        ? new Date(new Date(authenticatedAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
        : null,
    }),
    clearOperatorSession: () => set({ authenticatedAt: null, operatorSessionExpiresAt: null }),
    addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions.filter((item) => item.id !== transaction.id)] })),
    setTransactions: (transactions) => set({ transactions }),
    setOtpPolicy: (amountForOtp, tranTypeForOtp) => set({ amountForOtp, tranTypeForOtp: tranTypeForOtp ?? null }),
  }),
  {
    name: 'bright-spark-aeps-v2',
    partialize: (state) => ({ authenticatedAt: state.authenticatedAt, operatorSessionExpiresAt: state.operatorSessionExpiresAt, transactions: state.transactions, amountForOtp: state.amountForOtp, tranTypeForOtp: state.tranTypeForOtp }),
  },
));

export function isAEPSOperatorSessionValid(expiresAt: string | null): boolean {
  return Boolean(expiresAt && new Date(expiresAt).getTime() > Date.now());
}

