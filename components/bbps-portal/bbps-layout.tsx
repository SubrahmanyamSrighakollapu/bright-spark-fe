"use client";

import { BBPSHeader } from "./bbps-header";

interface BBPSLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function BBPSLayout({ children, pageTitle }: BBPSLayoutProps) {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Header Navbar matching screenshots */}
      <BBPSHeader pageTitle={pageTitle} />

      {/* Main Full-Width Content View Canvas */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer copyright note */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © 2026 Bright Spark · Bharat Connect (BBPS) Retailer Operations. All rights reserved.
      </footer>
    </div>
  );
}
