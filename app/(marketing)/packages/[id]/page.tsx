import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Clock, MapPin, Shield, Sparkles, Star } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { BookingActions } from "@/components/marketing/shared/booking-actions";
import { PACKAGES } from "@/lib/marketing/data/mock";
import { getPackageById } from "@/lib/marketing/data/route-helpers";
import { formatPrice } from "@/lib/marketing/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return PACKAGES.map((pkg) => ({ id: pkg.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pkg = getPackageById(id);

  if (!pkg) {
    return { title: "Package Not Found" };
  }

  return {
    title: pkg.title,
    description: `${pkg.destination}, ${pkg.duration}, from ${formatPrice(pkg.price)} per person.`,
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pkg = getPackageById(id);

  if (!pkg) notFound();

  const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1 bg-slate-50 pt-20 dark:bg-slate-950">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-cyan-950" />
          <img
            src={pkg.image}
            alt={pkg.title}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div className="max-w-3xl">
                <div className="mb-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-white/90 backdrop-blur-md">
                    {pkg.category}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200 backdrop-blur-md">
                    {pkg.duration}
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {pkg.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-white/80">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-300" />
                    {pkg.destination}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {pkg.rating} ({pkg.reviews.toLocaleString()} reviews)
                  </span>
                </div>
              </div>

              <div className="glass rounded-3xl p-6 text-slate-900">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Premium Pricing
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-4xl font-bold text-slate-950">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="pb-1 text-sm text-slate-600">per person</span>
                </div>
                {pkg.originalPrice && (
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="text-slate-400 line-through">
                      {formatPrice(pkg.originalPrice)}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-700">
                      Save {formatPrice(savings)}
                    </span>
                  </div>
                )}
                <div className="mt-6">
                  <BookingActions
                    item={{
                      type: "package",
                      title: pkg.title,
                      image: pkg.image,
                      price: pkg.price,
                    }}
                    details={{ destination: pkg.destination, duration: pkg.duration }}
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
                  What&apos;s Included
                </h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {pkg.includes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"
                    >
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Trip Highlights
                </h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  {pkg.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Itinerary Snapshot
                </h2>
                <div className="mt-6 space-y-5">
                  {(pkg.itinerary.length > 0
                    ? pkg.itinerary
                    : [
                        {
                          day: 1,
                          title: "Arrival and private transfer",
                          description:
                            "Touch down, settle into your stay, and ease into the destination with a curated welcome experience.",
                          activities: ["Airport assistance", "Private transfer", "Welcome briefing"],
                        },
                        {
                          day: 2,
                          title: "Signature destination highlights",
                          description:
                            "Spend the day discovering the defining experiences that make this package stand out.",
                          activities: pkg.highlights.slice(0, 3),
                        },
                        {
                          day: 3,
                          title: "Flexible exploration day",
                          description:
                            "Enjoy premium downtime, optional upgrades, and the freedom to travel at your own pace.",
                          activities: ["Leisure time", "Optional add-ons", "Concierge support"],
                        },
                      ]).map((day) => (
                    <div
                      key={`${day.day}-${day.title}`}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                          Day {day.day}
                        </span>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {day.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {day.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {day.activities.map((activity) => (
                          <span
                            key={activity}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Why Travelers Book This
                </h3>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      icon: Sparkles,
                      title: "Curated premium inclusions",
                      text: "Hotels, transfers, and experiences are bundled to reduce planning effort.",
                    },
                    {
                      icon: Clock,
                      title: "Balanced pacing",
                      text: "Enough structure to feel premium, with room for personal exploration.",
                    },
                    {
                      icon: Shield,
                      title: "Protected booking flow",
                      text: "Secure checkout, support, and clear value before you commit.",
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3">
                      <div className="mt-0.5 rounded-2xl bg-emerald-50 p-2 dark:bg-emerald-900/20">
                        <Icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
                      </div>
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
