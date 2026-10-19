"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";

function ComplaintStatusContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [complaintIdInput, setComplaintIdInput] = useState(idParam || "CC0125170168739");
  const [showStatusResult, setShowStatusResult] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const handleQueryStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowStatusResult(true);
    }, 400);
  };

  return (
    <BBPSLayout pageTitle="Complaint Tracking">
      <div className="space-y-6">
        <div className="bg-sky-300/80 rounded-2xl p-6 shadow-sm min-h-[460px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar Menu */}
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
                <Link href="/retailer/bbps/complaint-status" className="block px-2 py-1 font-bold text-[#17362F] bg-white/60 rounded">
                  Complaint Tracking
                </Link>
                <div className="block px-2 py-1 text-slate-700">Description content</div>
                <Link href="/retailer/bbps/transaction-search" className="block px-2 py-1 text-slate-700 hover:text-[#285C50]">
                  Search Transaction
                </Link>
                <Link href="/retailer/bbps/dashboard" className="block px-2 py-1 text-slate-700 hover:text-[#285C50]">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Right Content Panel (Matching Screenshot 3) */}
            <div className="md:col-span-3 space-y-6">
              {/* Form Box: Check Complaint Status (Screenshot 3) */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm w-full space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-red-500">
                    Check Complaint Status
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

                <form onSubmit={handleQueryStatus} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Complaint ID</label>
                    <input
                      type="text"
                      required
                      value={complaintIdInput}
                      onChange={(e) => setComplaintIdInput(e.target.value)}
                      placeholder="CC0125170168739"
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono font-bold focus:border-[#2F6F5E] focus:outline-none max-w-sm"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-6 py-2 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      {isSearching ? "Checking..." : "Okay"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Status Result Display Card (Screenshot 3 Match) */}
              {showStatusResult && (
                <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm w-full space-y-6 text-xs text-slate-900">
                  {/* Status Title (Screenshot 3) */}
                  <div className="text-center">
                    <h3 className="text-base font-bold text-slate-900">
                      Your complaint Status <span className="font-extrabold text-slate-900">SUCCESS</span>
                    </h3>
                  </div>

                  {/* Status Key-Value Matrix (Screenshot 3) */}
                  <div className="space-y-4 font-sans max-w-md mx-auto">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-bold text-slate-800">ComplaintAssigned :</span>
                      <span className="font-bold text-slate-900">CC AVENUE</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-bold text-slate-800">ComplaintId :</span>
                      <span className="font-mono font-bold text-slate-900">{complaintIdInput}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-bold text-slate-800">ComplaintStatus :</span>
                      <span className="font-bold text-emerald-700">SUCCESS</span>
                    </div>
                  </div>

                  {/* Centered Blue Okay Button (Screenshot 3) */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => alert("Complaint status confirmed.")}
                      className="px-8 py-2 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Okay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BBPSLayout>
  );
}

export default function BBPSComplaintStatusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading complaint tracking...</div>}>
      <ComplaintStatusContent />
    </Suspense>
  );
}
