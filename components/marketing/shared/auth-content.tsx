"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { Input } from "@/components/marketing/ui/index";
import Link from "next/link";

export function AuthContent() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">
            <span className="gradient-text">Wander</span>
            <span className="text-slate-900 dark:text-white">lust</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {tab === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-slate-500 text-sm">
          {tab === "login" ? "Sign in to access your trips and bookings" : "Join 2.4M+ travelers worldwide"}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-xl)" }}>
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Google", icon: "G", color: "text-red-500" },
            { label: "Apple", icon: "🍎", color: "" },
            { label: "Facebook", icon: "f", color: "text-[#2F6F5E]" },
          ].map(({ label, icon, color }) => (
            <button
              key={label}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium"
            >
              <span className={`font-bold ${color}`}>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 font-medium">or continue with email</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={tab}
            initial={{ opacity: 0, x: tab === "login" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {tab === "register" && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={<User className="h-4 w-4" />}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              required
            />

            {tab === "register" && (
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                icon={<Phone className="h-4 w-4" />}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {tab === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" className="accent-emerald-600 rounded" />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Forgot password?
                </Link>
              </div>
            )}

            {tab === "register" && (
              <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="accent-emerald-600 rounded mt-0.5" required />
                <span>I agree to the <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link></span>
              </label>
            )}

            <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>
              {tab === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.form>
        </AnimatePresence>

        {/* OTP Option */}
        <div className="mt-4 text-center">
          <button className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">
            Sign in with OTP instead →
          </button>
        </div>
      </div>

      {/* Rewards Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3"
      >
        <Sparkles className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-emerald-600">New members</span> get 500 reward points + exclusive deals on first booking!
        </p>
      </motion.div>
    </div>
  );
}

