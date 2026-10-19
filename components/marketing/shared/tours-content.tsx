"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Clock, Users, Star, Filter, Search, ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { TOURS } from "@/lib/marketing/data/mock";
import { formatPrice, cn } from "@/lib/marketing/utils";

const DIFFICULTIES = ["All", "easy", "moderate", "challenging"];
const CATEGORIES = ["All", "Cultural", "Adventure", "Wildlife", "Food", "Photography"];
const DURATIONS = ["All", "Half Day", "Full Day", "2 Days", "3+ Days"];

export function ToursContent() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [category, setCategory] = useState("All");
  const [duration, setDuration] = useState("All");

  const filtered = TOURS.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === "All" || t.difficulty === difficulty;
    const matchCat = category === "All" || t.category === category;
    const matchDur = duration === "All" || t.duration === duration;
    return matchSearch && matchDiff && matchCat && matchDur;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm px-4 py-2 rounded-full mb-6">
              <Map className="h-4 w-4" /> Guided Experiences
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">Discover Amazing Tours</h1>
            <p className="text-white/70 text-xl mb-8 max-w-2xl mx-auto">Expert-led tours across 190+ destinations. From cultural walks to wild safaris.</p>
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tours or destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-base"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-1 flex-shrink-0"><Filter className="h-3.5 w-3.5" /> Difficulty:</span>
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={cn("flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                  difficulty === d ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                )}>{d}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                category === c ? "bg-teal-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-teal-300"
              )}>{c}</button>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-6">
          <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> tours found
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((tour, i) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={tour.difficulty === "easy" ? "success" : tour.difficulty === "moderate" ? "warning" : "danger"} size="sm" className="capitalize">
                    {tour.difficulty}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 glass text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> {tour.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-teal-600 font-semibold mb-1">{tour.category}</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">{tour.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                  <Map className="h-3.5 w-3.5 text-teal-500" />
                  <span>{tour.destination}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" />{tour.groupSize}</div>
                  <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{tour.rating} ({tour.reviews.toLocaleString()})</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {tour.included.slice(0, 3).map((inc) => (
                    <span key={inc} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <Check className="h-3 w-3 text-emerald-500" /> {inc}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-xl font-bold text-emerald-600">{formatPrice(tour.price)}</div>
                    <div className="text-xs text-slate-400">per person</div>
                  </div>
                  <Link href={`/tours/${tour.id}`}>
                    <Button variant="gradient" size="sm">Book <ArrowRight className="h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No tours found</h3>
            <p className="text-slate-500">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

