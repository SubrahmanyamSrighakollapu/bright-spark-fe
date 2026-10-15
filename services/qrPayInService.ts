import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/types/common';

export interface QrPayInAccount {
  id: string;
  code: string;
  label: string;
  provider: string;
  bankName: string;
  upiId: string;
  payeeName: string;
  minAmount: number;
  maxAmount: number;
  pricing: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QrPayInSubmission {
  id: string;
  reference: string;
  retailerId: string;
  retailerName?: string;
  qrAccountId: string;
  bankName: string;
  payerName: string;
  mobile: string;
  email?: string;
  amount: number;
  utr: string;
  receiptName: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

export type QrPayInAccountInput = Pick<QrPayInAccount, 'code' | 'label' | 'bankName' | 'upiId' | 'payeeName' | 'minAmount' | 'maxAmount' | 'pricing' | 'status' | 'sortOrder'>;

const accountPayload = (input: QrPayInAccountInput) => ({
  code: input.code.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_'),
  displayLabel: input.label.trim(), bankName: input.bankName.trim(), upiId: input.upiId.trim(),
  payeeName: input.payeeName.trim(), minAmount: input.minAmount, maxAmount: input.maxAmount,
  pricingDescription: input.pricing.trim(), status: input.status, sortOrder: input.sortOrder,
});

export const qrPayInService = {
  getAccounts: () => apiClient.get<ApiResponse<QrPayInAccount[]>>('/qr-pay-in/accounts'),
  createAccount: (input: QrPayInAccountInput) => apiClient.post<ApiResponse<QrPayInAccount>>('/qr-pay-in/accounts', accountPayload(input)),
  updateAccount: (id: string, input: QrPayInAccountInput) => apiClient.put<ApiResponse<QrPayInAccount>>(`/qr-pay-in/accounts/${id}`, accountPayload(input)),
  updateStatus: (id: string, status: QrPayInAccount['status']) => apiClient.patch<ApiResponse<{ id: string; status: QrPayInAccount['status'] }>>(`/qr-pay-in/accounts/${id}/status`, { status }),
  getSubmissions: () => apiClient.get<ApiResponse<QrPayInSubmission[]>>('/qr-pay-in/submissions'),
  submit(input: { qrAccountId: string; payerName: string; mobile: string; email?: string; amount: number; utr: string; receipt: File }) {
    const data = new FormData();
    data.append('qrAccountId', input.qrAccountId); data.append('payerName', input.payerName);
    data.append('mobile', input.mobile); data.append('email', input.email ?? '');
    data.append('amount', String(input.amount)); data.append('utr', input.utr); data.append('receipt', input.receipt);
    return apiClient.upload<ApiResponse<QrPayInSubmission>>('/qr-pay-in/submissions', data);
  },
};
