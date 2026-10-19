"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";
import { DestinationCard } from "@/components/marketing/cards/destination-card";
import { DESTINATIONS, CATEGORIES } from "@/lib/marketing/data/mock";
import { cn } from "@/lib/marketing/utils";

export function TrendingDestinations() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? DESTINATIONS
    : DESTINATIONS.filter((d) => d.tags.some((t) => t.toLowerCase().includes(activeCategory)));

  return (
    <section className="py-24 mesh-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-emerald-600 font-semibold text-sm mb-3 tracking-wide uppercase">Explore the World</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              Trending<br />
              <span className="gradient-text">Destinations</span>
            </h2>
          </motion.div>
          <Link href="/destinations">
            <Button variant="outline" size="md">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeCategory === "all"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
            )}
          >
            🌍 All
          </button>
          {CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.slice(0, 8).map((dest, i) => (
            <DestinationCard key={dest.id} destination={dest} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

