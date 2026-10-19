"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Hotel, Package, Map, Compass, Shield, Ship, Car,
  Search, Heart, ShoppingCart, Bell, User, Menu, X, Sun, Moon,
  ChevronDown, Sparkles, Globe, TrendingUp, Zap, ArrowRight
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/marketing/ui/button";
import { useWishlist, useCart, useUI } from "@/lib/marketing/store";
import { cn } from "@/lib/marketing/utils";

const NAV_ITEMS = [
  {
    label: "Flights", href: "/flights", icon: Plane,
    mega: [
      { label: "Search Flights", href: "/flights", desc: "Find the best fares", icon: Search },
      { label: "Multi-City", href: "/flights?type=multi", desc: "Complex itineraries", icon: Map },
      { label: "Fare Calendar", href: "/flights", desc: "Best prices by date", icon: TrendingUp },
      { label: "Flight Deals", href: "/offers?type=flights", desc: "Flash sales & offers", icon: Zap },
    ]
  },
  {
    label: "Hotels", href: "/hotels", icon: Hotel,
    mega: [
      { label: "Search Hotels", href: "/hotels", desc: "50,000+ properties", icon: Search },
      { label: "Luxury Stays", href: "/hotels?category=luxury", desc: "5-star experiences", icon: Sparkles },
      { label: "Boutique Hotels", href: "/hotels?category=boutique", desc: "Unique properties", icon: Heart },
      { label: "Hotel Deals", href: "/offers?type=hotels", desc: "Best rates guaranteed", icon: Zap },
    ]
  },
  {
    label: "Packages", href: "/packages", icon: Package,
    mega: [
      { label: "All Packages", href: "/packages", desc: "Curated holiday deals", icon: Package },
      { label: "Honeymoon", href: "/packages?category=honeymoon", desc: "Romantic escapes", icon: Heart },
      { label: "Family Holidays", href: "/packages?category=family", desc: "Fun for everyone", icon: Globe },
      { label: "Adventure", href: "/packages?category=adventure", desc: "Thrilling experiences", icon: Compass },
      { label: "Luxury", href: "/packages?category=luxury", desc: "Premium experiences", icon: Sparkles },
      { label: "Pilgrimage", href: "/packages?category=pilgrimage", desc: "Sacred journeys", icon: Map },
    ]
  },
  {
    label: "Explore", href: "/destinations", icon: Globe,
    mega: [
      { label: "Destinations", href: "/destinations", desc: "190+ destinations", icon: Globe },
      { label: "Tours", href: "/tours", desc: "Guided experiences", icon: Map },
      { label: "Activities", href: "/activities", desc: "Adventures & fun", icon: Compass },
      { label: "Cruises", href: "/cruises", desc: "Ocean & river cruises", icon: Ship },
      { label: "Car Rentals", href: "/car-rentals", desc: "Drive your way", icon: Car },
      { label: "Travel Blog", href: "/blogs", desc: "Stories & tips", icon: TrendingUp },
    ]
  },
  {
    label: "Services", href: "/visa", icon: Shield,
    mega: [
      { label: "Visa Services", href: "/visa", desc: "Fast visa processing", icon: Shield },
      { label: "Travel Insurance", href: "/insurance", desc: "Travel with confidence", icon: Shield },
      { label: "Offers & Deals", href: "/offers", desc: "Best deals today", icon: Zap },
      { label: "Contact Us", href: "/contact", desc: "24/7 support", icon: Globe },
    ]
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems } = useCart();
  const { theme, toggleTheme } = useUI();
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300",
        scrolled ? "bg-slate-950/95 shadow-lg border-white/10" : "bg-slate-950/75 border-white/5"
      )}
    >
      <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8" ref={menuRef}>
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <Image
              src="/bright-spark-logo.jpg"
              alt="Logo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain rounded-lg"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative">
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                    "text-white/80 hover:text-white hover:bg-white/10",
                    activeMenu === item.label && "text-white bg-white/10"
                  )}
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", activeMenu === item.label && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {activeMenu === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl"
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.mega.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/10"
                          onClick={() => setActiveMenu(null)}
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 transition-colors">
                            <sub.icon className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{sub.label}</div>
                            <div className="text-xs text-white/50">{sub.desc}</div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-white/20 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <Link
              href="/wishlist"
              aria-label="View wishlist"
              className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <Heart className="h-4.5 w-4.5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              aria-label="View cart"
              className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm" className="shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-white/80 transition-all hover:bg-white/10 hover:text-white"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-white/80 transition-all hover:bg-white/10 hover:text-white"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Link>
              </div>
              <div className="pt-3 border-t border-white/10 flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" size="md" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="gradient" size="md" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
