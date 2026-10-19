import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, MapPin, Shield, Star, Waves } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { BookingActions } from "@/components/marketing/shared/booking-actions";
import { HOTELS } from "@/lib/marketing/data/mock";
import { getHotelById } from "@/lib/marketing/data/route-helpers";
import { formatPrice } from "@/lib/marketing/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return HOTELS.map((hotel) => ({ id: hotel.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const hotel = getHotelById(id);

  if (!hotel) return { title: "Hotel Not Found" };

  return {
    title: hotel.name,
    description: `${hotel.location}. ${hotel.stars}-star stay from ${formatPrice(
      hotel.price
    )} per night.`,
  };
}

export default async function HotelDetailPage({ params }: PageProps) {
  const { id } = await params;
  const hotel = getHotelById(id);

  if (!hotel) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1 bg-slate-50 pt-20 dark:bg-slate-950">
        <section className="relative overflow-hidden">
          <img src={hotel.image} alt={hotel.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

          <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                {hotel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {hotel.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  {hotel.location}
                </span>
                <span className="flex items-center gap-1">
                  {[...Array(hotel.stars)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {hotel.rating} rating from {hotel.reviews.toLocaleString()} guests
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  About This Stay
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                  {hotel.description} This property is designed for travelers who care about service,
                  location quality, and a booking flow that feels premium from the first click.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Amenities
                </h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {hotel.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Stay Details
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-sm font-semibold">Check-in</span>
                    </div>
                    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                      {hotel.checkIn}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-sm font-semibold">Check-out</span>
                    </div>
                    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                      {hotel.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Nightly Rate
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(hotel.price)}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">per night</span>
                </div>
                {hotel.originalPrice && (
                  <p className="mt-2 text-sm text-slate-400 line-through">
                    {formatPrice(hotel.originalPrice)}
                  </p>
                )}
                <div className="mt-6">
                  <BookingActions
                    item={{
                      type: "hotel",
                      title: hotel.name,
                      image: hotel.image,
                      price: hotel.price,
                    }}
                    details={{ location: hotel.location, checkIn: hotel.checkIn, checkOut: hotel.checkOut }}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Best For
                </h3>
                <div className="mt-4 space-y-4">
                  {[
                    "Couples seeking a signature stay",
                    "Travelers who value premium service",
                    "Shortlist-ready luxury or boutique trips",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-2 dark:bg-emerald-900/20">
                        <Waves className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{item}</p>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-2 dark:bg-emerald-900/20">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Transparent booking summary and secure checkout support.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
