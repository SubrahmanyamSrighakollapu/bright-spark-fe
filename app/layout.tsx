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
  title: "Bright Spark — Enterprise Payment Operations Platform",
  description: "Financial operations command center for pay-in, pay-out, wallet, ledger, and multi-tier network management.",
  icons: {
    icon: [{ url: "/bright-spark-favicon.jpg", type: "image/jpeg" }],
    shortcut: "/bright-spark-favicon.jpg",
    apple: "/bright-spark-favicon.jpg",
  },
};

import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { BrightSparkPrimeReactProvider } from "@/components/providers/PrimeReactProvider";
import { ConfirmationProvider } from "@/context/ConfirmationContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BrightSparkPrimeReactProvider>
          <ToastProvider>
            <ConfirmationProvider>
              <AuthProvider>{children}</AuthProvider>
            </ConfirmationProvider>
          </ToastProvider>
        </BrightSparkPrimeReactProvider>
      </body>
    </html>
  );
}

