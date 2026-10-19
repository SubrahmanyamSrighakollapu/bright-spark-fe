"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { HotelCard } from "@/components/marketing/cards/package-hotel-card";
import { HOTELS } from "@/lib/marketing/data/mock";

export function HotelsSection() {
  return (
    <section className="py-24 mesh-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-emerald-600 font-semibold text-sm mb-3 tracking-wide uppercase">Where to Stay</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              World-Class<br />
              <span className="gradient-text">Hotels & Resorts</span>
            </h2>
            <p className="text-slate-500 mt-3 max-w-lg">
              From intimate boutique hotels to iconic luxury resorts — find your perfect stay.
            </p>
          </motion.div>
          <Link href="/hotels">
            <Button variant="outline" size="md">
              All Hotels <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOTELS.slice(0, 6).map((hotel, i) => (
            <HotelCard key={hotel.id} hotel={hotel} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

