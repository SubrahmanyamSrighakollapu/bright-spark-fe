import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/types/common';

export type PayoutMode = 'IMPS' | 'NEFT' | 'RTGS' | 'UPI';

export interface PayoutChargeRule {
  id: string;
  payoutMode: PayoutMode;
  minAmount: number;
  maxAmount: number;
  flatCharge: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type PayoutChargeInput = Pick<PayoutChargeRule, 'payoutMode' | 'minAmount' | 'maxAmount' | 'flatCharge'>;
export interface PayoutChargeResolution { rule: PayoutChargeRule; charge: number; }

export const payoutChargeService = {
  getRules: () => apiClient.get<ApiResponse<PayoutChargeRule[]>>('/payout-charge-rules'),
  createRule: (input: PayoutChargeInput) => apiClient.post<ApiResponse<PayoutChargeRule>>('/payout-charge-rules', input),
  updateRule: (id: string, input: PayoutChargeInput & { version: number }) => apiClient.put<ApiResponse<PayoutChargeRule>>(`/payout-charge-rules/${id}`, input),
  deleteRule: (id: string) => apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/payout-charge-rules/${id}`),
  resolve: (payoutMode: PayoutMode, amount: number) => apiClient.get<ApiResponse<PayoutChargeResolution>>('/payout-charge-rules/resolve', { params: { payoutMode, amount } }),
};
