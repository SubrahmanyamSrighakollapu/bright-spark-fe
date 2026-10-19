"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import Link from "next/link";

export function AiPlannerCTA() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 aurora" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Trip Planning
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Let AI plan your<br />
              <span className="gradient-text">perfect trip</span>
            </h2>

            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Tell us your dream destination, budget, and travel style. Our AI will craft a personalized itinerary with the best hotels, activities, and experiences — in seconds.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                { icon: Zap, label: "Instant Itinerary" },
                { icon: Globe, label: "190+ Destinations" },
                { icon: Calendar, label: "Smart Scheduling" },
                { icon: Sparkles, label: "Personalized" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 text-sm px-4 py-2 rounded-full">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                  {label}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/ai-planner">
                <Button variant="gradient" size="xl" className="shadow-2xl shadow-emerald-500/30 pulse-glow">
                  <Sparkles className="h-5 w-5" />
                  Start Planning with AI
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/destinations">
                <Button variant="ghost" size="xl" className="text-white hover:bg-white/10">
                  Browse Destinations
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

