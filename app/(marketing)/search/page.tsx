"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Hotel, Package, Compass, MapPin, Star, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { DESTINATIONS, PACKAGES, HOTELS, TOURS } from "@/lib/marketing/data/mock";
import { formatPrice, cn } from "@/lib/marketing/utils";

const TABS = [
  { id: "all", label: "All Results", icon: Search },
  { id: "destinations", label: "Destinations", icon: MapPin },
  { id: "packages", label: "Packages", icon: Package },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "tours", label: "Tours", icon: Compass },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const q = query.toLowerCase();

  const filteredDest = DESTINATIONS.filter((d) => !q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q));
  const filteredPkg = PACKAGES.filter((p) => !q || p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q));
  const filteredHotels = HOTELS.filter((h) => !q || h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q));
  const filteredTours = TOURS.filter((t) => !q || t.title.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q));
  const totalResults = filteredDest.length + filteredPkg.length + filteredHotels.length + filteredTours.length;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Search Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search destinations, hotels, packages, tours..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>
              {query && (
                <p className="text-sm text-slate-500 mt-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{totalResults}</span> results for &ldquo;<span className="text-emerald-600">{query}</span>&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                )}>
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {!query && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Search Bright Spark Travel</h2>
              <p className="text-slate-500 mb-6">Type a destination, hotel name, or package to get started.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Bali", "Maldives", "Paris", "Dubai", "Tokyo", "Santorini"].map((s) => (
                  <button key={s} onClick={() => setQuery(s)}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && (
            <div className="space-y-10">
              {/* Destinations */}
              {(activeTab === "all" || activeTab === "destinations") && filteredDest.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-500" /> Destinations
                    <Badge variant="default" size="sm">{filteredDest.length}</Badge>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredDest.slice(0, 4).map((dest, i) => (
                      <motion.div key={dest.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift" style={{ boxShadow: "var(--shadow-md)" }}>
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <div className="text-white font-semibold">{dest.name}</div>
                            <div className="text-white/70 text-xs">{dest.country}</div>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-slate-900 dark:text-white">{dest.rating}</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">from {formatPrice(dest.price)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packages */}
              {(activeTab === "all" || activeTab === "packages") && filteredPkg.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-500" /> Packages
                    <Badge variant="default" size="sm">{filteredPkg.length}</Badge>
                  </h2>
                  <div className="space-y-3">
                    {filteredPkg.slice(0, 3).map((pkg, i) => (
                      <motion.div key={pkg.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex gap-4 hover:border-emerald-200 transition-all" style={{ boxShadow: "var(--shadow-md)" }}>
                        <img src={pkg.image} alt={pkg.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{pkg.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{pkg.destination}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{pkg.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pkg.rating}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-emerald-600 text-lg">{formatPrice(pkg.price)}</div>
                          <div className="text-xs text-slate-400">per person</div>
                          <Link href={`/packages/${pkg.id}`}>
                            <Button variant="gradient" size="sm" className="mt-2">View</Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {(activeTab === "all" || activeTab === "hotels") && filteredHotels.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-emerald-500" /> Hotels
                    <Badge variant="default" size="sm">{filteredHotels.length}</Badge>
                  </h2>
                  <div className="space-y-3">
                    {filteredHotels.slice(0, 3).map((hotel, i) => (
                      <motion.div key={hotel.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex gap-4 hover:border-emerald-200 transition-all" style={{ boxShadow: "var(--shadow-md)" }}>
                        <img src={hotel.image} alt={hotel.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{hotel.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                            <MapPin className="h-3.5 w-3.5" />{hotel.location}
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[...Array(hotel.stars)].map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-emerald-600 text-lg">{formatPrice(hotel.price)}</div>
                          <div className="text-xs text-slate-400">per night</div>
                          <Link href={`/hotels/${hotel.id}`}>
                            <Button variant="outline" size="sm" className="mt-2">View</Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tours */}
              {(activeTab === "all" || activeTab === "tours") && filteredTours.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-emerald-500" /> Tours
                    <Badge variant="default" size="sm">{filteredTours.length}</Badge>
                  </h2>
                  <div className="space-y-3">
                    {filteredTours.slice(0, 3).map((tour, i) => (
                      <motion.div key={tour.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex gap-4 hover:border-emerald-200 transition-all" style={{ boxShadow: "var(--shadow-md)" }}>
                        <img src={tour.image} alt={tour.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{tour.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tour.destination}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{tour.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tour.rating}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-emerald-600 text-lg">{formatPrice(tour.price)}</div>
                          <div className="text-xs text-slate-400">per person</div>
                          <Link href={`/tours/${tour.id}`}>
                            <Button variant="gradient" size="sm" className="mt-2">View</Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {totalResults === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No results found</h3>
                  <p className="text-slate-500">Try a different search term or browse our destinations.</p>
                  <Link href="/destinations">
                    <Button variant="gradient" size="md" className="mt-6">Browse Destinations <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

