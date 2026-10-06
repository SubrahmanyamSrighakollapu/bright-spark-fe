'use client';

import { mockTransactions } from '@/mocks/mockTransactions';
import { mockChargebacks } from '@/mocks/mockChargeback';
import { walletService } from './walletService';

export type TopUpStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TopUpMode = 'BANK_TRANSFER' | 'UPI' | 'QR';
export interface TopUpRequest { id: string; retailerId: string; retailerName: string; walletId: string; amount: number; mode: TopUpMode; reference: string; remarks: string; proofName?: string; status: TopUpStatus; createdAt: string; reviewedAt?: string; reviewedBy?: string; reviewRemarks?: string; }
export interface PaymentLink { token: string; retailerId: string; businessName: string; description: string; fixedAmount?: number; expiresAt: string; status: 'ACTIVE' | 'INACTIVE'; createdAt: string; }
export interface LinkPayment { id: string; token: string; payerName: string; mobile: string; email?: string; amount: number; method: string; reference: string; status: 'SUCCESS'; createdAt: string; }
export interface UpiQrAccount { id: string; label: string; provider: string; upiId: string; payeeName: string; minAmount: number; maxAmount: number; pricing: string; status: 'ACTIVE' | 'INACTIVE'; }
export interface QrPayInSubmission { id: string; retailerId: string; qrAccountId: string; payerName: string; mobile: string; email?: string; amount: number; utr: string; receiptName: string; status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED'; createdAt: string; }

const TOPUPS_KEY = 'qinstar_topup_requests_v1';
const LINKS_KEY = 'qinstar_payment_links_v1';
const PAYMENTS_KEY = 'qinstar_link_payments_v1';
const QR_SUBMISSIONS_KEY = 'qinstar_qr_payin_submissions_v1';
const seedTopUps: TopUpRequest[] = [{ id: 'TUP-20260929-1042', retailerId: 'ent_rtl_01', retailerName: 'Metro Store #01', walletId: 'wlt_ret_001', amount: 25000, mode: 'UPI', reference: 'UTR62909184210', remarks: 'Working capital top-up', proofName: 'upi-receipt.pdf', status: 'PENDING', createdAt: '2026-09-29T08:42:00.000Z' }];
const seedLinks: PaymentLink[] = [{ token: 'metro-store-pay', retailerId: 'ent_rtl_01', businessName: 'Metro Store #01', description: 'Pay securely to Metro Store', expiresAt: '2027-12-31T23:59:59.000Z', status: 'ACTIVE', createdAt: '2026-09-29T07:30:00.000Z' }];
const qrAccounts: UpiQrAccount[] = [
  { id: 'qr_unisuspe', label: 'UNISUS F.', provider: 'Unisuspe', upiId: 'qinstarpay.unisus@axisbank', payeeName: 'QIN STAR PAYMENT TECHNOLOGIES', minAmount: 100, maxAmount: 100000, pricing: 'Domestic: RuPay · 0.93%', status: 'ACTIVE' },
  { id: 'qr_qinstar', label: 'Qin Star Main', provider: 'Axis UPI', upiId: 'qinstarpay@axisbank', payeeName: 'QIN STAR PAYMENT TECHNOLOGIES', minAmount: 100, maxAmount: 200000, pricing: 'UPI collection · Standard plan', status: 'ACTIVE' },
  { id: 'qr_backup', label: 'Qin Star Backup', provider: 'ICICI UPI', upiId: 'qinstarpay@icici', payeeName: 'QIN STAR PAYMENT TECHNOLOGIES', minAmount: 500, maxAmount: 50000, pricing: 'UPI collection · Backup route', status: 'ACTIVE' },
];

function read<T>(key: string, fallback: T): T { if (typeof window === 'undefined') return fallback; try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function write<T>(key: string, value: T) { if (typeof window !== 'undefined') { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event('qinstar_fintech_updated')); } }

export const merchantPaymentService = {
  getTopUps: (retailerId?: string) => read<TopUpRequest[]>(TOPUPS_KEY, seedTopUps).filter((r) => !retailerId || r.retailerId === retailerId || retailerId === 'RET001'),
  async createTopUp(input: Omit<TopUpRequest, 'id' | 'status' | 'createdAt'>) { const item: TopUpRequest = { ...input, id: `TUP-${Date.now()}`, status: 'PENDING', createdAt: new Date().toISOString() }; write(TOPUPS_KEY, [item, ...read(TOPUPS_KEY, seedTopUps)]); return item; },
  async reviewTopUp(id: string, decision: 'APPROVED' | 'REJECTED', remarks: string) { const items = read<TopUpRequest[]>(TOPUPS_KEY, seedTopUps); const item = items.find((r) => r.id === id); if (!item || item.status !== 'PENDING') throw new Error('Only pending requests can be reviewed.'); if (decision === 'APPROVED') { const result = await walletService.creditWallet(item.walletId, item.amount, `Approved retailer top-up: ${item.remarks}`, item.id, 'Qin Star Admin'); if (!result.success) throw new Error('Wallet credit failed; request was not approved.'); } item.status = decision; item.reviewedAt = new Date().toISOString(); item.reviewedBy = 'Qin Star Admin'; item.reviewRemarks = remarks; write(TOPUPS_KEY, items); return item; },
  getLinks: (retailerId?: string) => read<PaymentLink[]>(LINKS_KEY, seedLinks).filter((l) => !retailerId || l.retailerId === retailerId || retailerId === 'RET001'),
  getLink: (token: string) => read<PaymentLink[]>(LINKS_KEY, seedLinks).find((l) => l.token === token),
  createLink(input: Omit<PaymentLink, 'token' | 'createdAt' | 'status'>) { const token = `${input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).slice(2, 8)}`; const link: PaymentLink = { ...input, token, status: 'ACTIVE', createdAt: new Date().toISOString() }; write(LINKS_KEY, [link, ...read(LINKS_KEY, seedLinks)]); return link; },
  recordPayment(input: Omit<LinkPayment, 'id' | 'status' | 'createdAt' | 'reference'>) { const payment: LinkPayment = { ...input, id: `LP-${Date.now()}`, reference: `QSP${Date.now()}`, status: 'SUCCESS', createdAt: new Date().toISOString() }; write(PAYMENTS_KEY, [payment, ...read<LinkPayment[]>(PAYMENTS_KEY, [])]); return payment; },
  getActiveQrAccounts: () => qrAccounts.filter((account) => account.status === 'ACTIVE'),
  getQrSubmissions: (retailerId: string) => read<QrPayInSubmission[]>(QR_SUBMISSIONS_KEY, []).filter((item) => item.retailerId === retailerId || retailerId === 'RET001'),
  submitQrPayIn(input: Omit<QrPayInSubmission, 'id' | 'status' | 'createdAt'>) { const existing = read<QrPayInSubmission[]>(QR_SUBMISSIONS_KEY, []); if (existing.some((item) => item.utr.toLowerCase() === input.utr.toLowerCase())) throw new Error('This UTR has already been submitted.'); const submission: QrPayInSubmission = { ...input, id: `QRP-${Date.now()}`, status: 'SUBMITTED', createdAt: new Date().toISOString() }; write(QR_SUBMISSIONS_KEY, [submission, ...existing]); return submission; },
  getUnsettled: (retailerId: string) => { void retailerId; return mockTransactions.filter((t) => t.type === 'PAY_IN' && (t.status === 'SUCCESS' || t.status === 'PROCESSING')).map((t, index) => ({ ...t, settlementDate: new Date(new Date(t.createdAt).getTime() + 86400000).toISOString(), settlementStatus: index === 0 ? 'DUE_TODAY' : 'PENDING_T1' })); },
  getRetailerChargebacks: (retailerId: string) => { void retailerId; const scoped = mockChargebacks.filter((c) => c.entityType === 'RETAILER'); return scoped.length ? scoped : mockChargebacks.slice(0, 2); },
};
