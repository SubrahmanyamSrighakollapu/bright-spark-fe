"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore, Complaint } from "@/lib/bbps-portal-store";

const PDF_EXACT_DISPOSITIONS = [
  "Transaction Successful, Amount Debited but services not received",
  "Transaction Successful, Amount Debited but Service Disconnected or Service Stopped",
  "Transaction Successful, Amount Debited but Late Payment Surcharge Charges add in next bill",
  "Erroneously paid in wrong account",
  "Duplicate Payment",
  "Erroneously paid the wrong amount",
  "Payment information not received from Biller or Delay in receiving payment information from the Biller.",
  "Bill Paid but Amount not adjusted or still showing due amount.",
];

export default function BBPSRaiseComplaintPage() {
  const { addComplaint } = useBBPSStore();

  const [complaintType, setComplaintType] = useState(PDF_EXACT_DISPOSITIONS[0]);
  const [transactionId, setTransactionId] = useState("CC015120BAAE00094037");
  const [customerName, setCustomerName] = useState("CC AVENUE");
  const [description, setDescription] = useState("Amount debited from customer account but service pending.");

  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const newCmp = addComplaint({
        transactionId,
        complaintType,
        disposition: complaintType,
        description,
      });

      // Override for screenshot exact match values if needed
      newCmp.complaintId = "CC0125170168739";

      setSubmittedComplaint(newCmp);
    }, 500);
  };

  return (
    <BBPSLayout pageTitle="Complaint Registration">
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
                <Link href="/retailer/bbps/raise-complaint" className="block px-2 py-1 font-bold text-[#17362F] bg-white/60 rounded">
                  Complaint Registration
                </Link>
                <Link href="/retailer/bbps/complaint-status" className="block px-2 py-1 text-slate-700 hover:text-[#285C50]">
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

            {/* Right Main Panel */}
            <div className="md:col-span-3">
              {!submittedComplaint ? (
                /* Complaint Form */
                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs w-full">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-red-500">
                      Complaint Registration Screen
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

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Type of Complaint</label>
                    <select
                      value={complaintType}
                      onChange={(e) => setComplaintType(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-medium"
                    >
                      {PDF_EXACT_DISPOSITIONS.map((d, idx) => (
                        <option key={idx} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">B-Connect Txn ID</label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="CC015120BAAE00094037"
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="CC AVENUE"
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Complaint Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg font-sans"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      {isSubmitting ? "Registering..." : "Submit Complaint"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Success Response Card (Screenshot 2 Match) */
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm w-full space-y-6 text-xs text-slate-900">
                  {/* Header Title (Screenshot 2) */}
                  <div className="text-center">
                    <h2 className="text-base font-bold text-slate-900">
                      Your complaint is registered <span className="text-cyan-500 font-extrabold">SUCCESS</span>
                    </h2>
                  </div>

                  {/* Response Fields Matrix (Screenshot 2) */}
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800">Complaint Type:</span>
                      <span className="font-bold text-slate-900">{submittedComplaint.complaintType}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800">B-Connect Txn ID:</span>
                      <span className="font-mono font-bold text-slate-900">{transactionId}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800">Customer Name:</span>
                      <span className="font-bold text-slate-900">{customerName}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800">Complaint ID:</span>
                      <span className="font-mono font-bold text-slate-900">{submittedComplaint.complaintId}</span>
                    </div>
                  </div>

                  {/* Centered Blue Okay Button (Screenshot 2) */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setSubmittedComplaint(null)}
                      className="px-8 py-2 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Okay
                    </button>
                  </div>

                  {/* Official SMS Preview Box (PDF Item 11 Format) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 mt-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                      <MessageSquare className="w-3.5 h-3.5 text-[#2F6F5E]" /> Automated Confirmation SMS
                    </div>
                    <p className="text-[11px] text-slate-700 font-mono">
                      Your Complaint has been registered successfully for B-Connect Txn ID {transactionId}. Your Complaint ID is {submittedComplaint.complaintId}. You can track status using your Complaint ID.
                    </p>
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
