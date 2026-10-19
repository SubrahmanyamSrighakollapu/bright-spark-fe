import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { ContactContent } from "@/components/marketing/shared/contact-content";

export const metadata = { title: "Contact Us — Bright Spark Travel" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}

