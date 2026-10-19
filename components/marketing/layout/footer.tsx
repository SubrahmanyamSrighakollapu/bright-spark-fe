"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Globe, Mail, Phone, MapPin, ArrowRight, Sparkles, Share2, Rss, X, MessageCircle, Link2 } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";

const FOOTER_LINKS = {
  "Destinations": [
    { label: "Bali, Indonesia", href: "/destinations/bali" },
    { label: "Santorini, Greece", href: "/destinations/santorini" },
    { label: "Maldives", href: "/destinations/maldives" },
    { label: "Kyoto, Japan", href: "/destinations/kyoto" },
    { label: "Dubai, UAE", href: "/destinations/dubai" },
    { label: "Paris, France", href: "/destinations/paris" },
  ],
  "Services": [
    { label: "BBPS Agent Portal", href: "/login" },
    { label: "Flight Booking", href: "/flights" },
    { label: "Hotel Booking", href: "/hotels" },
    { label: "Holiday Packages", href: "/packages" },
    { label: "Visa Services", href: "/visa" },
    { label: "Travel Insurance", href: "/insurance" },
    { label: "Car Rentals", href: "/car-rentals" },
  ],
  "Company": [
    { label: "About Us", href: "/about" },
    { label: "Travel Blog", href: "/blogs" },
    { label: "Offers & Deals", href: "/offers" },
    { label: "Tours", href: "/tours" },
    { label: "Cruises", href: "/cruises" },
    { label: "Contact Us", href: "/contact" },
  ],
  "Support": [
    { label: "Help Center", href: "/contact" },
    { label: "Cancellation Policy", href: "/contact" },
    { label: "Refund Policy", href: "/contact" },
    { label: "Privacy Policy", href: "/contact" },
    { label: "Terms of Service", href: "/contact" },
    { label: "Cookie Policy", href: "/contact" },
  ],
};

const SOCIALS = [
  { icon: Share2, href: "#", label: "Instagram" },
  { icon: X, href: "#", label: "Twitter / X" },
  { icon: MessageCircle, href: "#", label: "Facebook" },
  { icon: Rss, href: "#", label: "YouTube" },
  { icon: Link2, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden mb-16 p-8 md:p-12"
          style={{ background: "linear-gradient(135deg, #059669 0%, #0ea5e9 100%)" }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <span className="text-amber-300 font-semibold text-sm">Exclusive Deals</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Get travel deals in your inbox</h3>
              <p className="text-white/80">Join 2.4M+ travelers. Unsubscribe anytime.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 h-12 rounded-xl px-4 text-sm bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
              <Button variant="dark" size="md" className="whitespace-nowrap">
                Subscribe <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/bright-spark-logo.jpg"
                alt="Logo"
                width={160}
                height={40}
                className="h-10 w-auto object-contain rounded-lg"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your premium travel & bill payment companion. Discover, plan, and execute operations with confidence.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>support@bharatconnect.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>1800-11-2233</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Operations Network Node</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 Retailer Operations Portal. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-emerald-600 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>🔒 SSL Secured</span>
            <span>✓ IATA Certified</span>
            <span>⭐ 4.9/5 Rating</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

