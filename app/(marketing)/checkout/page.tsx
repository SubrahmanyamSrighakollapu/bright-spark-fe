import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { CheckoutContent } from "@/components/marketing/shared/checkout-content";

export const metadata = { title: "Checkout — Bright Spark Travel" };

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <CheckoutContent />
      </main>
      <Footer />
    </>
  );
}

