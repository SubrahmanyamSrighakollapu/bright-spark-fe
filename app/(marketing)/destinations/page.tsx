import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { DestinationsContent } from "@/components/marketing/search/destinations-content";

export const metadata = { title: "Explore Destinations — 190+ Places to Discover" };

export default function DestinationsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <DestinationsContent />
      </main>
      <Footer />
    </>
  );
}

