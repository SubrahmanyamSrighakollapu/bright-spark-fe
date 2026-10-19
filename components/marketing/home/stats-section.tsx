"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Globe, Building2, Shield, Zap, HeadphonesIcon, CreditCard, Award } from "lucide-react";

const STATS = [
  { label: "Happy Travelers", value: 2400000, suffix: "+", display: "2.4M+", icon: Users, color: "emerald" },
  { label: "Destinations", value: 190, suffix: "+", display: "190+", icon: Globe, color: "blue" },
  { label: "Partner Hotels", value: 50000, suffix: "+", display: "50K+", icon: Building2, color: "purple" },
  { label: "Years of Trust", value: 12, suffix: "+", display: "12+", icon: Shield, color: "amber" },
];

const WHY_US = [
  { icon: Zap, title: "Instant Confirmation", desc: "Get your booking confirmed in seconds with real-time availability.", color: "emerald" },
  { icon: CreditCard, title: "Best Price Guarantee", desc: "Find a lower price? We'll match it and give you an extra 10% off.", color: "blue" },
  { icon: HeadphonesIcon, title: "24/7 Expert Support", desc: "Our travel experts are available around the clock, wherever you are.", color: "purple" },
  { icon: Shield, title: "Secure & Trusted", desc: "Bank-grade encryption and trusted by 2.4M+ travelers worldwide.", color: "amber" },
  { icon: Award, title: "Curated Experiences", desc: "Every destination, hotel, and tour is hand-picked by our travel experts.", color: "coral" },
  { icon: Globe, title: "Global Coverage", desc: "190+ destinations across 6 continents with local expertise.", color: "teal" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  const display = value >= 1000000
    ? (count / 1000000).toFixed(1) + "M"
    : value >= 1000
    ? (count / 1000).toFixed(0) + "K"
    : count.toString();

  return <span ref={ref}>{display}{suffix}</span>;
}

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  blue: "bg-[#E7EFD2] text-[#2F6F5E] dark:bg-[#17362F]/30 dark:text-[#8DA84D]",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  coral: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
};

export function StatsSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorMap[stat.color]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-emerald-600 font-semibold text-sm mb-3 tracking-wide uppercase">Why Bright Spark Travel</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Travel smarter,<br />
              <span className="gradient-text">not harder</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              We&apos;ve reimagined travel booking from the ground up — making it faster, smarter, and more enjoyable than ever before.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_US.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${colorMap[item.color]}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

