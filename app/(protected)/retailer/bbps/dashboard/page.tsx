"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CreditCard, Search, AlertCircle, Clock, CheckCircle,
  XCircle, ChevronRight, FileText
} from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";

export default function BBPSDashboardPage() {
  const { transactions, complaints, agentInfo } = useBBPSStore();

  return (
    <BBPSLayout pageTitle="Retailer Overview Dashboard">
      <div className="space-y-6">
        {/* Quick Actions Card Grid (Matching Reference Screenshot 2) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pay Bill */}
            <Link
              href="/retailer/bbps/bill-pay/fetch"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#2F6F5E] flex items-center justify-center shadow-xs">
                  <Image
                    src="/bbps/assets/B mnemonic_PNG.png"
                    alt="BBPS Icon"
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-slate-400 group-hover:text-[#2F6F5E] transition-colors text-sm font-bold">
                  ↗
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2F6F5E] transition-colors">
                  Pay Bill
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">30+ Categories</p>
              </div>
            </Link>

            {/* Card 2: Search Transaction */}
            <Link
              href="/retailer/bbps/transaction-search"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-400 group-hover:text-[#2F6F5E] transition-colors text-sm font-bold">
                  ↗
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2F6F5E] transition-colors">
                  Search Transaction
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">By B-Connect Txn ID or Mobile</p>
              </div>
            </Link>

            {/* Card 3: Raise Complaint */}
            <Link
              href="/retailer/bbps/raise-complaint"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-400 group-hover:text-[#2F6F5E] transition-colors text-sm font-bold">
                  ↗
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2F6F5E] transition-colors">
                  Raise Complaint
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Register customer ticket</p>
              </div>
            </Link>

            {/* Card 4: Complaint Status */}
            <Link
              href="/retailer/bbps/complaint-status"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-400 group-hover:text-[#2F6F5E] transition-colors text-sm font-bold">
                  ↗
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2F6F5E] transition-colors">
                  Complaint Status
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Track resolution stage</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Grid: Recent Transactions Table & Recent Complaints Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions Table (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Transactions</h3>
                <p className="text-[11px] text-slate-500">Latest executed bill settlements</p>
              </div>
              <Link
                href="/retailer/bbps/transaction-search"
                className="text-xs text-[#2F6F5E] font-semibold hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">B-Connect Txn ID</th>
                    <th className="px-4 py-3">Biller Name</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-800 font-bold">
                        {txn.id}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        <div className="truncate max-w-[160px]" title={txn.billerName}>
                          {txn.billerName}
                        </div>
                        <span className="text-[10px] text-slate-400">{txn.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{txn.customerName}</div>
                        <span className="text-[10px] text-slate-400">{txn.customerNumber}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        -
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-700">
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/retailer/bbps/bill-pay/receipt?txnId=${txn.id}`}
                          className="text-[#2F6F5E] hover:text-[#214B42] font-semibold hover:underline"
                        >
                          Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Complaints Table (Spans 1 column) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Complaints</h3>
                  <p className="text-[11px] text-slate-500">Grievances audit log</p>
                </div>
                <Link
                  href="/retailer/bbps/complaint-status"
                  className="text-xs text-[#2F6F5E] font-semibold hover:underline"
                >
                  Track Status
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {complaints.slice(0, 4).map((c) => (
                  <div key={c.complaintId} className="p-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {c.complaintId}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-1 font-medium">
                      {c.disposition}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>{c.createdDate}</span>
                      <Link
                        href={`/retailer/bbps/complaint-status?id=${c.complaintId}`}
                        className="text-[#2F6F5E] hover:underline font-semibold"
                      >
                        Track →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link
                href="/retailer/bbps/raise-complaint"
                className="text-xs text-[#2F6F5E] font-bold hover:underline"
              >
                + Register New Complaint
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BBPSLayout>
  );
}
