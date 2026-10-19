"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PackageCard } from "@/components/marketing/cards/package-hotel-card";
import { PACKAGES } from "@/lib/marketing/data/mock";
import { cn } from "@/lib/marketing/utils";

const CATEGORIES = [
  { id: "all", label: "All Packages", icon: "🌍" },
  { id: "luxury", label: "Luxury", icon: "💎" },
  { id: "honeymoon", label: "Honeymoon", icon: "💑" },
  { id: "adventure", label: "Adventure", icon: "🧗" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "international", label: "International", icon: "✈️" },
  { id: "domestic", label: "Domestic", icon: "🏠" },
  { id: "pilgrimage", label: "Pilgrimage", icon: "🕌" },
];

export function PackagesContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const filtered = activeCategory === "all"
    ? PACKAGES
    : PACKAGES.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Holiday Packages</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Curated packages with flights, hotels, and experiences — all in one price.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> packages found
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No packages found</h3>
            <p className="text-slate-500">Try a different category or check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

