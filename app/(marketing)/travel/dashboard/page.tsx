import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { DashboardContent } from "@/components/marketing/shared/dashboard-content";

export const metadata = { title: "My Dashboard — Bright Spark Travel" };

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 bg-slate-50 dark:bg-slate-950">
        <DashboardContent />
      </main>
      <Footer />
    </>
  );
}

