import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, MapPin, Star, SunMedium, ThermometerSun } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { DESTINATIONS } from "@/lib/marketing/data/mock";
import {
  getDestinationBySlug,
  getDestinationHotels,
  getDestinationPackages,
  getDestinationTours,
  getRelatedReviews,
} from "@/lib/marketing/data/route-helpers";
import { formatPrice, slugify } from "@/lib/marketing/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return DESTINATIONS.map((destination) => ({ slug: slugify(destination.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) return { title: "Destination Not Found" };

  return {
    title: `${destination.name}, ${destination.country}`,
    description: destination.description,
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) notFound();

  const relatedPackages = getDestinationPackages(destination.name).slice(0, 3);
  const relatedHotels = getDestinationHotels(destination.name).slice(0, 3);
  const relatedTours = getDestinationTours(destination.name).slice(0, 3);
  const reviews = getRelatedReviews(destination.name).slice(0, 2);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1 bg-slate-50 pt-20 dark:bg-slate-950">
        <section className="relative overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/70 to-emerald-950/65" />

          <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap gap-2">
                {destination.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {destination.name}, {destination.country}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                {destination.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {destination.rating} rating
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-300" />
                  Best season: {destination.bestSeason}
                </span>
                <span className="flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4 text-emerald-300" />
                  Avg. temperature: {destination.temperature}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Why Visit {destination.name}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                  {destination.name} blends signature landmarks with the kind of atmosphere that
                  makes travelers stay longer than planned. It works equally well for first-time
                  visitors who want the essentials and repeat travelers looking for a more refined,
                  slower itinerary.
                </p>
              </div>

              {relatedPackages.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Packages in {destination.name}
                    </h2>
                    <Link href="/packages" className="text-sm font-semibold text-emerald-600">
                      View all
                    </Link>
                  </div>
                  <div className="mt-6 grid gap-4">
                    {relatedPackages.map((pkg) => (
                      <Link
                        key={pkg.id}
                        href={`/packages/${pkg.id}`}
                        className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 dark:border-slate-800"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <img
                            src={pkg.image}
                            alt={pkg.title}
                            className="h-24 w-full rounded-2xl object-cover sm:w-32"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {pkg.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">{pkg.duration}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600">
                              {formatPrice(pkg.price)}
                            </p>
                            <p className="text-xs text-slate-400">per person</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedHotels.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Top Stays Nearby
                    </h2>
                    <Link href="/hotels" className="text-sm font-semibold text-emerald-600">
                      Browse hotels
                    </Link>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {relatedHotels.map((hotel) => (
                      <Link
                        key={hotel.id}
                        href={`/hotels/${hotel.id}`}
                        className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 dark:border-slate-800"
                      >
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="h-40 w-full rounded-2xl object-cover"
                        />
                        <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                          {hotel.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{hotel.location}</p>
                        <p className="mt-3 text-lg font-bold text-emerald-600">
                          {formatPrice(hotel.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedTours.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Experiences Worth Booking
                    </h2>
                    <Link href="/tours" className="text-sm font-semibold text-emerald-600">
                      See tours
                    </Link>
                  </div>
                  <div className="mt-6 grid gap-4">
                    {relatedTours.map((tour) => (
                      <Link
                        key={tour.id}
                        href={`/tours/${tour.id}`}
                        className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {tour.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">{tour.duration}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-emerald-600" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Traveler Notes
                  </h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {review.title}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {review.content}
                        </p>
                        <p className="mt-4 text-sm font-medium text-emerald-600">
                          {review.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Destination Snapshot
                </h3>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      icon: MapPin,
                      label: "Continent",
                      value: destination.continent,
                    },
                    {
                      icon: SunMedium,
                      label: "Best Season",
                      value: destination.bestSeason,
                    },
                    {
                      icon: Star,
                      label: "Starting Price",
                      value: formatPrice(destination.price),
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
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
