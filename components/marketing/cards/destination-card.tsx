"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, TrendingUp, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/marketing/ui/index";
import { useWishlist } from "@/lib/marketing/store";
import { cn, formatPrice } from "@/lib/marketing/utils";
import type { Destination } from "@/types/marketing";

interface DestinationCardProps {
  destination: Destination;
  variant?: "default" | "compact" | "featured";
  index?: number;
}

export function DestinationCard({ destination, variant = "default", index = 0 }: DestinationCardProps) {
  const { toggle, has } = useWishlist();
  const isWishlisted = has(destination.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({
      id: `dest-${destination.id}`,
      type: "destination",
      itemId: destination.id,
      title: destination.name,
      image: destination.image,
      price: destination.price,
      addedAt: new Date().toISOString(),
    });
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
      >
        <Link href={`/destinations/${destination.id}`} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <img src={destination.image} alt={destination.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white truncate">{destination.name}</div>
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />{destination.country}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-emerald-600">from {formatPrice(destination.price)}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{destination.rating}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group relative"
      >
        <Link href={`/destinations/${destination.id}`} className="block relative rounded-3xl overflow-hidden aspect-[3/4]">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-4 right-4 h-9 w-9 rounded-full glass flex items-center justify-center transition-all hover:scale-110"
          >
            <Heart className={cn("h-4 w-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-white")} />
          </button>

          {destination.trending && (
            <div className="absolute top-4 left-4">
              <Badge variant="premium" size="sm">
                <TrendingUp className="h-3 w-3" /> Trending
              </Badge>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{destination.name}</h3>
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{destination.country}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60 mb-0.5">from</div>
                <div className="text-lg font-bold text-white">{formatPrice(destination.price)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-semibold">{destination.rating}</span>
                <span className="text-white/50">({destination.reviews.toLocaleString()})</span>
              </div>
              <div className="flex gap-1 ml-auto">
                {destination.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{tag}</span>
                ))}
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
      <Link href={`/destinations/${destination.id}`} className="block">
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-3">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 h-8 w-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <Heart className={cn("h-3.5 w-3.5", isWishlisted ? "fill-red-500 text-red-500" : "text-white")} />
          </button>

          {destination.trending && (
            <div className="absolute top-3 left-3">
              <Badge variant="premium" size="sm">🔥 Hot</Badge>
            </div>
          )}

          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <div className="glass text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
              Explore <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        <div className="px-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              {destination.name}, {destination.country}
            </h3>
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 flex-shrink-0 ml-2">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{destination.rating}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {destination.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            <span className="text-sm font-bold text-emerald-600">from {formatPrice(destination.price)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

