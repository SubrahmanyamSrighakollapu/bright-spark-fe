"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, CheckSquare, Square, Wallet, CreditCard, Landmark, 
  Smartphone, ShieldCheck, ArrowRight, AlertCircle, FileText, CheckCircle2 
} from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";
import { playPaymentSuccessSound } from "@/lib/marketing/sound-utils";

export default function BBPSBillDetailsPage() {
  const router = useRouter();
  const { currentBillDetails, toggleAmountOption, setPaymentMode, processPayment, agentInfo } = useBBPSStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fallback if no bill state found
  const bill = currentBillDetails || {
    billerId: "OTME00005XXZ43",
    billerName: "Adani Electricity Mumbai Ltd",
    category: "Electricity",
    customerName: "Rajesh Sharma",
    customerNumber: "9898990084",
    caNumber: "102938475",
    billDate: "2026-07-28",
    billPeriod: "JUL-2026",
    billNumber: "EL-2026-99201",
    dueDate: "2026-08-20",
    baseAmount: 1450,
    latePaymentFee: 50,
    additionalCharges: 25,
    fixedCharges: 15,
    convenienceFee: 10,
    selectedOptions: {
      baseAmount: true,
      latePaymentFee: true,
      additionalCharges: true,
      fixedCharges: true,
    },
    paymentMode: "Agent Wallet",
  };

  // Calculations
  const base = bill.selectedOptions.baseAmount ? bill.baseAmount : 0;
  const late = bill.selectedOptions.latePaymentFee ? bill.latePaymentFee : 0;
  const add = bill.selectedOptions.additionalCharges ? bill.additionalCharges : 0;
  const fixed = bill.selectedOptions.fixedCharges ? bill.fixedCharges : 0;
  const conv = bill.convenienceFee || 10;
  const totalAmount = base + late + add + fixed + conv;

  const handleConfirmPay = () => {
    setIsProcessing(true);
    playPaymentSuccessSound();
    setTimeout(() => {
      processPayment();
      setIsProcessing(false);
      setShowConfirmModal(false);
      router.push("/retailer/bbps/bill-pay/success");
    }, 800);
  };

  return (
    <BBPSLayout pageTitle="Bill Review & Payment Calculation">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/retailer/bbps/bill-pay/fetch"
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Edit Fetch Parameters
          </Link>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Bill Fetched Successfully
          </span>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Biller & Customer Details Summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer & Biller Info Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6F5E]">
                    Biller Name
                  </span>
                  <h2 className="text-base font-bold text-slate-900">{bill.billerName}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Biller ID
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800">{bill.billerId}</p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Customer Name
                  </span>
                  <span className="font-bold text-slate-800">{bill.customerName}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Customer Mobile
                  </span>
                  <span className="font-bold text-slate-800">{bill.customerNumber}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    CA Number
                  </span>
                  <span className="font-mono font-bold text-slate-800">{bill.caNumber}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Bill Number
                  </span>
                  <span className="font-mono font-bold text-slate-800">{bill.billNumber}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Bill Date & Period
                  </span>
                  <span className="font-bold text-slate-800">
                    {bill.billDate} ({bill.billPeriod})
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] text-amber-700 font-semibold block uppercase">
                    Due Date
                  </span>
                  <span className="font-bold text-amber-900">{bill.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Multiple Amount Options Component (Checkboxes) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Multiple Amount Options Selection
                </h3>
                <span className="text-[11px] text-slate-500">
                  Select applicable bill components
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Option 1: Base Bill Amount */}
                <div
                  onClick={() => toggleAmountOption("baseAmount")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    bill.selectedOptions.baseAmount
                      ? "bg-[#F3F7E9]/50 border-[#6D8E37]"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bill.selectedOptions.baseAmount ? (
                      <CheckSquare className="w-5 h-5 text-[#2F6F5E]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">Base Bill Amount</div>
                      <div className="text-[11px] text-slate-500">Core electricity consumption tariff</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₹{bill.baseAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Option 2: Late Payment Fee */}
                <div
                  onClick={() => toggleAmountOption("latePaymentFee")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    bill.selectedOptions.latePaymentFee
                      ? "bg-[#F3F7E9]/50 border-[#6D8E37]"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bill.selectedOptions.latePaymentFee ? (
                      <CheckSquare className="w-5 h-5 text-[#2F6F5E]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">Late Payment Fee</div>
                      <div className="text-[11px] text-slate-500">Overdue surcharge</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₹{bill.latePaymentFee.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Option 3: Additional Charges */}
                <div
                  onClick={() => toggleAmountOption("additionalCharges")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    bill.selectedOptions.additionalCharges
                      ? "bg-[#F3F7E9]/50 border-[#6D8E37]"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bill.selectedOptions.additionalCharges ? (
                      <CheckSquare className="w-5 h-5 text-[#2F6F5E]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">Additional Charges</div>
                      <div className="text-[11px] text-slate-500">Meter maintenance / Duty charge</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₹{bill.additionalCharges.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Option 4: Fixed Charges */}
                <div
                  onClick={() => toggleAmountOption("fixedCharges")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    bill.selectedOptions.fixedCharges
                      ? "bg-[#F3F7E9]/50 border-[#6D8E37]"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bill.selectedOptions.fixedCharges ? (
                      <CheckSquare className="w-5 h-5 text-[#2F6F5E]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-800">Fixed Charges</div>
                      <div className="text-[11px] text-slate-500">Infrastructure fixed levy</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₹{bill.fixedCharges.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Select Retailer Payment Mode</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { mode: "Agent Wallet", icon: Wallet },
                  { mode: "Cash", icon: FileText },
                  { mode: "UPI", icon: Smartphone },
                  { mode: "Net Banking", icon: Landmark },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = bill.paymentMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setPaymentMode(item.mode)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#2F6F5E] text-white font-bold border-[#285C50] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{item.mode}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Total Calculation & Checkout Card */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-20">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Selected Bill Charges</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(base + late + add + fixed).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Convenience Fee</span>
                  <span className="font-semibold text-slate-800">
                    ₹{conv.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Payable</span>
                  <span className="text-xl font-extrabold text-[#285C50]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Agent Balance status warning */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Agent Wallet Balance:</span>
                  <span className="font-bold text-slate-800">
                    ₹{agentInfo.walletBalance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  ✓ Sufficient balance available for instant settlement.
                </div>
              </div>

              {/* Proceed to Pay Button */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full h-12 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Pay ₹{totalAmount.toLocaleString("en-IN")} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-slate-400">
                Encrypted BBPS Transaction Node Connection
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Confirm BBPS Bill Payment</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F3F7E9] rounded-xl border border-[#E7EFD2] space-y-1">
                  <div className="text-[11px] text-[#285C50] font-semibold">Payee Details</div>
                  <div className="font-bold text-[#102620]">{bill.customerName} ({bill.customerNumber})</div>
                  <div className="text-slate-600">{bill.billerName}</div>
                </div>

                <div className="flex justify-between py-2 border-y border-slate-100">
                  <span className="font-semibold text-slate-600">Total Deduction:</span>
                  <span className="font-extrabold text-[#285C50] text-sm">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  By clicking confirm, ₹{totalAmount.toLocaleString("en-IN")} will be debited from your retailer wallet to settle this bill instantly.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPay}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-[#2F6F5E] text-white rounded-xl text-xs font-bold hover:bg-[#285C50] shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm & Pay"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BBPSLayout>
  );
}
