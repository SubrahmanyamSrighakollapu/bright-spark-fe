import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { AboutContent } from "@/components/marketing/shared/about-content";

export const metadata = { title: "About Us — Bright Spark Travel" };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}

