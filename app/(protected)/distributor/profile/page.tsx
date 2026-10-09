'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui';
import {
  Building2,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  Percent,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { walletService } from '@/services/walletService';

export default function DistributorProfilePage() {
  const { session } = useAuth();

  const distName = session?.name || 'North Zone Distributor';
  const distCode = session?.entityId || 'DST001';
  const businessName = 'North Zone Distribution Enterprises';
  const parentMdName = 'Apex National Network';
  const parentMdCode = 'MD001';
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!session?.entityId) return;
    walletService.getDistributorWallet(session.entityId).then((response) => {
      if (response.success && response.data) setWalletBalance(response.data.availableBalance);
    }).catch(() => setWalletBalance(0));
  }, [session?.entityId]);

  return (
    <PageContainer
      title="Distributor Business Identity & Profile"
      description="Inspect your business entity credentials, parent Master Distributor hierarchy, network scope, and operating wallet details"
    >

      {/* Identity Card */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F4C81] text-white font-extrabold text-lg flex items-center justify-center shadow-xs ring-4 ring-indigo-50">
              DST
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{distName}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#0F4C81] font-bold border border-indigo-200">
                  {distCode}
                </span>
                <StatusBadge status="ACTIVE" label="Distributor Partner" />
              </div>
              <p className="text-xs text-slate-600 font-medium">{businessName}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Parent Master Distributor</span>
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0F4C81]" />
              {parentMdName} <span className="font-mono text-[#0F4C81]">({parentMdCode})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Credentials */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#0F4C81]" /> Business Credentials & Entity
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Registered Name:</span>
              <span className="font-bold text-slate-900">{businessName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Distributor Code:</span>
              <span className="font-mono font-bold text-[#0F4C81]">{distCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Business Type:</span>
              <span className="font-semibold text-slate-800">Private Limited Partnership</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">GST Registration:</span>
              <span className="font-mono text-slate-800">07ABCDE1234F1Z5</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">PAN (Masked):</span>
              <span className="font-mono text-slate-800">ABCDE1234F</span>
            </div>
          </div>
        </div>

        {/* Contact Profile */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-[#0F4C81]" /> Contact & Communication
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact Officer:</span>
              <span className="font-bold text-slate-900">{distName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Email Address:</span>
              <span className="font-mono text-slate-800">dst001@qinstarpay.com</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mobile Number:</span>
              <span className="font-mono text-slate-800">+91 9830033333</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">User Account ID:</span>
              <span className="font-mono text-slate-700">usr_dst_01</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Registered Office:</span>
              <span className="text-slate-800 font-medium">Connaught Place, New Delhi - 110001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Scope & Wallet Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Scope */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Store className="w-4 h-4 text-[#0F4C81]" /> Network Scope Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Total Retailers:</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">10</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80">
              <span className="text-emerald-800">Active Retailers:</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5 font-mono">8</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80">
              <span className="text-amber-800">Pending Admin Approval:</span>
              <p className="text-xl font-bold text-amber-700 mt-0.5 font-mono">2</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500">Assigned Region:</span>
              <p className="text-sm font-bold text-slate-900 mt-1">North Zone</p>
            </div>
          </div>
        </div>

        {/* Operating Wallet Context */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-[#0F4C81]" /> Treasury & Wallet Context
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Wallet Account ID:</span>
              <span className="font-mono font-bold text-[#0F4C81]">wlt_dst_001</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Operating Wallet Balance:</span>
              <span className="font-mono font-bold text-emerald-600">{formatCurrency(walletBalance)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Hold / Lien Reserve:</span>
              <span className="font-mono text-amber-700 font-semibold">₹0.00</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Commission Slab Plan:</span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                DISTRIBUTOR_STANDARD_SLAB
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
