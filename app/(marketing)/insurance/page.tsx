import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { InsuranceContent } from "@/components/marketing/shared/insurance-content";

export const metadata = { title: "Travel Insurance — Comprehensive Coverage | Bright Spark Travel" };

export default function InsurancePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <InsuranceContent />
      </main>
      <Footer />
    </>
  );
}

