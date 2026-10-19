"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { PackageCard } from "@/components/marketing/cards/package-hotel-card";
import { PACKAGES } from "@/lib/marketing/data/mock";

export function FeaturedPackages() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-emerald-600 font-semibold text-sm mb-3 tracking-wide uppercase">Curated For You</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              Featured<br />
              <span className="gradient-text">Holiday Packages</span>
            </h2>
            <p className="text-slate-500 mt-3 max-w-lg">
              Hand-picked packages with the best value, premium hotels, and unforgettable experiences.
            </p>
          </motion.div>
          <Link href="/packages">
            <Button variant="outline" size="md">
              All Packages <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES.slice(0, 6).map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
