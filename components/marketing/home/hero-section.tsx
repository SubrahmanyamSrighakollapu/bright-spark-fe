"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Users, Plane, Hotel, Package, Compass, Shield, TrendingUp, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { cn } from "@/lib/marketing/utils";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=90",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=90",
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=90",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=90",
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=90",
];

const HERO_TEXTS = [
  { title: "Discover Paradise", subtitle: "in Bali, Indonesia", tag: "🏝️ Trending" },
  { title: "Romance Awaits", subtitle: "in Santorini, Greece", tag: "💑 Honeymoon" },
  { title: "Luxury Redefined", subtitle: "in the Maldives", tag: "💎 Luxury" },
  { title: "Ancient Wonders", subtitle: "in Kyoto, Japan", tag: "🌸 Cultural" },
  { title: "Wild Africa", subtitle: "Kenya Safari", tag: "🦁 Adventure" },
];

const SEARCH_TABS = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "packages", label: "Packages", icon: Package },
  { id: "tours", label: "Tours", icon: Compass },
  { id: "visa", label: "Visa", icon: Shield },
];

const POPULAR = ["Bali", "Maldives", "Dubai", "Paris", "Tokyo", "Santorini"];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("flights");
  const [tripType, setTripType] = useState<"one-way" | "round-trip" | "multi-city">("round-trip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dates, setDates] = useState("");
  const [guests, setGuests] = useState("2 Adults");

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img src={HERO_IMAGES[currentSlide]} alt="Destination" className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>
        {/* Strong overlay for text readability */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.65) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 60%)" }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: 4, height: 4, background: "rgba(255,255,255,0.4)", left: `${15 + i * 14}%`, top: `${20 + i * 8}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 items-center px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40">
        {/* Hero Text */}
        <div className="w-full text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold px-5 py-2.5 rounded-full mb-6 border border-white/20"
                style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)" }}
              >
                <span>{HERO_TEXTS[currentSlide].tag}</span>
              </div>
              <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                {HERO_TEXTS[currentSlide].title}
              </h1>
              <p className="mt-4 text-xl font-light text-white/85 drop-shadow-lg sm:text-2xl lg:text-3xl">
                {HERO_TEXTS[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/80 sm:gap-6"
          >
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="hidden h-4 w-px bg-white/30 sm:block" />
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">2.4M+ Travelers</span>
            </div>
            <div className="hidden h-4 w-px bg-white/30 sm:block" />
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#8DA84D]" />
              <span className="font-medium">Best Price Guarantee</span>
            </div>
          </motion.div>
        </div>

        {/* Search Widget */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-10 max-w-5xl"
        >
          <div
            className="rounded-3xl shadow-2xl overflow-hidden border border-white/25"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
          >
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/15 p-3">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all sm:px-4",
                    activeTab === tab.id
                      ? "text-white shadow-md"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  )}
                  style={activeTab === tab.id ? { background: "rgba(5,150,105,0.9)" } : {}}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
              {activeTab === "flights" && (
                <div className="flex basis-full items-center justify-start gap-1 pt-1 sm:ml-auto sm:basis-auto sm:justify-end sm:pt-0">
                  {(["one-way", "round-trip", "multi-city"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTripType(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                        tripType === type ? "bg-white/25 text-white" : "text-white/60 hover:text-white"
                      )}
                    >
                      {type.replace("-", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="p-4 sm:p-6">
              {activeTab === "flights" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <SearchField icon={<MapPin className="h-4 w-4" />} label="From" placeholder="City or Airport" value={from} onChange={setFrom} />
                  <SearchField icon={<MapPin className="h-4 w-4" />} label="To" placeholder="City or Airport" value={to} onChange={setTo} />
                  <SearchField icon={<Calendar className="h-4 w-4" />} label="Dates" placeholder="Add dates" value={dates} onChange={setDates} />
                  <SearchField icon={<Users className="h-4 w-4" />} label="Travelers" placeholder="2 Adults" value={guests} onChange={setGuests} />
                </div>
              )}
              {activeTab === "hotels" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <SearchField icon={<MapPin className="h-4 w-4" />} label="Destination" placeholder="City, hotel, or area" value={to} onChange={setTo} />
                  <SearchField icon={<Calendar className="h-4 w-4" />} label="Check-in — Check-out" placeholder="Select dates" value={dates} onChange={setDates} />
                  <SearchField icon={<Users className="h-4 w-4" />} label="Guests & Rooms" placeholder="2 Adults, 1 Room" value={guests} onChange={setGuests} />
                </div>
              )}
              {(activeTab === "packages" || activeTab === "tours") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <SearchField icon={<MapPin className="h-4 w-4" />} label="Destination" placeholder="Where do you want to go?" value={to} onChange={setTo} />
                  <SearchField icon={<Calendar className="h-4 w-4" />} label="Travel Date" placeholder="When are you traveling?" value={dates} onChange={setDates} />
                  <SearchField icon={<Users className="h-4 w-4" />} label="Travelers" placeholder="How many travelers?" value={guests} onChange={setGuests} />
                </div>
              )}
              {activeTab === "visa" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchField icon={<MapPin className="h-4 w-4" />} label="Nationality" placeholder="Your passport country" value={from} onChange={setFrom} />
                  <SearchField icon={<MapPin className="h-4 w-4" />} label="Destination Country" placeholder="Where are you going?" value={to} onChange={setTo} />
                </div>
              )}

              <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTo(s)}
                      className="text-xs text-white/80 hover:text-white font-medium px-3 py-1.5 rounded-full transition-all border border-white/20 hover:border-white/40 hover:bg-white/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-shrink-0 shadow-xl"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Slide indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn("transition-all rounded-full", i === currentSlide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60")}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
      >
        <span className="text-xs font-semibold tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
      </motion.div>
    </section>
  );
}

function SearchField({ icon, label, placeholder, value, onChange, className }: {
  icon: React.ReactNode; label: string; placeholder: string;
  value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <div className={cn("relative group", className)}>
      <label className="block text-xs font-bold text-white/70 mb-1.5 pl-1 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-emerald-400 transition-colors">
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/45 transition-all focus:outline-none border border-white/20 focus:border-emerald-400/70 focus:ring-2"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
          }}
        />
      </div>
    </div>
  );
}

