import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { CarRentalsContent } from "@/components/marketing/shared/car-rentals-content";

export const metadata = { title: "Car Rentals — Drive Your Way | Bright Spark Travel" };

export default function CarRentalsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <CarRentalsContent />
      </main>
      <Footer />
    </>
  );
}

