import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { HotelsContent } from "@/components/marketing/search/hotels-content";

export const metadata = { title: "Search Hotels — Best Rates Guaranteed" };

export default function HotelsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <HotelsContent />
      </main>
      <Footer />
    </>
  );
}

