"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Plane, Hotel, Package, Heart, CreditCard,
  Bell, Settings, User, Star, Wallet, Gift, FileText, LogOut,
  TrendingUp, MapPin, Calendar, ChevronRight, Award
} from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { cn, formatPrice } from "@/lib/marketing/utils";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "trips", label: "My Trips", icon: Plane },
  { id: "bookings", label: "Bookings", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "rewards", label: "Rewards", icon: Award },
  { id: "wallet", label: "Travel Wallet", icon: Wallet },
  { id: "reviews", label: "My Reviews", icon: Star },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const UPCOMING_TRIPS = [
  { id: "1", title: "Bali, Indonesia", dates: "Jan 15 — Jan 22, 2025", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", status: "confirmed", type: "Package" },
  { id: "2", title: "Santorini, Greece", dates: "Mar 10 — Mar 15, 2025", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80", status: "upcoming", type: "Hotel" },
];

const STATS = [
  { label: "Total Trips", value: "12", icon: Plane, color: "emerald" },
  { label: "Countries Visited", value: "8", icon: MapPin, color: "blue" },
  { label: "Reward Points", value: "4,820", icon: Award, color: "amber" },
  { label: "Wallet Balance", value: "$240", icon: Wallet, color: "purple" },
];

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4" style={{ boxShadow: "var(--shadow-md)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Alex Johnson</div>
                <div className="text-xs text-slate-500">alex@example.com</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl px-3 py-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Gold Member</span>
              <span className="text-xs text-slate-500 ml-auto">4,820 pts</span>
            </div>
          </div>

          {/* Nav */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
            <nav className="p-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    activeTab === item.id
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="border-t border-slate-100 dark:border-slate-800 p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Welcome */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Good morning, Alex! 👋</h1>
                  <p className="text-slate-500 text-sm mt-1">You have 2 upcoming trips this month.</p>
                </div>
                <Button variant="gradient" size="md">
                  <Plane className="h-4 w-4" /> Book a Trip
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                      stat.color === "emerald" && "bg-emerald-100 dark:bg-emerald-900/30",
                      stat.color === "blue" && "bg-[#E7EFD2] dark:bg-[#17362F]/30",
                      stat.color === "amber" && "bg-amber-100 dark:bg-amber-900/30",
                      stat.color === "purple" && "bg-purple-100 dark:bg-purple-900/30",
                    )}>
                      <stat.icon className={cn(
                        "h-5 w-5",
                        stat.color === "emerald" && "text-emerald-600",
                        stat.color === "blue" && "text-[#2F6F5E]",
                        stat.color === "amber" && "text-amber-600",
                        stat.color === "purple" && "text-purple-600",
                      )} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Upcoming Trips */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Upcoming Trips</h2>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {UPCOMING_TRIPS.map((trip) => (
                    <div key={trip.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <img src={trip.image} alt={trip.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white">{trip.title}</div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {trip.dates}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant={trip.status === "confirmed" ? "success" : "info"} size="sm">
                            {trip.status}
                          </Badge>
                          <Badge variant="secondary" size="sm">{trip.type}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards Progress */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-5 w-5" />
                      <span className="font-semibold">Gold Member</span>
                    </div>
                    <div className="text-white/80 text-sm">4,820 / 10,000 points to Platinum</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">4,820</div>
                    <div className="text-white/70 text-xs">reward points</div>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: "48.2%" }} />
                </div>
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>Gold</span>
                  <span>48% to Platinum</span>
                  <span>Platinum</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab !== "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 capitalize">{activeTab}</h3>
              <p className="text-slate-500">This section is coming soon.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

