"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { BlogCard } from "@/components/marketing/cards/review-blog-card";
import { BLOG_POSTS } from "@/lib/marketing/data/mock";

export function BlogSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-emerald-600 font-semibold text-sm mb-3 tracking-wide uppercase">Travel Inspiration</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
              Stories &<br />
              <span className="gradient-text">Travel Tips</span>
            </h2>
          </motion.div>
          <Link href="/blogs">
            <Button variant="outline" size="md">
              All Articles <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured */}
          <BlogCard post={BLOG_POSTS[0]} featured />

          {/* Side List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BLOG_POSTS.slice(1, 5).map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
