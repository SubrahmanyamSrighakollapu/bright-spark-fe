import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, Check, Compass, MapPin, Shield, Star, Users } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { BookingActions } from "@/components/marketing/shared/booking-actions";
import { TOURS } from "@/lib/marketing/data/mock";
import { getTourById } from "@/lib/marketing/data/route-helpers";
import { formatPrice } from "@/lib/marketing/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return TOURS.map((tour) => ({ id: tour.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tour = getTourById(id);

  if (!tour) return { title: "Tour Not Found" };

  return {
    title: tour.title,
    description: `${tour.destination}, ${tour.duration}, from ${formatPrice(
      tour.price
    )} per person.`,
  };
}

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tour = getTourById(id);

  if (!tour) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1 bg-slate-50 pt-20 dark:bg-slate-950">
        <section className="relative overflow-hidden">
          <img src={tour.image} alt={tour.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/75 to-emerald-950/70" />

          <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="max-w-3xl">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-md">
                    {tour.category}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-200">
                    {tour.duration}
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {tour.title}
                </h1>
                <div className="mt-5 flex flex-wrap gap-4 text-white/80">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-300" />
                    {tour.destination}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-300" />
                    {tour.groupSize}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {tour.rating} ({tour.reviews.toLocaleString()} reviews)
                  </span>
                </div>
              </div>

              <div className="glass rounded-3xl p-6 text-slate-900">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Tour Price
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-4xl font-bold text-slate-950">
                    {formatPrice(tour.price)}
                  </span>
                  <span className="pb-1 text-sm text-slate-600">per person</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Perfect for travelers who want guided structure without losing the feeling of discovery.
                </p>
                <div className="mt-6">
                  <BookingActions
                    item={{
                      type: "tour",
                      title: tour.title,
                      image: tour.image,
                      price: tour.price,
                    }}
                    details={{ destination: tour.destination, duration: tour.duration }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Tour Highlights
                </h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  {tour.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Included
                  </h2>
                  <div className="mt-5 space-y-3">
                    {tour.included.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Excluded
                  </h2>
                  <div className="mt-5 space-y-3">
                    {tour.excluded.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Experience Snapshot
                </h3>
                <div className="mt-5 space-y-4">
                  {[
                    { icon: Compass, label: "Difficulty", value: tour.difficulty },
                    { icon: Users, label: "Group Size", value: tour.groupSize },
                    { icon: Shield, label: "Booking Support", value: "Available 24/7" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                        {value}
                      </span>
                    </div>
                  ))}
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
