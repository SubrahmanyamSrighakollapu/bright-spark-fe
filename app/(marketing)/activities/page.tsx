"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Star, Clock, MapPin, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { Button } from "@/components/marketing/ui/button";
import { formatPrice, cn } from "@/lib/marketing/utils";

const ACTIVITY_CATS = [
  { id: "all", label: "All Activities", icon: "🎯" },
  { id: "water", label: "Water Sports", icon: "🌊" },
  { id: "adventure", label: "Adventure", icon: "🧗" },
  { id: "culture", label: "Culture", icon: "🏛️" },
  { id: "food", label: "Food & Drink", icon: "🍜" },
  { id: "wildlife", label: "Wildlife", icon: "🦁" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
];

const ACTIVITIES = [
  { id: "1", title: "Scuba Diving in Maldives", category: "water", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80", location: "Maldives", duration: "3 Hours", price: 120, rating: 4.9, reviews: 2840, difficulty: "moderate", badge: "🔥 Bestseller" },
  { id: "2", title: "Paragliding over Swiss Alps", category: "adventure", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80", location: "Interlaken, Switzerland", duration: "2 Hours", price: 220, rating: 4.8, reviews: 1560, difficulty: "challenging", badge: "⭐ Top Rated" },
  { id: "3", title: "Bali Cooking Class", category: "food", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80", location: "Ubud, Bali", duration: "4 Hours", price: 65, rating: 4.9, reviews: 3200, difficulty: "easy", badge: "🏆 Award Winner" },
  { id: "4", title: "Serengeti Hot Air Balloon", category: "wildlife", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80", location: "Tanzania", duration: "4 Hours", price: 450, rating: 4.9, reviews: 980, difficulty: "easy", badge: "💎 Luxury" },
  { id: "5", title: "White Water Rafting — Rishikesh", category: "water", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80", location: "Rishikesh, India", duration: "3 Hours", price: 45, rating: 4.7, reviews: 4100, difficulty: "challenging", badge: "🔥 Trending" },
  { id: "6", title: "Kyoto Tea Ceremony", category: "culture", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", location: "Kyoto, Japan", duration: "2 Hours", price: 80, rating: 4.8, reviews: 2200, difficulty: "easy", badge: "🌸 Cultural" },
  { id: "7", title: "Yoga Retreat — Bali", category: "wellness", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80", location: "Ubud, Bali", duration: "Full Day", price: 95, rating: 4.9, reviews: 1800, difficulty: "easy", badge: "🧘 Wellness" },
  { id: "8", title: "Skiing in the Alps", category: "adventure", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80", location: "Chamonix, France", duration: "Full Day", price: 180, rating: 4.8, reviews: 1400, difficulty: "moderate", badge: "⛷️ Winter" },
];

export default function ActivitiesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? ACTIVITIES
    : ACTIVITIES.filter((a) => a.category === activeCategory);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&q=80" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm px-4 py-2 rounded-full mb-6">
                <Compass className="h-4 w-4" /> Adventures & Experiences
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">Unforgettable Activities</h1>
              <p className="text-white/70 text-xl max-w-2xl mx-auto">From scuba diving to cooking classes — book unique experiences worldwide.</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-8">
            {ACTIVITY_CATS.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeCategory === cat.id
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-teal-300"
                )}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-500 mb-6">
            <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> activities found
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={activity.image} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-medium">{activity.badge}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 glass text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {activity.duration}
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
                      activity.difficulty === "easy" && "bg-emerald-100 text-emerald-700",
                      activity.difficulty === "moderate" && "bg-amber-100 text-amber-700",
                      activity.difficulty === "challenging" && "bg-red-100 text-red-700",
                    )}>
                      {activity.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">{activity.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-teal-500" />
                    <span className="truncate">{activity.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{activity.rating}</span>
                        <span className="text-xs text-slate-400">({activity.reviews.toLocaleString()})</span>
                      </div>
                      <div className="font-bold text-teal-600 text-lg">{formatPrice(activity.price)}</div>
                      <div className="text-xs text-slate-400">per person</div>
                    </div>
                    <Button variant="gradient" size="sm">
                      Book <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

