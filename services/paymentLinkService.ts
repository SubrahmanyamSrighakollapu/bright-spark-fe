import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/types/common';

export interface PaymentLink {
  id: string; token: string; retailerId: string; businessName: string; description: string;
  fixedAmount?: number; expiresAt: string; status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'; createdAt: string;
  paymentCount: number; collectedAmount: number;
}
export interface HostedPaymentMethod { id: string; name: string; code: string; }
export interface HostedPaymentLink { link: PaymentLink; paymentMethods: HostedPaymentMethod[]; }
export interface LinkPaymentResult { reference: string; amount: number; status: 'PENDING' | 'SUCCESS' | 'FAILED'; }
export interface PaymentLinkAttempt { id: string; reference: string; linkDescription: string; payerName: string; mobile: string; email?: string; amount: number; paymentMethod: string; status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELLED'; createdAt: string; }

export const paymentLinkService = {
  list: () => apiClient.get<ApiResponse<PaymentLink[]>>('/payment-links'),
  listPayments: () => apiClient.get<ApiResponse<PaymentLinkAttempt[]>>('/payment-links/payments'),
  create: (input: { description: string; fixedAmount?: number; expiresAt: string }) => apiClient.post<ApiResponse<PaymentLink>>('/payment-links', input),
  updateStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => apiClient.patch<ApiResponse<{ id: string; status: string }>>(`/payment-links/${id}/status`, { status }),
  getPublic: (token: string) => apiClient.get<ApiResponse<HostedPaymentLink>>(`/public/payment-links/${encodeURIComponent(token)}`),
  submitPayment: (token: string, input: { payerName: string; mobile: string; email?: string; amount: number; paymentMethodId: string; clientRequestId: string }) =>
    apiClient.post<ApiResponse<LinkPaymentResult>>(`/public/payment-links/${encodeURIComponent(token)}/payments`, input),
};
