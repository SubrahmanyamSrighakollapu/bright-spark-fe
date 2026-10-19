"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, ThumbsUp, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { cn, formatDate } from "@/lib/marketing/utils";
import type { Review, BlogPost } from "@/types/marketing";

// ─── Review Card ──────────────────────────────────────────────────────────────
export function ReviewCard({ review, index = 0 }: { review: Review; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 h-full flex flex-col"
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={cn("h-4 w-4", i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
        ))}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{review.title}</h4>

      {/* Content */}
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-1 line-clamp-4">{review.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <img src={review.avatar} alt={review.author} className="w-9 h-9 rounded-full object-cover" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-slate-900 dark:text-white">{review.author}</span>
              {review.verified && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            {review.destination && (
              <div className="text-xs text-slate-500">{review.destination}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <ThumbsUp className="h-3 w-3" />
          <span>{review.helpful}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
export function BlogCard({ post, index = 0, featured = false }: { post: BlogPost; index?: number; featured?: boolean }) {
  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group"
      >
        <Link href={`/blogs/${post.slug}`} className="block">
          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] mb-4">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{post.category}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <img src={post.authorAvatar} alt={post.author} className="w-6 h-6 rounded-full" />
                <span>{post.author}</span>
                <span>·</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group"
    >
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-3">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <span className="bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{post.category}</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{post.title}</h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <img src={post.authorAvatar} alt={post.author} className="w-5 h-5 rounded-full" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

