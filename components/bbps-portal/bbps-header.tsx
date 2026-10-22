"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  AlertCircle, FileBarChart, ChevronDown, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/marketing/utils";

export function BBPSHeader() {
  const pathname = usePathname();
  const [showServicesMenu, setShowServicesMenu] = useState(false);

  const navItems = [
    { label: "Home", href: "/retailer/bbps/dashboard" },
    { 
      label: "Pay Bills", 
      href: "/retailer/bbps/bill-pay/fetch", 
      isPayBills: true 
    },
    { label: "Services", href: "#services", isServices: true },
    { label: "Bill History", href: "/retailer/bbps/transaction-search" },
    { label: "Profile", href: "/retailer/bbps/profile" },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-2xs font-sans select-none sticky top-0 z-50">
      {/* Main Horizontal Navigation Bar (Clean z-index & no overflow clipping) */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-12 flex items-center gap-8 relative z-30">
        {navItems.map((item, idx) => {
          if (item.isServices) {
            return (
              <div key={idx} className="relative">
                <button
                  onClick={() => {
                    setShowServicesMenu(!showServicesMenu);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold py-2 text-slate-700 hover:text-[#2F6F5E] transition-colors cursor-pointer"
                >
                  Services <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showServicesMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowServicesMenu(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                      <Link
                        href="/retailer/bbps/raise-complaint"
                        onClick={() => setShowServicesMenu(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2F6F5E] font-medium transition-colors"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-500" /> Raise Complaint
                      </Link>
                      <Link
                        href="/retailer/bbps/complaint-status"
                        onClick={() => setShowServicesMenu(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2F6F5E] font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#6D8E37]" /> Complaint Status
                      </Link>
                      <Link
                        href="/retailer/bbps/reports"
                        onClick={() => setShowServicesMenu(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#2F6F5E] font-medium transition-colors"
                      >
                        <FileBarChart className="w-4 h-4 text-purple-500" /> Financial Reports
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href || (item.href !== "/retailer/bbps/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold py-2 transition-all shrink-0",
                isActive
                  ? "text-[#2F6F5E] font-bold"
                  : "text-slate-700 hover:text-[#2F6F5E]"
              )}
            >
              {item.isPayBills ? (
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/bbps/assets/B mnemonic_PNG.png"
                    alt="BBPS Icon"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                  <span className={isActive ? "text-[#2F6F5E] font-bold" : "text-slate-700"}>
                    {item.label}
                  </span>
                </div>
              ) : (
                item.label
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
