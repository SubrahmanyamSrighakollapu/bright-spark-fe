'use client';

import { mockTransactions } from '@/mocks/mockTransactions';
import { mockChargebacks } from '@/mocks/mockChargeback';

export const merchantPaymentService = {
  getUnsettled: (retailerId: string) => { void retailerId; return mockTransactions.filter((t) => t.type === 'PAY_IN' && (t.status === 'SUCCESS' || t.status === 'PROCESSING')).map((t, index) => ({ ...t, settlementDate: new Date(new Date(t.createdAt).getTime() + 86400000).toISOString(), settlementStatus: index === 0 ? 'DUE_TODAY' : 'PENDING_T1' })); },
  getRetailerChargebacks: (retailerId: string) => { void retailerId; const scoped = mockChargebacks.filter((c) => c.entityType === 'RETAILER'); return scoped.length ? scoped : mockChargebacks.slice(0, 2); },
};
