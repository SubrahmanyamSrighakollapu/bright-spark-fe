import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qin Star Pay — Enterprise Payment Operations Platform",
  description: "Financial operations command center for pay-in, pay-out, wallet, ledger, and multi-tier network management.",
};

import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { QinStarPrimeReactProvider } from "@/components/providers/PrimeReactProvider";
import { ConfirmationProvider } from "@/context/ConfirmationContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QinStarPrimeReactProvider>
          <ToastProvider>
            <ConfirmationProvider>
              <AuthProvider>{children}</AuthProvider>
            </ConfirmationProvider>
          </ToastProvider>
        </QinStarPrimeReactProvider>
      </body>
    </html>
  );
}

