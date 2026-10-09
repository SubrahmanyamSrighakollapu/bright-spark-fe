'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatters';
import { walletService } from '@/services/walletService';
import {
  Building2,
  Users,
  Store,
  Wallet,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Award,
  Lock,
  Layers,
} from 'lucide-react';

export default function MasterDistributorProfilePage() {
  const { session } = useAuth();
  const mdCode = session?.entityId || 'MD001';
  const mdName = session?.name || 'Apex National Network';
  const mdEmail = session?.email || 'admin@apexnetwork.com';
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!session?.entityId) return;
    walletService.getMasterDistributorWallet(session.entityId).then((response) => {
      if (response.success && response.data) setWalletBalance(response.data.availableBalance);
    }).catch(() => setWalletBalance(0));
  }, [session?.entityId]);

  return (
    <PageContainer>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <FinancialPageHeader
          title="Master Distributor Profile"
          subtitle="Inspect your Master Distributor business entity, network scope, and platform account credentials."
          statusBadge={<StatusBadge status="ACTIVE" label="Approved Master Distributor" />}
        />

        {/* Identity & Business Info Hero */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-[#0F4C81] text-white font-extrabold flex items-center justify-center text-xl shadow-md ring-4 ring-indigo-50">
                MD
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{mdName}</h2>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#0F4C81] border border-indigo-200">
                    {mdCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Apex Financial Services Master Agency Entity</p>
              </div>
            </div>

            <StatusBadge status="ACTIVE" label="Account Active" />
          </div>

          {/* Business Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-[#0F4C81]" /> Business Profile
              </h3>
              <div className="space-y-2 font-mono text-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Entity Code:</span>
                  <span className="font-bold text-[#0F4C81]">{mdCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Legal Entity:</span>
                  <span className="font-sans font-semibold text-slate-900">Apex Financial Solutions Private Limited</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Platform Tier:</span>
                  <span className="font-sans font-semibold text-[#0F4C81]">Master Distributor (Apex Network)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">KYC Status:</span>
                  <span className="font-sans text-emerald-700 font-bold">✓ VERIFIED & APPROVED</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Mail className="w-4 h-4 text-[#0F4C81]" /> Contact & Regional Scoping
              </h3>
              <div className="space-y-2 font-mono text-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Primary Email:</span>
                  <span className="font-semibold text-slate-900">{mdEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Registered Mobile:</span>
                  <span className="font-semibold text-slate-900">+91 98765 00100</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Operating Zone:</span>
                  <span className="font-sans font-semibold text-slate-900">National Network Apex Division</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Scope & Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0F4C81]" /> Direct Distributors
              </span>
              <span className="font-mono text-xs font-bold text-[#0F4C81]">8 Active</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">8 Partners</p>
            <p className="text-[11px] text-slate-500">Assigned agency distributors</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#0F4C81]" /> Retailer Outlets
              </span>
              <span className="font-mono text-xs font-bold text-emerald-700">42 Outlets</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">42 Retailers</p>
            <p className="text-[11px] text-slate-500">Managed retail counters</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F4C81] uppercase flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#0F4C81]" /> Available Wallet
              </span>
              <span className="font-mono text-xs font-bold text-emerald-700">ACTIVE</span>
            </div>
            <p className="text-2xl font-extrabold text-[#0F4C81] font-mono">{formatCurrency(walletBalance)}</p>
            <p className="text-[11px] text-slate-500">Spendable MD wallet balance</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
