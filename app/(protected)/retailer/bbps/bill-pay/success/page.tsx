"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";
import { playPaymentSuccessSound } from "@/lib/marketing/sound-utils";

export default function BBPSPaymentSuccessPage() {
  const { lastTransaction } = useBBPSStore();

  const txn = lastTransaction || {
    id: "CC015170BAAF00005029",
    agentId: "AG-883920",
    billerId: "OTME00005XXZ43",
    billerName: "OTME",
    category: "Electricity",
    customerName: "B-connect",
    customerNumber: "7708841944",
    billNumber: "12303",
    billDate: "2015-06-14",
    billPeriod: "june",
    dueDate: "2015-06-20",
    totalAmount: 1000,
    paymentMode: "Agent Wallet",
    status: "SUCCESS",
  };

  return (
    <BBPSLayout pageTitle="Payment Confirmation">
      {/* Background Canvas Overlay simulating Screenshot 4 Modal backdrop */}
      <div className="min-h-[520px] bg-sky-400/80 rounded-2xl p-4 sm:p-8 flex items-center justify-center relative">
        {/* Modal Window Card matching Screenshot 4 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative space-y-6 animate-in zoom-in-95 duration-150">
          {/* Top-Right Be-Assured Logo on Modal (Screenshot 4) */}
          <div className="absolute top-4 right-4">
            <Image
              src="/bbps/assets/B Assured Logo_PNG.png"
              alt="Be Assured Logo"
              width={70}
              height={70}
              className="w-14 h-14 object-contain"
              priority
            />
          </div>

          {/* Header Icon & Title (Screenshot 4) */}
          <div className="text-center space-y-2 pt-2">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto border border-slate-200">
              <FileText className="w-8 h-8 text-slate-700" />
            </div>
            <h2 className="text-base font-extrabold text-emerald-600 tracking-tight">
              Transaction success!
            </h2>
          </div>

          {/* Itemized Key-Value Data List (Screenshot 4) */}
          <div className="space-y-2.5 text-xs text-slate-800 border-t border-b border-slate-100 py-4 font-sans">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">B-Connect Txn ID</span>
              <span className="font-mono font-extrabold text-slate-900 select-all">
                {txn.id}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Biller ID</span>
              <span className="font-mono font-bold text-slate-900">{txn.billerId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Biller Name</span>
              <span className="font-bold text-slate-900">{txn.billerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Customer Name</span>
              <span className="font-bold text-slate-900">{txn.customerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Customer Number</span>
              <span className="font-mono font-bold text-slate-900">{txn.customerNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Bill Date</span>
              <span className="font-mono text-slate-800">{txn.billDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Bill Number</span>
              <span className="font-mono font-bold text-slate-900">{txn.billNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Bill Period</span>
              <span className="font-mono text-slate-800">{txn.billPeriod}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Due Date</span>
              <span className="font-mono text-slate-800">{txn.dueDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/retailer/bbps/bill-pay/receipt?txnId=${txn.id}`}
              className="flex-1 py-3 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-extrabold text-xs rounded-xl transition-colors text-center shadow-xs flex items-center justify-center gap-1.5"
            >
              View Official Receipt <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/retailer/bbps/bill-pay"
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center"
            >
              Pay Another Bill
            </Link>
          </div>
        </div>
      </div>
    </BBPSLayout>
  );
}
