import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { OffersContent } from "@/components/marketing/shared/offers-content";

export const metadata = { title: "Deals & Offers — Up to 41% Off | Bright Spark Travel" };

export default function OffersPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <OffersContent />
      </main>
      <Footer />
    </>
  );
}

