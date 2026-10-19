"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Hotel, SlidersHorizontal, MapPin, Star, Grid3X3, Map } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { HotelCard } from "@/components/marketing/cards/package-hotel-card";
import { HOTELS } from "@/lib/marketing/data/mock";
import { cn } from "@/lib/marketing/utils";

const AMENITY_FILTERS = ["Pool", "Spa", "Gym", "Restaurant", "WiFi", "Bar", "Beach Access", "Parking"];
const STAR_FILTERS = [5, 4, 3, 2];

export function HotelsContent() {
  const [view, setView] = useState<"grid" | "map">("grid");
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleStar = (s: number) =>
    setSelectedStars((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const filtered = HOTELS.filter((h) => {
    if (selectedStars.length && !selectedStars.includes(h.stars)) return false;
    if (selectedAmenities.length && !selectedAmenities.every((a) => h.amenities.includes(a))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">Bali, Indonesia</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400">
                Jan 15 — Jan 22 · 2 Adults
              </div>
              <Button variant="outline" size="sm">Modify</Button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("grid")}
                className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all", view === "grid" ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700")}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("map")}
                className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all", view === "map" ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700")}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 sticky top-24" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                  Filters
                </h3>
                <button className="text-xs text-emerald-600">Reset</button>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Star Rating</h4>
                <div className="space-y-2">
                  {STAR_FILTERS.map((stars) => (
                    <label key={stars} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStars.includes(stars)}
                        onChange={() => toggleStar(stars)}
                        className="accent-emerald-600"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(stars)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_FILTERS.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg border transition-all",
                        selectedAmenities.includes(amenity)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                      )}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Price per night</h4>
                <input type="range" min={0} max={2000} defaultValue={1500} className="w-full accent-emerald-600" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>$0</span>
                  <span>$2,000+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> hotels found
              </div>
              <select className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option>Top Rated</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Reviewed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((hotel, i) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

