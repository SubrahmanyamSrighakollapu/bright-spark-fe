import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { FlightsContent } from "@/components/marketing/search/flights-content";

export const metadata = { title: "Search Flights — Best Airfare Deals" };

export default function FlightsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <FlightsContent />
      </main>
      <Footer />
    </>
  );
}

