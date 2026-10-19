import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { CartContent } from "@/components/marketing/shared/cart-content";

export const metadata = { title: "Your Cart — Bright Spark Travel" };

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <CartContent />
      </main>
      <Footer />
    </>
  );
}

