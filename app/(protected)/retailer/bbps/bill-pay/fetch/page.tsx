"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Zap } from "lucide-react";
import { BBPSLayout } from "@/components/bbps-portal/bbps-layout";
import { useBBPSStore } from "@/lib/bbps-portal-store";

const ALL_BBPS_CATEGORIES = [
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

const BILLERS_MAP: Record<string, { id: string; name: string }[]> = {
  Electricity: [
    { id: "OTME00005XXZ43", name: "OTME00005XXZ43 - Fetch and Pay" },
    { id: "OTNS00005XXZ43", name: "OTNS00005XXZ43 - Quick Pay" },
    { id: "APCPDCL0001", name: "Andhra Pradesh Central Power Distribution Corporation" },
    { id: "TATA00001", name: "Tata Power Mumbai" },
    { id: "BSES00001", name: "BSES Rajdhani Power Limited" },
  ],
  "Mobile Postpaid": [
    { id: "OTNS00005XXZ43", name: "OTNS00005XXZ43 - Quick Pay" },
    { id: "OTME00005XXZ43", name: "OTME00005XXZ43 - Fetch and Pay" },
    { id: "JIO00001", name: "Jio Postpaid Mobile" },
    { id: "VI00001", name: "Vodafone Idea (VI) Postpaid" },
  ],
  Gas: [
    { id: "OTME00005XXZ43", name: "OTME00005XXZ43 - Fetch and Pay" },
    { id: "OTNS00005XXZ43", name: "OTNS00005XXZ43 - Quick Pay" },
  ],
};

export default function BBPSBillFetchPage() {
  const router = useRouter();
  const { currentFetchParams, setFetchParams, setBillDetails } = useBBPSStore();

  const [selectedCategory, setSelectedCategory] = useState(
    currentFetchParams.category || ""
  );
  const [selectedBiller, setSelectedBiller] = useState(
    currentFetchParams.billerName || ""
  );
  const [billerId, setBillerId] = useState(
    currentFetchParams.billerId || ""
  );
  const [mobileNumber, setMobileNumber] = useState(
    currentFetchParams.mobileNumber || "9898990084"
  );
  const [connectionNumber, setConnectionNumber] = useState(
    currentFetchParams.caNumber || "102938475"
  );
  const [isFetching, setIsFetching] = useState(false);

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    setSelectedBiller("");
    setBillerId("");
  };

  const handleBillerChange = (billerName: string) => {
    setSelectedBiller(billerName);
    const found = (BILLERS_MAP[selectedCategory] || []).find((b) => b.name === billerName);
    const targetId = found ? found.id : "OTME00005XXZ43";
    setBillerId(targetId);

    // Auto preset UAT mobile number
    if (targetId === "OTNS00005XXZ43") {
      setMobileNumber("9898990083");
    } else {
      setMobileNumber("9898990084");
    }
  };

  const handleFetchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFetching(true);

    setTimeout(() => {
      setIsFetching(false);

      const targetId = billerId || "OTME00005XXZ43";
      const mob = mobileNumber || (targetId === "OTNS00005XXZ43" ? "9898990083" : "9898990084");

      setFetchParams({
        category: selectedCategory || "Electricity",
        billerId: targetId,
        billerName: selectedBiller || `${selectedCategory || "Electricity"} Biller`,
        mobileNumber: mob,
        customerNumber: mob,
        caNumber: connectionNumber || "102938475",
        customerName: "Rajesh Sharma",
      });

      setBillDetails({
        billerId: targetId,
        billerName: selectedBiller || `${selectedCategory || "Electricity"} Biller`,
        category: selectedCategory || "Electricity",
        customerName: "Rajesh Sharma",
        customerNumber: mob,
        caNumber: connectionNumber || "102938475",
        billDate: "2026-07-28",
        billPeriod: "JUL-2026",
        billNumber: `EL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        dueDate: "2026-08-20",
        baseAmount: mob === "9898990083" ? 899 : 1450,
        latePaymentFee: 40,
        additionalCharges: 25,
        fixedCharges: 15,
        convenienceFee: 10,
        selectedOptions: {
          baseAmount: true,
          latePaymentFee: true,
          additionalCharges: true,
          fixedCharges: true,
        },
        paymentMode: "Cash",
      });

      // Redirect to Settlement Workspace Page (/retailer/bbps/bill-pay) with embedded Bill Details fields
      router.push("/retailer/bbps/bill-pay");
    }, 500);
  };

  return (
    <BBPSLayout pageTitle="Pay Bills — Category & Biller Selection">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Row with Bharat Connect Logo on Right (Screenshot Match) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
            BILL
          </h1>
          <div className="px-3 py-1">
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

        {/* 2-Column Layout (Matching Screenshot 100%) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4">
          {/* Left Column: pay-bill-image illustration */}
          <div className="flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <Image
              src="/bbps/assets/pay-bill-image.png"
              alt="Pay Bill Illustration"
              width={420}
              height={420}
              className="w-full max-w-[380px] h-auto object-contain"
              priority
            />
          </div>

          {/* Right Column: Bharat Connect Billers Card */}
          <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">
                Bharat Connect Billers
              </h3>
            </div>

            <form onSubmit={handleFetchSubmit} className="p-6 space-y-5 text-xs">
              {/* Step 1: Biller Category Dropdown (30 BBPS Categories) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Biller Category<span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-slate-900 font-semibold focus:border-[#2F6F5E] focus:outline-none"
                  required
                >
                  <option value="" disabled>
                    -- Select Biller Category --
                  </option>
                  {ALL_BBPS_CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Revealed ONLY after Biller Category is selected */}
              {selectedCategory !== "" && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-800 block">
                    Biller Name<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBiller}
                    onChange={(e) => handleBillerChange(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-slate-900 font-semibold focus:border-[#2F6F5E] focus:outline-none truncate"
                    required
                  >
                    <option value="" disabled>
                      -- Select Biller Name --
                    </option>
                    {(
                      BILLERS_MAP[selectedCategory] || [
                        { id: "OTME00005XXZ43", name: "OTME00005XXZ43 - Fetch and Pay" },
                        { id: "OTNS00005XXZ43", name: "OTNS00005XXZ43 - Quick Pay" },
                      ]
                    ).map((b, idx) => (
                      <option key={idx} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3: Revealed ONLY after Biller Name is selected */}
              {selectedBiller !== "" && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  {/* Customer Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Customer Mobile Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter customer 10-digit mobile number"
                      className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-slate-900 font-semibold focus:border-[#2F6F5E] focus:outline-none"
                    />
                  </div>

                  {/* Service Connection / Account Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      {selectedCategory === "Electricity"
                        ? "13 Digit Service Connection Number*"
                        : "Customer Account / CA Number*"}
                    </label>
                    <input
                      type="text"
                      required
                      value={connectionNumber}
                      onChange={(e) => setConnectionNumber(e.target.value)}
                      placeholder="Enter account connection number"
                      className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-slate-900 font-semibold focus:border-[#2F6F5E] focus:outline-none"
                    />
                  </div>

                  {/* Step 4: Centered Teal Fetch Bill Button (Screenshot Exact Match) */}
                  <div className="text-center pt-3">
                    <button
                      type="submit"
                      disabled={isFetching}
                      className="px-8 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-75"
                    >
                      {isFetching ? "Fetching Bill..." : "Fetch Bill"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </BBPSLayout>
  );
}
