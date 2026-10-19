"use client";
import { motion } from "framer-motion";
import { Globe, Heart, Zap, Shield, Users, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";
import { cn } from "@/lib/marketing/utils";

const TIMELINE = [
  { year: "2013", title: "Founded", desc: "Started with a vision to make premium travel accessible to everyone." },
  { year: "2015", title: "1M Travelers", desc: "Reached our first million happy travelers milestone." },
  { year: "2018", title: "Global Expansion", desc: "Expanded to 50+ countries with local travel experts." },
  { year: "2021", title: "AI Integration", desc: "Launched AI-powered trip planning and personalization." },
  { year: "2023", title: "2.4M+ Community", desc: "Built a community of 2.4M+ passionate travelers worldwide." },
  { year: "2025", title: "The Future", desc: "Redefining travel with immersive experiences and smart technology." },
];

const TEAM = [
  { name: "Sarah Chen", role: "CEO & Co-Founder", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
  { name: "Marcus Williams", role: "CTO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { name: "Priya Patel", role: "Head of Design", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
  { name: "James Rodriguez", role: "Head of Partnerships", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" },
];

const VALUES = [
  { icon: Heart, title: "Passion for Travel", desc: "We live and breathe travel. Every feature we build comes from our own love of exploration.", color: "rose" },
  { icon: Shield, title: "Trust & Transparency", desc: "No hidden fees, no surprises. We believe in complete transparency in everything we do.", color: "blue" },
  { icon: Zap, title: "Innovation First", desc: "We constantly push boundaries to create the most seamless travel booking experience.", color: "amber" },
  { icon: Users, title: "Community Driven", desc: "Our 2.4M+ community of travelers shapes every decision we make.", color: "emerald" },
];

export function AboutContent() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-full mb-6">
              <Globe className="h-4 w-4" /> Our Story
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              We believe travel<br />
              <span className="gradient-text">changes lives</span>
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
              Bright Spark Travel was born from a simple belief: that extraordinary travel experiences should be accessible, effortless, and unforgettable for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Our Mission</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-3 mb-6">
                Making the world<br />more accessible
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                We started Bright Spark Travel because we were frustrated with the complexity of travel booking. Too many tabs, too many fees, too much confusion. We set out to build something different — a platform that feels as premium as the experiences it helps you book.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Today, we&apos;re proud to serve 2.4M+ travelers across 190+ destinations, with a team of passionate travel experts who review every hotel, tour, and experience we feature.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80" className="rounded-2xl aspect-square object-cover" alt="" />
                <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80" className="rounded-2xl aspect-square object-cover mt-8" alt="" />
                <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80" className="rounded-2xl aspect-square object-cover -mt-8" alt="" />
                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80" className="rounded-2xl aspect-square object-cover" alt="" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 mesh-bg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-slate-500 text-lg">The principles that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                  v.color === "rose" && "bg-rose-100 dark:bg-rose-900/30",
                  v.color === "blue" && "bg-[#E7EFD2] dark:bg-[#17362F]/30",
                  v.color === "amber" && "bg-amber-100 dark:bg-amber-900/30",
                  v.color === "emerald" && "bg-emerald-100 dark:bg-emerald-900/30",
                )}>
                  <v.icon className={cn(
                    "h-7 w-7",
                    v.color === "rose" && "text-rose-600",
                    v.color === "blue" && "text-[#2F6F5E]",
                    v.color === "amber" && "text-amber-600",
                    v.color === "emerald" && "text-emerald-600",
                  )} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Journey</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-center gap-8 mb-12 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 inline-block" style={{ boxShadow: "var(--shadow-md)" }}>
                    <div className="text-emerald-600 font-bold text-lg mb-1">{item.year}</div>
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</div>
                    <div className="text-sm text-slate-500">{item.desc}</div>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white dark:border-slate-950 z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 mesh-bg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-slate-500">The passionate people behind Bright Spark Travel.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img src={member.image} alt={member.name} className="w-full h-full rounded-2xl object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">{member.name}</div>
                <div className="text-sm text-slate-500">{member.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to explore the world?</h2>
          <p className="text-white/80 text-lg mb-8">Join 2.4M+ travelers who trust Bright Spark Travel for their journeys.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/destinations">
              <Button variant="dark" size="xl">Start Exploring <ArrowRight className="h-5 w-5" /></Button>
            </Link>
            <Link href="/contact">
              <Button variant="glass" size="xl">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

