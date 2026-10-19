"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore, Transaction } from "@/lib/bbps-portal-store";

export default function BBPSTransactionSearchPage() {
  const { transactions } = useBBPSStore();

  const [mobileNumber, setMobileNumber] = useState("7708841944");
  const [startDate, setStartDate] = useState("2025-06-18");
  const [endDate, setEndDate] = useState("2025-06-19");
  const [txnId, setTxnId] = useState("CC015120BAAE00094037");

  const [searchResults, setSearchResults] = useState<Transaction[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (txnId.trim()) {
        const res = transactions.filter((t) =>
          t.id.toLowerCase().includes(txnId.trim().toLowerCase())
        );
        setSearchResults(res.length > 0 ? res : transactions);
      } else {
        setSearchResults(transactions);
      }
    }, 400);
  };

  return (
    <BBPSLayout pageTitle="Query Transaction">
      <div className="space-y-6">
        {/* Main Query Transaction Form Canvas (Matching PDF Page 5 & Screenshot 1) */}
        <div className="bg-sky-300/80 rounded-2xl p-6 shadow-sm min-h-[460px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar Menu (Matching Screenshot 1) */}
            <div className="md:col-span-1 bg-sky-200/60 rounded-xl p-3 space-y-2 text-xs font-semibold text-slate-800">
              <div className="text-sm font-extrabold text-slate-900 pb-2 border-b border-sky-400/50 flex items-center justify-between">
                <span>BillPay</span>
                <span className="text-[10px]">&gt;</span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 py-1">Complaint v</div>
                <Link href="/retailer/bbps/raise-complaint" className="block px-2 py-1 text-slate-700 hover:text-[#285C50]">
                  Complaint Registration
                </Link>
                <Link href="/retailer/bbps/complaint-status" className="block px-2 py-1 text-slate-700 hover:text-[#285C50]">
                  Complaint Tracking
                </Link>
                <div className="block px-2 py-1 text-slate-700">Description content</div>
                <Link href="/retailer/bbps/transaction-search" className="block px-2 py-1 font-bold text-[#17362F] bg-white/60 rounded">
                  Search Transaction
                </Link>
                <Link href="/retailer/bbps/dashboard" className="block px-2 py-1 text-slate-700 hover:text-[#285C50]">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Form Content Area (Matching PDF Page 5 & Screenshot 1) */}
            <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
              {/* Header Row: Title & Top-Right Bharat Connect Logo */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-red-500 tracking-tight">
                  Query Transaction
                </h2>
                <div className="px-3 py-1">
                  <Image
                    src="/bbps/assets/Bharat Connect Primary Logo_PNG.png"
                    alt="Bharat Connect"
                    width={140}
                    height={35}
                    className="h-[32px] w-auto object-contain"
                    priority
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md text-xs">
                {/* Enter MobileNumber */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Enter MobileNumber</label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="7708841944"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono focus:border-[#2F6F5E] focus:outline-none"
                  />
                </div>

                {/* Enter Dates: Starts on & Ends on */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Enter Dates</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <span className="text-[10px] text-slate-400">Starts on</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent font-mono text-slate-800 w-full focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <span className="text-[10px] text-slate-400">Ends on</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent font-mono text-slate-800 w-full focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* B-Connect Txn ID */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">B-Connect Txn ID</label>
                  <input
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="CC015120BAAE00094037"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono focus:border-[#2F6F5E] focus:outline-none"
                  />
                </div>

                {/* Submit Primary Blue Button (Screenshot 1) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-6 py-2 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-bold text-xs rounded-md transition-colors cursor-pointer shadow-2xs"
                  >
                    {isSearching ? "Searching..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900 bg-slate-50">
              Query Search Results ({searchResults.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">B-Connect Txn ID</th>
                    <th className="px-4 py-2.5">Agent ID</th>
                    <th className="px-4 py-2.5">Biller Name</th>
                    <th className="px-4 py-2.5">Amount (₹)</th>
                    <th className="px-4 py-2.5">Txn Date</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchResults.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono font-bold text-[#285C50]">{t.id}</td>
                      <td className="px-4 py-2.5 font-mono">{t.agentId}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{t.billerName}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">-</td>
                      <td className="px-4 py-2.5 text-slate-600">{t.date}</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-700">{t.status}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          href={`/retailer/bbps/bill-pay/receipt?txnId=${t.id}`}
                          className="text-[#2F6F5E] hover:underline font-semibold"
                        >
                          View Receipt
                        </Link>
                      </td>
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
