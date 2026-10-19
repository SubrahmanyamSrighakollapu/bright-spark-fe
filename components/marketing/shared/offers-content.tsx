"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Tag, Clock, ArrowRight, Copy, Check, Filter } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { formatPrice, cn } from "@/lib/marketing/utils";

const OFFER_CATEGORIES = [
  { id: "all", label: "All Offers", icon: "🎁" },
  { id: "flights", label: "Flights", icon: "✈️" },
  { id: "hotels", label: "Hotels", icon: "🏨" },
  { id: "packages", label: "Packages", icon: "📦" },
  { id: "activities", label: "Activities", icon: "🎯" },
];

const OFFERS = [
  { id: "1", title: "Bali 7N Package", category: "packages", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", original: 1699, sale: 999, discount: 41, code: "BALI41", expiry: "2025-02-28", tag: "🏝️ Beach", seatsLeft: 12, featured: true },
  { id: "2", title: "Maldives Luxury Resort", category: "hotels", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", original: 4999, sale: 2999, discount: 40, code: "MALD40", expiry: "2025-01-31", tag: "💎 Luxury", seatsLeft: 5, featured: true },
  { id: "3", title: "Japan Cherry Blossom Tour", category: "packages", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", original: 3499, sale: 2199, discount: 37, code: "JAPAN37", expiry: "2025-03-15", tag: "🌸 Culture", seatsLeft: 8, featured: false },
  { id: "4", title: "Dubai City Break", category: "packages", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", original: 1999, sale: 1299, discount: 35, code: "DUBAI35", expiry: "2025-02-14", tag: "🏙️ City", seatsLeft: 20, featured: false },
  { id: "5", title: "New York → London Flights", category: "flights", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80", original: 1200, sale: 799, discount: 33, code: "FLY33", expiry: "2025-01-25", tag: "✈️ Flights", seatsLeft: 3, featured: true },
  { id: "6", title: "Santorini Boutique Hotel", category: "hotels", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", original: 2799, sale: 1899, discount: 32, code: "SANT32", expiry: "2025-03-31", tag: "🌅 Romantic", seatsLeft: 7, featured: false },
  { id: "7", title: "Kenya Safari Adventure", category: "packages", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80", original: 4299, sale: 2999, discount: 30, code: "SAFARI30", expiry: "2025-04-30", tag: "🦁 Safari", seatsLeft: 15, featured: false },
  { id: "8", title: "Bali Cooking Class", category: "activities", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80", original: 120, sale: 79, discount: 34, code: "COOK34", expiry: "2025-02-28", tag: "🍳 Activity", seatsLeft: 6, featured: false },
];

function useCountdown(targetHours = 8) {
  const [time] = useState({ h: targetHours, m: 23, s: 45 });
  return time;
}

function CouponCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all group">
      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600">{code}</span>
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500" />}
    </button>
  );
}

export function OffersContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { h, m, s } = useCountdown(8);

  const filtered = activeCategory === "all" ? OFFERS : OFFERS.filter((o) => o.category === activeCategory);
  const featured = OFFERS.filter((o) => o.featured);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative bg-slate-950 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4" /> Flash Deals & Offers
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
              Deals That<br />
              <span className="gradient-text-warm">Won&apos;t Last Long</span>
            </h1>
            <p className="text-white/70 text-xl mb-8">Up to 41% off on premium packages, hotels, and flights.</p>

            {/* Countdown */}
            <div className="inline-flex items-center gap-4 glass-dark rounded-2xl px-8 py-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Clock className="h-4 w-4" /> Flash sale ends in:
              </div>
              {[{ v: h, l: "HRS" }, { v: m, l: "MIN" }, { v: s, l: "SEC" }].map(({ v, l }, i) => (
                <div key={l} className="flex items-center gap-2">
                  {i > 0 && <span className="text-white/40 text-xl font-bold">:</span>}
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-2xl font-bold text-white tabular-nums">
                      {String(v).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-white/40 mt-1">{l}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Deals */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">🔥 Top Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((deal, i) => (
              <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer">
                <div className="aspect-[4/3] relative">
                  <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">-{deal.discount}%</div>
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">{deal.tag}</div>
                  {deal.seatsLeft <= 5 && (
                    <div className="absolute top-12 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Only {deal.seatsLeft} left!
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold mb-2">{deal.title}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-xs line-through">{formatPrice(deal.original)}</div>
                        <div className="text-white font-bold text-xl">{formatPrice(deal.sale)}</div>
                      </div>
                      <CouponCode code={deal.code} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {OFFER_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={cn("flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeCategory === cat.id ? "bg-amber-500 text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-300"
              )}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* All Offers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">-{offer.discount}%</div>
                <div className="absolute top-3 right-3 text-xs bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full">{offer.tag}</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">{offer.title}</h3>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-slate-400 line-through">{formatPrice(offer.original)}</div>
                    <div className="text-lg font-bold text-emerald-600">{formatPrice(offer.sale)}</div>
                  </div>
                  <CouponCode code={offer.code} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Expires {new Date(offer.expiry).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  {offer.seatsLeft <= 10 && <span className="text-amber-500 font-medium">{offer.seatsLeft} left</span>}
                </div>
                <Button variant="gradient" size="sm" className="w-full mt-3">
                  Grab Deal <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

