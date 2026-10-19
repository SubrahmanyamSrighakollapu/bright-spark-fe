import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { CruisesContent } from "@/components/marketing/shared/cruises-content";

export const metadata = { title: "Luxury Cruises — Ocean & River | Bright Spark Travel" };

export default function CruisesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <CruisesContent />
      </main>
      <Footer />
    </>
  );
}

