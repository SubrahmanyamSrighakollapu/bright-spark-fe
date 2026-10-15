'use client';

import { mockTransactions } from '@/mocks/mockTransactions';
import { mockChargebacks } from '@/mocks/mockChargeback';
export interface PaymentLink { token: string; retailerId: string; businessName: string; description: string; fixedAmount?: number; expiresAt: string; status: 'ACTIVE' | 'INACTIVE'; createdAt: string; }
export interface LinkPayment { id: string; token: string; payerName: string; mobile: string; email?: string; amount: number; method: string; reference: string; status: 'SUCCESS'; createdAt: string; }

const LINKS_KEY = 'qinstar_payment_links_v1';
const PAYMENTS_KEY = 'qinstar_link_payments_v1';
const seedLinks: PaymentLink[] = [{ token: 'metro-store-pay', retailerId: 'ent_rtl_01', businessName: 'Metro Store #01', description: 'Pay securely to Metro Store', expiresAt: '2027-12-31T23:59:59.000Z', status: 'ACTIVE', createdAt: '2026-09-29T07:30:00.000Z' }];

function read<T>(key: string, fallback: T): T { if (typeof window === 'undefined') return fallback; try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function write<T>(key: string, value: T) { if (typeof window !== 'undefined') { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event('qinstar_fintech_updated')); } }

export const merchantPaymentService = {
  getLinks: (retailerId?: string) => read<PaymentLink[]>(LINKS_KEY, seedLinks).filter((l) => !retailerId || l.retailerId === retailerId || retailerId === 'RET001'),
  getLink: (token: string) => read<PaymentLink[]>(LINKS_KEY, seedLinks).find((l) => l.token === token),
  createLink(input: Omit<PaymentLink, 'token' | 'createdAt' | 'status'>) { const token = `${input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).slice(2, 8)}`; const link: PaymentLink = { ...input, token, status: 'ACTIVE', createdAt: new Date().toISOString() }; write(LINKS_KEY, [link, ...read(LINKS_KEY, seedLinks)]); return link; },
  recordPayment(input: Omit<LinkPayment, 'id' | 'status' | 'createdAt' | 'reference'>) { const payment: LinkPayment = { ...input, id: `LP-${Date.now()}`, reference: `QSP${Date.now()}`, status: 'SUCCESS', createdAt: new Date().toISOString() }; write(PAYMENTS_KEY, [payment, ...read<LinkPayment[]>(PAYMENTS_KEY, [])]); return payment; },
  getUnsettled: (retailerId: string) => { void retailerId; return mockTransactions.filter((t) => t.type === 'PAY_IN' && (t.status === 'SUCCESS' || t.status === 'PROCESSING')).map((t, index) => ({ ...t, settlementDate: new Date(new Date(t.createdAt).getTime() + 86400000).toISOString(), settlementStatus: index === 0 ? 'DUE_TODAY' : 'PENDING_T1' })); },
  getRetailerChargebacks: (retailerId: string) => { void retailerId; const scoped = mockChargebacks.filter((c) => c.entityType === 'RETAILER'); return scoped.length ? scoped : mockChargebacks.slice(0, 2); },
};
