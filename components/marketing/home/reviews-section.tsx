"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { ReviewCard } from "@/components/marketing/cards/review-blog-card";
import { REVIEWS } from "@/lib/marketing/data/mock";

export function ReviewsSection() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <section className="py-24 mesh-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-emerald-600 font-semibold text-sm mb-3 tracking-wide uppercase">Traveler Stories</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by<br />
              <span className="gradient-text">2.4M+ travelers</span>
            </h2>

            {/* Rating Summary */}
            <div className="inline-flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl px-6 py-4 shadow-md border border-slate-100 dark:border-slate-800 mt-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">{avg}</div>
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-1">Overall Rating</div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Based on</div>
                <div className="text-2xl font-bold text-emerald-600">48,200+</div>
                <div className="text-xs text-slate-500">verified reviews</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
