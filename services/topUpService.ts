import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/common';

export type TopUpStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TopUpMode = 'BANK_TRANSFER' | 'UPI' | 'QR';
export interface TopUpRequest {
  id: string; requestReference: string; retailerId: string; retailerCode: string; retailerName: string;
  walletId: string; amount: number; paymentMode: TopUpMode; paymentReference: string; remarks: string;
  proofName: string; proofMimeType: string; proofSizeBytes: number; status: TopUpStatus; requesterName: string;
  reviewRemarks?: string | null; reviewedAt?: string | null; reviewedBy?: string | null; ledgerEntryId?: string | null; createdAt: string;
}
export interface TopUpList { items: TopUpRequest[]; summary: { total:number; pending:number; approved:number; rejected:number }; pagination:{page:number;pageSize:number;totalItems:number;totalPages:number}; }

const dataOf = <T>(response: ApiResponse<T>): T => {
  if (!response.success || !response.data) throw new Error(response.error?.message || response.message || 'Request failed');
  return response.data;
};

export const topUpService = {
  async list(params: { status?: TopUpStatus | 'ALL'; search?: string } = {}) {
    return dataOf(await apiClient.get<ApiResponse<TopUpList>>('/top-up-requests', { params }));
  },
  async create(input: { amount:number; paymentMode:TopUpMode; paymentReference:string; remarks:string; proof:File }) {
    const form = new FormData();
    form.set('amount', String(input.amount)); form.set('paymentMode', input.paymentMode);
    form.set('paymentReference', input.paymentReference); form.set('remarks', input.remarks); form.set('proof', input.proof);
    return dataOf(await apiClient.upload<ApiResponse<TopUpRequest>>('/top-up-requests', form));
  },
  async review(id:string, decision:'APPROVED'|'REJECTED', remarks:string) {
    return dataOf(await apiClient.post<ApiResponse<{id:string;status:TopUpStatus;ledgerEntryId:string|null}>>(`/top-up-requests/${id}/review`, { decision, remarks }));
  },
  async openProof(id:string) {
    const blob=await apiClient.blob(`/top-up-requests/${id}/proof`); const url=URL.createObjectURL(blob);
    window.open(url,'_blank','noopener,noreferrer'); window.setTimeout(()=>URL.revokeObjectURL(url),60_000);
  },
};
