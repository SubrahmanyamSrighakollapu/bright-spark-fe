'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

import { DateRangeDropdown } from '@/components/ui/DateRangeDropdown';
import { RoleDashboardHero } from '@/components/features/dashboard/RoleDashboardHero';

type AccountantModule = 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENTS';

export default function AccountsDashboardPage() {
  const [activeModule, setActiveModule] = useState<AccountantModule>('PAY_IN');

  const payInTxns = [
    { id: 'TXN_PIN_901', name: 'Apex National Retail', mobile: '+91 9876543210', amount: '₹ 1,25,000.00', mode: 'UPI_GATEWAY', hour: '10 mins ago', status: 'SUCCESS' },
    { id: 'TXN_PIN_902', name: 'North Zone Outlet', mobile: '+91 9876543220', amount: '₹ 84,500.00', mode: 'CREDIT_CARD', hour: '25 mins ago', status: 'SUCCESS' },
    { id: 'TXN_PIN_903', name: 'Capital Financial Store', mobile: '+91 9876543221', amount: '₹ 2,10,000.00', mode: 'NET_BANKING', hour: '42 mins ago', status: 'SUCCESS' },
  ];

  const payOutTxns = [
    { id: 'TXN_POT_401', name: 'Metro Super Store', mobile: '+91 9876543230', amount: '₹ 45,000.00', mode: 'IMPS_PAYOUT', hour: '15 mins ago', status: 'SETTLED' },
    { id: 'TXN_POT_402', name: 'Star Express Mart', mobile: '+91 9876543231', amount: '₹ 1,12,000.00', mode: 'NEFT_PAYOUT', hour: '38 mins ago', status: 'SETTLED' },
    { id: 'TXN_POT_403', name: 'Sunrise Digital', mobile: '+91 9876543232', amount: '₹ 78,400.00', mode: 'RTGS_PAYOUT', hour: '55 mins ago', status: 'SETTLED' },
  ];

  const settlementsList = [
    { id: 'SET_9081', merchant: 'Apex National Network', batchId: 'SET_20260919_001', amount: '₹ 45,20,000.00', status: 'READY_TO_DISPATCH', hour: 'Today 16:30' },
    { id: 'SET_9082', merchant: 'North Zone Distributor', batchId: 'SET_20260919_002', amount: '₹ 18,45,000.00', status: 'PENDING_BANK_ACK', hour: 'Today 15:00' },
    { id: 'SET_9083', merchant: 'Capital Express Point', batchId: 'SET_20260919_003', amount: '₹ 6,10,500.00', status: 'IN_RECONCILIATION', hour: 'Today 12:15' },
  ];

  return (
    <PageContainer fullWidth className="space-y-6 pb-12">
      <RoleDashboardHero
        eyebrow="Finance control"
        title="Finance & Accountant Control Desk"
        description="Financial Ledger Governance, Pay-In/Pay-Out Reconciliation & Invoice Search"
        icon={<Landmark className="h-5 w-5" />}
        tone="violet"
        actions={<>
          <DateRangeDropdown size="sm" />
          <Link
            href="/admin/invoices"
            className="px-3.5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            Invoice Formats & Search →
          </Link>
        </>}
      />

      {/* Financial Ledger Cards Above: Credits, Debits, Net Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> Total Credits Amount (Ledger)
            </span>
            <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-900 font-extrabold">PAY-IN</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-950 font-mono pt-1">
            ₹ {(184280500).toLocaleString('en-IN')}.00
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">+12.4% Gross Gateway Inflows</p>
        </div>

        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-rose-600" /> Total Debits Amount (Ledger)
            </span>
            <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded text-rose-900 font-extrabold">PAY-OUT</span>
          </div>
          <p className="text-2xl font-extrabold text-rose-950 font-mono pt-1">
            ₹ {(135718000).toLocaleString('en-IN')}.00
          </p>
          <p className="text-[11px] text-rose-700 font-medium">Payouts, Commissions & Refunds</p>
        </div>

        <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Wallet className="w-4 h-4 text-indigo-600" /> Net Account Balance
            </span>
            <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-900 font-extrabold">ESCROW</span>
          </div>
          <p className="text-2xl font-extrabold text-indigo-950 font-mono pt-1">
            ₹ {(48562500).toLocaleString('en-IN')}.00
          </p>
          <p className="text-[11px] text-indigo-700 font-medium">100% Bank Nodal Pool Reconciled</p>
        </div>
      </div>

      {/* Modules: Pay-In, Pay-Out & Settlements */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Accountant Ledger Modules
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveModule('PAY_IN')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeModule === 'PAY_IN' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Pay-In Module
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('PAY_OUT')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeModule === 'PAY_OUT' ? 'bg-white text-rose-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Pay-Out Module
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('SETTLEMENTS')}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeModule === 'SETTLEMENTS' ? 'bg-white text-indigo-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Settlements Module
            </button>
          </div>
        </div>

        {/* Module Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Reference ID</th>
                <th className="p-3">Entity / Merchant</th>
                <th className="p-3">Contact Mobile</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Hourly Stamp</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeModule === 'PAY_IN' &&
                payInTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{t.name}</td>
                    <td className="p-3 font-mono text-slate-600">{t.mobile}</td>
                    <td className="p-3 font-mono text-slate-700">{t.mode}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{t.amount}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{t.hour}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}

              {activeModule === 'PAY_OUT' &&
                payOutTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{t.name}</td>
                    <td className="p-3 font-mono text-slate-600">{t.mobile}</td>
                    <td className="p-3 font-mono text-slate-700">{t.mode}</td>
                    <td className="p-3 font-mono font-bold text-rose-700">{t.amount}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{t.hour}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}

              {activeModule === 'SETTLEMENTS' &&
                settlementsList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{s.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{s.merchant}</td>
                    <td className="p-3 font-mono text-slate-600">{s.batchId}</td>
                    <td className="p-3 font-mono text-slate-700">BANK_TRANSFER</td>
                    <td className="p-3 font-mono font-bold text-indigo-700">{s.amount}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{s.hour}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
