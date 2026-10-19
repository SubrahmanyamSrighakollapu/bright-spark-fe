import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { PackagesContent } from "@/components/marketing/search/packages-content";

export const metadata = { title: "Holiday Packages — Curated Travel Deals" };

export default function PackagesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <PackagesContent />
      </main>
      <Footer />
    </>
  );
}

