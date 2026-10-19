"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import { BlogCard } from "@/components/marketing/cards/review-blog-card";
import { BLOG_POSTS } from "@/lib/marketing/data/mock";
import { cn } from "@/lib/marketing/utils";

const BLOG_CATEGORIES = ["All", "Inspiration", "Tips & Tricks", "Destination Guide", "Safety", "Food & Culture", "Adventure"];

export function BlogsContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = BLOG_POSTS.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" /> Travel Stories & Inspiration
            </span>
            <h1 className="text-5xl font-bold text-white mb-4">The Bright Spark Travel Blog</h1>
            <p className="text-white/70 text-lg mb-8">Expert tips, destination guides, and travel inspiration from around the world.</p>
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-base"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                category === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured */}
        {category === "All" && !search && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Featured Article</h2>
            <BlogCard post={BLOG_POSTS[0]} featured />
          </div>
        )}

        {/* Grid */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {category === "All" && !search ? "Latest Articles" : `${filtered.length} Results`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-slate-500">Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

