"use client";

import { 
  User, Building2, Wallet, Landmark, ShieldCheck, 
  Key, Phone, Mail, FileText, CheckCircle2 
} from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";

export default function BBPSProfilePage() {
  const { agentInfo } = useBBPSStore();

  return (
    <BBPSLayout pageTitle="Retailer Agent Profile & Licensing">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Banner Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#285C50] text-white font-extrabold text-xl flex items-center justify-center border-2 border-[#214B42] shadow-sm">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{agentInfo.retailerName}</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  ACTIVE AGENT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">{agentInfo.agencyName}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Agent ID: <span className="font-bold text-slate-800">{agentInfo.agentId}</span> | License: {agentInfo.bbpsLicenseNo}
              </p>
            </div>
          </div>

          <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Wallet Balance
            </span>
            <span className="text-sm font-bold text-[#285C50]">
              0
            </span>
          </div>
        </div>

        {/* Profile Detail Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agency & Terminal Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2F6F5E]" /> Agency & Terminal Registration
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Agency Legal Name:</span>
                <span className="font-bold text-slate-800">{agentInfo.agencyName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Retailer Agent ID:</span>
                <span className="font-mono font-bold text-[#285C50]">{agentInfo.agentId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Terminal ID:</span>
                <span className="font-mono font-bold text-slate-800">{agentInfo.terminalId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">BBPS License Code:</span>
                <span className="font-mono font-bold text-slate-800">{agentInfo.bbpsLicenseNo}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">NPCI Authorized Node:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                </span>
              </div>
            </div>
          </div>

          {/* Settlement Banking Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#2F6F5E]" /> Bank Settlement Account
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Settlement Bank Name:</span>
                <span className="font-bold text-slate-800">{agentInfo.settlementBank}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-slate-800">{agentInfo.settlementAccount}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">IFSC Code:</span>
                <span className="font-mono font-bold text-slate-800">{agentInfo.ifscCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Settlement Cycle:</span>
                <span className="font-semibold text-slate-800">T+1 Daily Automated Settlement</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">KYC Status:</span>
                <span className="font-bold text-emerald-700">VERIFIED (Pan & Aadhaar)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BBPSLayout>
  );
}
