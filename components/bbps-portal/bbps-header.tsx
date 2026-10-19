"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, Search, AlertCircle, FileBarChart, User, 
  LogOut, RefreshCw, ChevronDown, ShieldCheck 
} from "lucide-react";
import { useBBPSStore } from "@/lib/bbps-portal-store";
import { cn } from "@/lib/marketing/utils";
import { useAuth } from "@/context/AuthContext";

interface BBPSHeaderProps {
  pageTitle?: string;
}

export function BBPSHeader({ pageTitle }: BBPSHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { agentInfo } = useBBPSStore();
  const { logout } = useAuth();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
      {/* Top Utility Header Bar */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between border-b border-slate-100">
        {/* Left: Agent Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/retailer/bbps/dashboard" className="flex items-center gap-2">
            <Image
              src="/bbps/assets/web-logo.jpg"
              alt="Bright Spark"
              width={160}
              height={40}
              className="h-10 w-auto object-contain rounded-lg"
              priority
            />
          </Link>
        </div>

        {/* Right: Agent Welcome & Balance Controls (No Loyalty Cashback Badge, Balance 0) */}
        <div className="flex items-center gap-4 text-xs">
          {/* Welcome Message */}
          <div className="hidden sm:block text-slate-600">
            Welcome <span className="font-extrabold text-slate-900">{agentInfo.retailerName.toUpperCase()}</span>,{" "}
            <span className="font-mono text-slate-500">{agentInfo.agentId}</span>
          </div>

          {/* Balance Widget (Balance 0) */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Balance:</span>
            <span className="font-extrabold text-slate-900 font-mono">
              0
            </span>
            <button
              onClick={() => alert("Balance refreshed: 0")}
              title="Refresh Balance"
              className="text-slate-400 hover:text-[#2F6F5E] ml-1"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* My Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAccountMenu(!showAccountMenu);
                setShowServicesMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#214B42] text-white font-bold rounded-lg text-xs hover:bg-[#17362F] transition-colors shadow-2xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" /> My Account <ChevronDown className="w-3 h-3" />
            </button>

            {showAccountMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAccountMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 text-xs">{agentInfo.agencyName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{agentInfo.email}</p>
                  </div>
                  <Link
                    href="/retailer/bbps/profile"
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" /> View Agent Profile
                  </Link>
                  <Link
                    href="/retailer/bbps/reports"
                    onClick={() => setShowAccountMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <FileBarChart className="w-4 h-4 text-slate-400" /> Daily Reports
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1 font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Horizontal Navigation Bar (Clean z-index & no overflow clipping) */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-12 flex items-center gap-8 relative z-30">
        {navItems.map((item, idx) => {
          if (item.isServices) {
            return (
              <div key={idx} className="relative">
                <button
                  onClick={() => {
                    setShowServicesMenu(!showServicesMenu);
                    setShowAccountMenu(false);
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
