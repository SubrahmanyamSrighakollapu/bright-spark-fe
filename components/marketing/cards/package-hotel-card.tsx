"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, Clock, Users, MapPin, Check, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/marketing/ui/index";
import { Button } from "@/components/marketing/ui/button";
import { useWishlist } from "@/lib/marketing/store";
import { cn, formatPrice } from "@/lib/marketing/utils";
import type { Package, Hotel } from "@/types/marketing";

// ─── Package Card ─────────────────────────────────────────────────────────────
export function PackageCard({ pkg, index = 0 }: { pkg: Package; index?: number }) {
  const { toggle, has } = useWishlist();
  const isWishlisted = has(pkg.id);
  const discount = pkg.originalPrice ? Math.round((1 - pkg.price / pkg.originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift" style={{ boxShadow: "var(--shadow-md)" }}>
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {pkg.trending && <Badge variant="premium" size="sm">🔥 Trending</Badge>}
            {discount > 0 && <Badge variant="danger" size="sm">{discount}% OFF</Badge>}
          </div>

          {/* Wishlist */}
          <button
            onClick={() => toggle({ id: `pkg-${pkg.id}`, type: "package", itemId: pkg.id, title: pkg.title, image: pkg.image, price: pkg.price, addedAt: new Date().toISOString() })}
            className="absolute top-3 right-3 h-8 w-8 rounded-full glass flex items-center justify-center hover:scale-110 transition-all"
          >
            <Heart className={cn("h-3.5 w-3.5", isWishlisted ? "fill-red-500 text-red-500" : "text-white")} />
          </button>

          {/* Duration */}
          <div className="absolute bottom-3 left-3 glass text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> {pkg.duration}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {pkg.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            <span>{pkg.destination}</span>
          </div>

          {/* Includes */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pkg.includes.slice(0, 3).map((inc) => (
              <span key={inc} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <Check className="h-3 w-3 text-emerald-500" /> {inc}
              </span>
            ))}
            {pkg.includes.length > 3 && (
              <span className="text-xs text-slate-400 px-2 py-1">+{pkg.includes.length - 3} more</span>
            )}
          </div>

          {/* Rating & Price */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < Math.floor(pkg.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
                ))}
              </div>
              <span className="text-xs text-slate-500">({pkg.reviews.toLocaleString()})</span>
            </div>
            <div className="text-right">
              {pkg.originalPrice && (
                <div className="text-xs text-slate-400 line-through">{formatPrice(pkg.originalPrice)}</div>
              )}
              <div className="font-bold text-emerald-600 text-lg">{formatPrice(pkg.price)}</div>
              <div className="text-xs text-slate-400">per person</div>
            </div>
          </div>

          <Link href={`/packages/${pkg.id}`}>
            <Button variant="gradient" size="sm" className="w-full mt-3">
              View Package <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hotel Card ───────────────────────────────────────────────────────────────
export function HotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  const { toggle, has } = useWishlist();
  const isWishlisted = has(hotel.id);
  const discount = hotel.originalPrice ? Math.round((1 - hotel.price / hotel.originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2">
            {hotel.featured && <Badge variant="premium" size="sm">⭐ Featured</Badge>}
            {discount > 0 && <Badge variant="danger" size="sm">{discount}% OFF</Badge>}
          </div>

          <button
            onClick={() => toggle({ id: `hotel-${hotel.id}`, type: "hotel", itemId: hotel.id, title: hotel.name, image: hotel.image, price: hotel.price, addedAt: new Date().toISOString() })}
            className="absolute top-3 right-3 h-8 w-8 rounded-full glass flex items-center justify-center hover:scale-110 transition-all"
          >
            <Heart className={cn("h-3.5 w-3.5", isWishlisted ? "fill-red-500 text-red-500" : "text-white")} />
          </button>

          <div className="absolute bottom-3 left-3 flex">
            {[...Array(hotel.stars)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">{hotel.name}</h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            <span>{hotel.location}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">{a}</span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{hotel.rating}</span>
                <span className="text-xs text-slate-500">({hotel.reviews.toLocaleString()})</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Excellent</div>
            </div>
            <div className="text-right">
              {hotel.originalPrice && (
                <div className="text-xs text-slate-400 line-through">{formatPrice(hotel.originalPrice)}</div>
              )}
              <div className="font-bold text-emerald-600 text-lg">{formatPrice(hotel.price)}</div>
              <div className="text-xs text-slate-400">per night</div>
            </div>
          </div>

          <Link href={`/hotels/${hotel.id}`}>
            <Button variant="outline" size="sm" className="w-full mt-3">
              View Hotel <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

