"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { DestinationCard } from "@/components/marketing/cards/destination-card";
import { DESTINATIONS, CATEGORIES } from "@/lib/marketing/data/mock";
import { cn } from "@/lib/marketing/utils";

const CONTINENTS = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];

export function DestinationsContent() {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("All");
  const [category, setCategory] = useState("all");

  const filtered = DESTINATIONS.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase());
    const matchContinent = continent === "All" || d.continent === continent;
    const matchCategory = category === "all" || d.tags.some((t) => t.toLowerCase().includes(category));
    return matchSearch && matchContinent && matchCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
              Explore the World
            </h1>
            <p className="text-white/70 text-xl mb-8">190+ destinations waiting to be discovered</p>

            {/* Search */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-base"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Continent Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
          {CONTINENTS.map((c) => (
            <button
              key={c}
              onClick={() => setContinent(c)}
              className={cn(
                "flex-shrink-0 px-5 py-2 rounded-xl text-sm font-medium transition-all",
                continent === c
                  ? "bg-emerald-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          <button
            onClick={() => setCategory("all")}
            className={cn("flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all", category === "all" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700")}
          >
            🌍 All
          </button>
          {CATEGORIES.slice(0, 7).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn("flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all", category === cat.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700")}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-sm text-slate-500 mb-6">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> destinations
        </p>

        {/* Featured Row */}
        {continent === "All" && category === "all" && !search && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">✨ Featured Destinations</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DESTINATIONS.filter((d) => d.featured).slice(0, 4).map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest} variant="featured" index={i} />
              ))}
            </div>
          </div>
        )}

        {/* All Destinations */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {continent === "All" && category === "all" && !search ? "All Destinations" : "Results"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((dest, i) => (
            <DestinationCard key={dest.id} destination={dest} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No destinations found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

