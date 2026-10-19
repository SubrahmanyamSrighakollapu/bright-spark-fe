"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, FileText } from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";
import { playPaymentSuccessSound } from "@/lib/marketing/sound-utils";

const CATEGORIES_LIST = [
  "Agent Collection",
  "Broadband Postpaid",
  "Cable TV",
  "Clubs and Associations",
  "Credit Card",
  "DTH",
  "eChallan",
  "Education Fees",
  "Electricity",
  "EV Recharge",
  "Fastag",
  "Fleet Card Recharge",
  "Gas",
  "Housing Society",
  "Insurance",
  "Landline Postpaid",
  "Loan Repayment",
  "LPG Gas",
  "Mobile Postpaid",
  "Mobile Prepaid",
  "Municipal Services",
  "Municipal Taxes",
  "National Pension System",
  "NCMC Recharge",
  "Prepaid Meter",
  "Rental",
  "Subscription",
  "Water",
];

export default function BBPSBillPayPage() {
  const router = useRouter();
  const { processPayment } = useBBPSStore();

  // Selected Category State (Default: Electricity)
  const [selectedCategory, setSelectedCategory] = useState("Electricity");
  const [subType, setSubType] = useState<"Prepaid" | "Postpaid">("Postpaid");
  
  // Mobile / Biller / Base Amount Input States (Exact match with user screenshot)
  const [mobileNumber, setMobileNumber] = useState("883883838");
  const [billerCode, setBillerCode] = useState("OTME");
  const [payAmount, setPayAmount] = useState("1000");

  // Added UAT Bill Details Input Parameters (Requested by User)
  const [paramABCDE, setParamABCDE] = useState("50");
  const [paramABCD, setParamABCD] = useState("40");
  const [paramABC, setParamABC] = useState("30");
  const [paramAB, setParamAB] = useState("20");
  const [paramA, setParamA] = useState("10");

  const [selectedAmountOption, setSelectedAmountOption] = useState("Late Payment Fee - 40");
  const [amount, setAmount] = useState("40");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const handleAmountOptionChange = (opt: string) => {
    setSelectedAmountOption(opt);
    if (opt.includes("- 40")) setAmount("40");
    else if (opt.includes("- 10")) setAmount("10");
    else if (opt.includes("- 20")) setAmount("20");
    else if (opt.includes("- 30")) setAmount("30");
    else if (opt.includes("- 50")) setAmount("50");
    else setAmount("40");
  };

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    playPaymentSuccessSound();
    processPayment();
    router.push("/retailer/bbps/bill-pay/success");
  };

  return (
    <BBPSLayout pageTitle="Bharat Connect Bill Pay">
      <div className="space-y-6">
        {/* Settlement Workspace Container matching User Screenshot Exactly */}
        <div className="bg-sky-400/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          {/* Top Title Bar with Bharat Connect Logo */}
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/40 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                BillPay
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">
                | SETTLEMENT WORKSPACE
              </span>
            </div>
            <div className="px-3 py-1 flex items-center justify-center">
              <Image
                src="/bbps/assets/Bharat Connect Primary Logo_PNG.png"
                alt="Bharat Connect"
                width={140}
                height={35}
                className="h-[35px] w-auto object-contain"
                priority
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar Category List */}
            <div className="lg:col-span-1 bg-sky-300/60 rounded-xl p-3 space-y-2 text-xs font-semibold text-slate-800">
              <div className="text-sm font-extrabold text-slate-900 pb-2 border-b border-sky-400/50 flex items-center justify-between">
                <span>BillPay</span>
                <span className="text-[10px]">▼</span>
              </div>

              <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                {CATEGORIES_LIST.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-white text-[#17362F] font-extrabold shadow-2xs"
                        : "hover:bg-white/40 text-slate-900"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area: Center Form Card + Right Customer Details Card */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Center Card: Recharge or Pay Mobile Bill Form with Added Bill Details Section */}
                <form
                  onSubmit={handleProceedToPay}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Recharge or Pay Mobile Bill
                    </h3>
                    <Link href="/retailer/bbps/bill-pay/fetch" className="text-xs text-[#2F6F5E] font-semibold hover:underline">
                      ← Back to Form
                    </Link>
                  </div>

                  {/* Radio Options: Prepaid / Postpaid */}
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="subType"
                        value="Prepaid"
                        checked={subType === "Prepaid"}
                        onChange={() => setSubType("Prepaid")}
                      />
                      Prepaid
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-cyan-600">
                      <input
                        type="radio"
                        name="subType"
                        value="Postpaid"
                        checked={subType === "Postpaid"}
                        onChange={() => setSubType("Postpaid")}
                      />
                      Postpaid
                    </label>
                  </div>

                  {/* Input: Mobile / Account Number */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="883883838"
                      className="w-full h-10 px-3 border-b-2 border-slate-300 bg-white font-mono font-bold text-slate-900 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Input: Operator Biller Code */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 border-b-2 border-slate-300 pb-1">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={billerCode}
                        onChange={(e) => setBillerCode(e.target.value)}
                        className="font-bold text-slate-900 text-xs bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Input: Amount */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full h-10 px-3 border-b-2 border-slate-300 bg-white font-mono font-bold text-slate-900 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* ========================================================================= */}
                  {/* ADDED SECTION: Bill Details & UAT Input Parameters                       */}
                  {/* ========================================================================= */}
                  <div className="pt-3 border-t border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800">
                      Bill Details
                    </h4>

                    {/* Parameters Grid: a b c d e, a b c d, a b c, a b, a */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <label className="text-[11px] font-medium text-slate-600 font-mono">
                          a b c d e
                        </label>
                        <input
                          type="text"
                          value={paramABCDE}
                          onChange={(e) => setParamABCDE(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100/70 font-mono text-slate-900"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[11px] font-medium text-slate-600 font-mono">
                          a b c d
                        </label>
                        <input
                          type="text"
                          value={paramABCD}
                          onChange={(e) => setParamABCD(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100/70 font-mono text-slate-900"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[11px] font-medium text-slate-600 font-mono">
                          a b c
                        </label>
                        <input
                          type="text"
                          value={paramABC}
                          onChange={(e) => setParamABC(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100/70 font-mono text-slate-900"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[11px] font-medium text-slate-600 font-mono">
                          a b
                        </label>
                        <input
                          type="text"
                          value={paramAB}
                          onChange={(e) => setParamAB(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100/70 font-mono text-slate-900"
                        />
                      </div>

                      <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-medium text-slate-600 font-mono">
                          a
                        </label>
                        <input
                          type="text"
                          value={paramA}
                          onChange={(e) => setParamA(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100/70 font-mono text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Select Amount Option */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Select Amount Option
                      </label>
                      <select
                        value={selectedAmountOption}
                        onChange={(e) => handleAmountOptionChange(e.target.value)}
                        className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white text-slate-900 font-medium focus:outline-none"
                      >
                        <option value="Late Payment Fee - 40">Late Payment Fee - 40</option>
                        <option value="Base Bill Amount - 10">Base Bill Amount - 10</option>
                        <option value="Dynamic Surcharge - 20">Dynamic Surcharge - 20</option>
                        <option value="Fixed Duty Charge - 30">Fixed Duty Charge - 30</option>
                        <option value="Full Settlement - 50">Full Settlement - 50</option>
                      </select>
                    </div>

                    {/* Amount & Payment Mode Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 block">
                          Amount
                        </label>
                        <input
                          type="text"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-100/70 font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 block">
                          Payment Mode
                        </label>
                        <select
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className="w-full h-9 px-2.5 border border-slate-300 rounded-md bg-white text-slate-900 font-medium focus:outline-none"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Agent Wallet">Agent Wallet</option>
                          <option value="UPI">UPI</option>
                          <option value="Credit Card">Credit Card</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Pay Bill Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-10 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Proceed to Pay Bill
                    </button>
                  </div>
                </form>

                {/* Right Card: CUSTOMER DETAILS Itemized Box (Exact Screenshot Match) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <h3 className="text-xs font-bold text-cyan-600 uppercase tracking-wider pb-2 border-b border-slate-100">
                    CUSTOMER DETAILS
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">amountOptions</span>
                      <span className="font-mono text-slate-700">[object Object]</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">billAmount</span>
                      <span className="font-mono font-bold text-slate-900">100000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">billDate</span>
                      <span className="font-mono text-slate-800">2015-06-14</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">billNumber</span>
                      <span className="font-mono text-slate-800">929299829892</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">billPeriod</span>
                      <span className="font-mono text-slate-800">june</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">customerName</span>
                      <span className="font-bold text-slate-900">B-connect</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">dueDate</span>
                      <span className="font-mono text-slate-800">2015-06-20</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-semibold">operator_name</span>
                      <span className="font-mono font-bold text-slate-900">{billerCode || "OTME"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Recent Response Table (Exact Screenshot Match) */}
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm text-xs">
                <table className="w-full text-left">
                  <thead className="bg-purple-900 text-white font-bold uppercase">
                    <tr>
                      <th className="px-4 py-2.5">ID</th>
                      <th className="px-4 py-2.5">REFERENCE NUMBER</th>
                      <th className="px-4 py-2.5">SERVICE</th>
                      <th className="px-4 py-2.5">PROVIDER</th>
                      <th className="px-4 py-2.5">ACCOUNT</th>
                      <th className="px-4 py-2.5">RESPONSE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono">295</td>
                      <td className="px-4 py-2.5 font-mono">
                        6C5376QV3923G7IGYO0INEK1C6MO68H23HP
                      </td>
                      <td className="px-4 py-2.5">POSTPAID</td>
                      <td className="px-4 py-2.5">{billerCode || "OTME"}</td>
                      <td className="px-4 py-2.5 font-mono">{mobileNumber || "883883838"}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-600 truncate max-w-xs">
                        {`{'ExtBillPayResponse': {'responseCode': '000', 'txnRefId': 'CC015169BAAF00005009'}}`}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono">294</td>
                      <td className="px-4 py-2.5 font-mono">
                        AM1EJNMBL8C16KYKU8Z9NF37QXQVQLPKNNQG
                      </td>
                      <td className="px-4 py-2.5">POSTPAID</td>
                      <td className="px-4 py-2.5">{billerCode || "OTME"}</td>
                      <td className="px-4 py-2.5 font-mono">{mobileNumber || "883883838"}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-600 truncate max-w-xs">
                        {`{'ExtBillPayResponse': {'responseCode': '000', 'txnRefId': 'CC015168BAAF00005008'}}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BBPSLayout>
  );
}
