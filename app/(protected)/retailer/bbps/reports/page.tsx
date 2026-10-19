"use client";

import { useState } from "react";
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, 
  CheckCircle2, TrendingUp, Building2 
} from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";

export default function BBPSReportsPage() {
  const { transactions, complaints, agentInfo } = useBBPSStore();
  const [activeTab, setActiveTab] = useState<"transactions" | "settlement" | "complaints">("transactions");

  return (
    <BBPSLayout pageTitle="Reports & Financial Statements">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">BBPS Operations Reports</h2>
            <p className="text-xs text-slate-500">
              Download audited daily summaries, settlements, and dispute metrics
            </p>
          </div>

          {/* Report Tab Selection */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === "transactions"
                  ? "bg-white text-[#285C50] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Transaction Reports
            </button>
            <button
              onClick={() => setActiveTab("settlement")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === "settlement"
                  ? "bg-white text-[#285C50] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Settlement Reports
            </button>
            <button
              onClick={() => setActiveTab("complaints")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === "complaints"
                  ? "bg-white text-[#285C50] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Complaint Reports
            </button>
          </div>
        </div>

        {/* Tab 1: Transaction Reports */}
        {activeTab === "transactions" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Daily Transaction Report</h3>
              <button
                onClick={() => alert("Downloading Transaction Report Excel...")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Total Txns</th>
                    <th className="px-4 py-2.5">Successful</th>
                    <th className="px-4 py-2.5">Gross Volume (₹)</th>
                    <th className="px-4 py-2.5">Agent Commission (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">2026-08-08 (Today)</td>
                    <td className="px-4 py-2.5">{transactions.length}</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-bold">
                      {transactions.filter((t) => t.status === "SUCCESS").length}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">-</td>
                    <td className="px-4 py-2.5 text-[#285C50] font-bold">₹145.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">2026-08-07</td>
                    <td className="px-4 py-2.5">38</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-bold">36</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">₹42,500.00</td>
                    <td className="px-4 py-2.5 text-[#285C50] font-bold">₹360.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">2026-08-06</td>
                    <td className="px-4 py-2.5">45</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-bold">44</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">₹58,900.00</td>
                    <td className="px-4 py-2.5 text-[#285C50] font-bold">₹440.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Settlement Reports */}
        {activeTab === "settlement" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bank Settlement Summary</h3>
                <p className="text-xs text-slate-500">
                  Settled to: {agentInfo.settlementBank} ({agentInfo.settlementAccount})
                </p>
              </div>
              <button
                onClick={() => alert("Downloading Settlement Statement PDF...")}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Statement
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                  Pending Settlement
                </span>
                <span className="text-sm font-bold text-amber-700">0</span>
                <span className="text-[10px] text-slate-400 block mt-1">T+1 Settlement Batch</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                  Last Settlement (07-Aug)
                </span>
                <span className="text-sm font-bold text-emerald-700">0</span>
                <span className="text-[10px] text-emerald-600 block mt-1">✓ Credited to SBI</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                  Monthly Total Settled
                </span>
                <span className="text-sm font-bold text-[#285C50]">0</span>
                <span className="text-[10px] text-slate-400 block mt-1">AUG-2026 Cycle</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Complaint Reports */}
        {activeTab === "complaints" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Grievance Audit Summary</h3>
              <span className="text-xs font-semibold text-slate-500">
                Total Complaints: {complaints.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Complaint ID</th>
                    <th className="px-4 py-2.5">Disposition</th>
                    <th className="px-4 py-2.5">Assigned To</th>
                    <th className="px-4 py-2.5">Stage</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.complaintId} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono font-bold text-[#285C50]">
                        {c.complaintId}
                      </td>
                      <td className="px-4 py-2.5 text-slate-800">{c.disposition}</td>
                      <td className="px-4 py-2.5 text-slate-600">{c.assignedTo}</td>
                      <td className="px-4 py-2.5 font-semibold text-amber-800">
                        {c.currentStage}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-700">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </BBPSLayout>
  );
}
