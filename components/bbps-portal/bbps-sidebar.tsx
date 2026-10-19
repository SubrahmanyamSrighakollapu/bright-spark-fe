"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Search,
  AlertCircle,
  Clock,
  FileBarChart,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useBBPSStore } from "@/lib/bbps-portal-store";
import { cn } from "@/lib/marketing/utils";
import { useAuth } from "@/context/AuthContext";

interface BBPSSidebarProps {
  onCloseMobile?: () => void;
}

export function BBPSSidebar({ onCloseMobile }: BBPSSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { agentInfo } = useBBPSStore();
  const { logout } = useAuth();

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/retailer/bbps/dashboard", icon: LayoutDashboard },
    { label: "Bill Pay", href: "/retailer/bbps/bill-pay/fetch", icon: CreditCard },
    { label: "Transaction Search", href: "/retailer/bbps/transaction-search", icon: Search },
    { label: "Raise Complaint", href: "/retailer/bbps/raise-complaint", icon: AlertCircle },
    { label: "Complaint Status", href: "/retailer/bbps/complaint-status", icon: Clock },
    { label: "Reports", href: "/retailer/bbps/reports", icon: FileBarChart },
    { label: "Profile", href: "/retailer/bbps/profile", icon: User },
  ];

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-full border-r border-slate-800 shrink-0 select-none">
      {/* Top Branding Section */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
        <div className="w-10 h-10 rounded-lg bg-[#2F6F5E] flex items-center justify-center p-1.5 shrink-0 shadow-md">
          <Image
            src="/bbps/assets/B mnemonic_PNG.png"
            alt="Bharat Connect Symbol"
            width={32}
            height={32}
            className="w-auto h-full object-contain brightness-0 invert"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8DA84D] font-mono">
            BHARAT CONNECT
          </div>
          <div className="text-sm font-semibold text-white tracking-tight truncate">
            Retailer Portal
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/retailer/bbps/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-[#2F6F5E] text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </Link>
          );
        })}
      </nav>

      {/* Switch Back to Main Travel Site Link */}
      <div className="p-3 border-t border-slate-800/80">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Main Travel Website
          </span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </Link>
      </div>

      {/* Bottom Agent Info & Logout Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <div className="truncate">
              <div className="text-xs font-bold text-slate-200 truncate">
                {agentInfo.agencyName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ID: {agentInfo.agentId}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout of Portal"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
