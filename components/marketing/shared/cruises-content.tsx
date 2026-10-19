"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Ship, Star, Clock, Users, MapPin, ArrowRight, Anchor, Waves } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { formatPrice, cn } from "@/lib/marketing/utils";

const CRUISE_TYPES = [
  { id: "all", label: "All Cruises", icon: "🚢" },
  { id: "ocean", label: "Ocean Cruises", icon: "🌊" },
  { id: "river", label: "River Cruises", icon: "🏞️" },
  { id: "luxury", label: "Luxury Cruises", icon: "💎" },
  { id: "expedition", label: "Expedition", icon: "🧭" },
];

const CRUISES = [
  {
    id: "1", name: "Mediterranean Magic", ship: "MSC Bellissima", type: "ocean",
    image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80",
    duration: "10 Nights", ports: ["Barcelona", "Rome", "Athens", "Dubrovnik", "Venice"],
    price: 1299, originalPrice: 1799, rating: 4.8, reviews: 2840,
    departure: "Barcelona", amenities: ["Pool", "Spa", "Casino", "Fine Dining", "Entertainment"],
    featured: true,
  },
  {
    id: "2", name: "Caribbean Paradise", ship: "Royal Caribbean Harmony", type: "ocean",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    duration: "7 Nights", ports: ["Miami", "Nassau", "St. Thomas", "St. Maarten"],
    price: 899, originalPrice: 1199, rating: 4.7, reviews: 4200,
    departure: "Miami", amenities: ["Water Park", "Rock Climbing", "Spa", "Multiple Restaurants"],
    featured: true,
  },
  {
    id: "3", name: "Norwegian Fjords", ship: "Viking Sky", type: "luxury",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
    duration: "14 Nights", ports: ["Bergen", "Flam", "Geiranger", "Tromsø", "Oslo"],
    price: 3499, originalPrice: 4299, rating: 4.9, reviews: 1200,
    departure: "Bergen", amenities: ["Butler Service", "Michelin Dining", "Spa", "Expedition Gear"],
    featured: false,
  },
  {
    id: "4", name: "Danube River Journey", ship: "AmaWaterways", type: "river",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
    duration: "8 Nights", ports: ["Budapest", "Vienna", "Bratislava", "Passau", "Regensburg"],
    price: 2199, rating: 4.8, reviews: 980,
    departure: "Budapest", amenities: ["Panoramic Lounge", "Bikes", "Guided Tours", "Fine Dining"],
    featured: false,
  },
  {
    id: "5", name: "Alaska Wilderness", ship: "Celebrity Solstice", type: "expedition",
    image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80",
    duration: "7 Nights", ports: ["Seattle", "Juneau", "Skagway", "Glacier Bay", "Ketchikan"],
    price: 1599, originalPrice: 1999, rating: 4.9, reviews: 1560,
    departure: "Seattle", amenities: ["Naturalist Guides", "Kayaking", "Spa", "Observatory"],
    featured: true,
  },
  {
    id: "6", name: "Asian Splendor", ship: "Silversea Silver Muse", type: "luxury",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    duration: "12 Nights", ports: ["Singapore", "Bangkok", "Ho Chi Minh", "Hong Kong", "Tokyo"],
    price: 4999, rating: 4.9, reviews: 720,
    departure: "Singapore", amenities: ["All-Inclusive", "Butler", "Spa", "Michelin Chef"],
    featured: false,
  },
];

export function CruisesContent() {
  const [activeType, setActiveType] = useState("all");

  const filtered = activeType === "all" ? CRUISES : CRUISES.filter((c) => c.type === activeType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1920&q=80" className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 glass-dark text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/10">
              <Anchor className="h-4 w-4 text-[#8DA84D]" /> Cruise Holidays
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Sail the World<br />
              <span className="gradient-text">in Luxury</span>
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">Ocean, river, and expedition cruises to the world&apos;s most breathtaking destinations.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type Filters */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-10">
          {CRUISE_TYPES.map((type) => (
            <button key={type.id} onClick={() => setActiveType(type.id)}
              className={cn("flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all",
                activeType === type.id ? "bg-[#2F6F5E] text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#B8CB7D]"
              )}>
              <span>{type.icon}</span> {type.label}
            </button>
          ))}
        </div>

        {/* Featured Cruise */}
        {activeType === "all" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">⭐ Featured Cruises</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {CRUISES.filter((c) => c.featured).slice(0, 2).map((cruise, i) => (
                <motion.div key={cruise.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group relative rounded-3xl overflow-hidden aspect-[16/9] cursor-pointer">
                  <img src={cruise.image} alt={cruise.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="premium" size="md">⭐ Featured</Badge>
                  </div>
                  {cruise.originalPrice && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                      -{Math.round((1 - cruise.price / cruise.originalPrice) * 100)}% OFF
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-white/70 text-sm mb-1">{cruise.ship}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{cruise.name}</h3>
                    <div className="flex items-center gap-4 text-white/70 text-sm mb-4">
                      <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{cruise.duration}</div>
                      <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{cruise.departure}</div>
                      <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{cruise.rating}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {cruise.originalPrice && <div className="text-white/50 text-sm line-through">{formatPrice(cruise.originalPrice)}</div>}
                        <div className="text-2xl font-bold text-white">from {formatPrice(cruise.price)}</div>
                        <div className="text-white/60 text-xs">per person</div>
                      </div>
                      <Button variant="gradient" size="md">View Cruise <ArrowRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Cruises Grid */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {activeType === "all" ? "All Cruises" : CRUISE_TYPES.find((t) => t.id === activeType)?.label}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cruise, i) => (
            <motion.div key={cruise.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={cruise.image} alt={cruise.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant="info" size="sm" className="capitalize">{cruise.type}</Badge>
                </div>
                <div className="absolute bottom-3 left-3 glass text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> {cruise.duration}
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs text-slate-500 mb-1">{cruise.ship}</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-[#2F6F5E] transition-colors">{cruise.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-[#6D8E37]" />
                  <span className="truncate">{cruise.ports.slice(0, 3).join(" → ")}{cruise.ports.length > 3 ? ` +${cruise.ports.length - 3}` : ""}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cruise.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">{a}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{cruise.rating}</span>
                      <span className="text-xs text-slate-400">({cruise.reviews.toLocaleString()})</span>
                    </div>
                    {cruise.originalPrice && <div className="text-xs text-slate-400 line-through">{formatPrice(cruise.originalPrice)}</div>}
                    <div className="font-bold text-[#2F6F5E] text-lg">{formatPrice(cruise.price)}</div>
                    <div className="text-xs text-slate-400">per person</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#8DA84D] text-[#2F6F5E] hover:bg-[#F3F7E9]">
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

