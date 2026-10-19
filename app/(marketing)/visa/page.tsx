import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { VisaContent } from "@/components/marketing/shared/visa-content";

export const metadata = { title: "Visa Services — Fast & Reliable | Bright Spark Travel" };

export default function VisaPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <VisaContent />
      </main>
      <Footer />
    </>
  );
}

