"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useBBPSStore } from "@/lib/bbps-portal-store";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const txnIdParam = searchParams.get("txnId");
  const { transactions } = useBBPSStore();

  useEffect(() => {
    document.title = "BILL PAY RECEIPT";
  }, []);

  const txn =
    transactions.find((t) => t.id === txnIdParam) ||
    transactions[0] || {
      id: "CC014366BAAE00066544",
      billerId: "OTME00006XXX32",
      billerName: "Ronak",
      category: "Electricity",
      customerName: "Vijay",
      customerNumber: "9824568189",
      billNumber: "12303078",
      billDate: "2018-04-12",
      billPeriod: "April",
      dueDate: "2018-04-20",
      billAmount: 350,
      convenienceFee: 15,
      totalAmount: 365,
      paymentMode: "Credit Card",
      date: "2018-04-12 15:23:20",
      status: "SUCCESS",
      approvalNumber: "12303078",
      channel: "ABC",
    };

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      const origTitle = document.title;
      document.title = "BILL PAY RECEIPT";
      window.print();
      document.title = origTitle;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans antialiased text-slate-900">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/retailer/bbps/bill-pay"
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bill Pay
        </Link>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-[#285C50] hover:bg-[#214B42] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      {/* Official Receipt Canvas Document (Screenshot 5 Match) */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Header Title & Top-Right Be-Assured Logo (Screenshot 5) */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
          <h1 className="text-xl font-extrabold text-[#17362F] uppercase tracking-tight">
            BILL PAY RECEIPT
          </h1>
          <div className="text-right">
            <Image
              src="/bbps/assets/B Assured Logo_PNG.png"
              alt="Be Assured Logo"
              width={100}
              height={50}
              className="h-[50px] w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Main Bordered Card Container (Screenshot 5) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {/* Header Bar */}
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-extrabold text-xs text-slate-800">
            Transaction Successful !
          </div>

          {/* 2-Column Key-Value Grid (Screenshot 5) */}
          <div className="p-6 divide-y divide-slate-100 text-xs">
            {/* Row 1 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Biller Name</span>
                <span className="font-bold text-slate-900">{txn.billerName}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">Biller Amount</span>
                <span className="font-bold text-slate-900">{txn.billAmount}</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Biller Id</span>
                <span className="font-mono font-bold text-slate-900">{txn.billerId}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">CCF</span>
                <span className="font-bold text-slate-900">{txn.convenienceFee}</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">B-Connect Txn ID</span>
                <span className="font-mono font-extrabold text-slate-900 select-all">{txn.id}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-extrabold text-[#17362F]">{txn.totalAmount}</span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Customer Name</span>
                <span className="font-bold text-slate-900">{txn.customerName}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">Txn Date & Time</span>
                <span className="font-mono text-slate-800">{txn.date}</span>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Mobile Number</span>
                <span className="font-mono font-bold text-slate-900">{txn.customerNumber}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">Payment Channel</span>
                <span className="font-bold text-slate-900">{txn.channel}</span>
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Bill Date</span>
                <span className="font-mono text-slate-800">{txn.billDate}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">Payment Mode</span>
                <span className="font-bold text-slate-900">{txn.paymentMode}</span>
              </div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Bill Period</span>
                <span className="font-bold text-slate-900">{txn.billPeriod}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">Transaction Status</span>
                <span className="font-bold text-emerald-600">Successful</span>
              </div>
            </div>

            {/* Row 8 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Bill Number</span>
                <span className="font-mono font-bold text-slate-900">{txn.billNumber}</span>
              </div>
              <div className="grid grid-cols-2 pl-4">
                <span className="text-slate-500 font-medium">Approved Number</span>
                <span className="font-mono font-bold text-slate-900">{txn.approvalNumber}</span>
              </div>
            </div>

            {/* Row 9 */}
            <div className="grid grid-cols-2 py-2.5">
              <div className="grid grid-cols-2">
                <span className="text-slate-500 font-medium">Due Date</span>
                <span className="font-mono text-slate-800">{txn.dueDate}</span>
              </div>
              <div className="grid grid-cols-2 pl-4" />
            </div>
          </div>
        </div>

        {/* Centered Download Receipt Blue Button (Screenshot 5) */}
        <div className="text-center pt-4 print:hidden">
          <button
            onClick={handleDownload}
            className="px-10 py-3 bg-[#2F6F5E] hover:bg-[#285C50] text-white font-extrabold text-xs rounded-lg shadow-md transition-all cursor-pointer"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BBPSReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading receipt...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
