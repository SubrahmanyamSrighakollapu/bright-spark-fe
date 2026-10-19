import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { ToursContent } from "@/components/marketing/shared/tours-content";

export const metadata = { title: "Tours & Experiences — Bright Spark Travel" };

export default function ToursPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <ToursContent />
      </main>
      <Footer />
    </>
  );
}

