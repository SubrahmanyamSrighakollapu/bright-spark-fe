"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Share2, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";
import { useWishlist, useCart } from "@/lib/marketing/store";
import { formatPrice } from "@/lib/marketing/utils";

export function WishlistContent() {
  const { items, remove } = useWishlist();
  const { add, setOpen } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    add({
      id: `cart-${item.itemId}`,
      type: item.type === "destination" ? "package" : item.type,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: 1,
      details: {},
    });
    setOpen(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-slate-500 mt-1">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" /> Share Wishlist
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-red-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your wishlist is empty</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Start exploring destinations, hotels, and packages. Click the heart icon to save your favorites.
          </p>
          <Link href="/destinations">
            <Button variant="gradient" size="lg">
              Explore Destinations <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <button
                    onClick={() => remove(item.itemId)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full capitalize">{item.type}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-emerald-600 font-bold">{formatPrice(item.price)}</span>
                    <span className="text-xs text-slate-400">per person</span>
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
