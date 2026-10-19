"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";
import { formatPrice } from "@/lib/marketing/utils";

const DEALS = [
  { id: "1", title: "Bali 7N Package", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", original: 1699, sale: 999, discount: 41, tag: "🏝️ Beach" },
  { id: "2", title: "Maldives Luxury", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", original: 4999, sale: 2999, discount: 40, tag: "💎 Luxury" },
  { id: "3", title: "Japan Cherry Blossom", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", original: 3499, sale: 2199, discount: 37, tag: "🌸 Culture" },
  { id: "4", title: "Dubai City Break", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", original: 1999, sale: 1299, discount: 35, tag: "🏙️ City" },
];

function useCountdown(targetHours = 10) {
  const [time, setTime] = useState({ h: targetHours, m: 51, s: 37 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        const { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: targetHours, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetHours]);
  return time;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold tabular-nums"
        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs text-white/50 mt-1.5 font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function FlashDeals() {
  const { h, m, s } = useCountdown(10);

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "#020817" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(5,150,105,0.08)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(14,165,233,0.08)" }} />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f59e0b" }}>
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest" style={{ color: "#f59e0b" }}>Flash Sale</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              Deals that<br />
              <span className="gradient-text-warm">won&apos;t last long</span>
            </h2>
            <p className="text-white/50">Up to 41% off on premium packages. Limited seats available.</p>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-start lg:items-end gap-3"
          >
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Clock className="h-4 w-4" />
              <span>Ends in</span>
            </div>
            <div className="flex items-center gap-3">
              <TimeUnit value={h} label="Hours" />
              <span className="text-3xl font-bold text-white/40 mb-5">:</span>
              <TimeUnit value={m} label="Mins" />
              <span className="text-3xl font-bold text-white/40 mb-5">:</span>
              <TimeUnit value={s} label="Secs" />
            </div>
          </motion.div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEALS.map((deal, i) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className="aspect-[3/4] relative">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />

                {/* Discount Badge */}
                <div className="absolute top-3 left-3 text-white text-sm font-bold px-3 py-1.5 rounded-xl" style={{ background: "#ef4444" }}>
                  -{deal.discount}%
                </div>
                <div className="absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                  {deal.tag}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold mb-2 text-base">{deal.title}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/50 text-xs line-through">{formatPrice(deal.original)}</div>
                      <div className="text-white font-bold text-xl">{formatPrice(deal.sale)}</div>
                    </div>
                    <Link href={`/packages/${deal.id}`}>
                      <Button
                        variant="gradient"
                        size="sm"
                        className="shadow-lg"
                        style={{ background: "linear-gradient(135deg, #059669, #0d9488)", boxShadow: "0 4px 16px rgba(5,150,105,0.4)" }}
                      >
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/offers">
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            >
              View All Deals <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

