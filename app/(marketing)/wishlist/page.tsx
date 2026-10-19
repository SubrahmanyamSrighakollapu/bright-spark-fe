import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { WishlistContent } from "@/components/marketing/shared/wishlist-content";

export const metadata = { title: "My Wishlist — Bright Spark Travel" };

export default function WishlistPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <WishlistContent />
      </main>
      <Footer />
    </>
  );
}

