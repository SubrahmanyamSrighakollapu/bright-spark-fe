"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Tag, ArrowRight, Shield, CreditCard, Gift, Percent, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";
import { useCart } from "@/lib/marketing/store";
import { formatPrice, cn } from "@/lib/marketing/utils";

const COUPONS = [
  { code: "SAVE10", discount: 10, type: "percent" as const, label: "10% off" },
  { code: "FLAT50", discount: 50, type: "flat" as const, label: "$50 off" },
  { code: "FIRST20", discount: 20, type: "percent" as const, label: "20% off first booking" },
];

export function CartContent() {
  const { items, remove, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<typeof COUPONS[0] | null>(null);
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxes = subtotal * 0.12;
  const discount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? subtotal * (appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0;
  const total = subtotal + taxes - discount;

  const applyCoupon = () => {
    const found = COUPONS.find((c) => c.code === coupon.toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-emerald-600" />
          Your Cart
          {items.length > 0 && <span className="text-lg font-normal text-slate-500">({items.length} item{items.length > 1 ? "s" : ""})</span>}
        </h1>
        {items.length > 0 && (
          <button onClick={clear} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors">
            <Trash2 className="h-4 w-4" /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
          <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Add flights, hotels, or packages to get started on your next adventure.</p>
          <Link href="/destinations">
            <Button variant="gradient" size="lg">Explore Destinations <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex gap-4" style={{ boxShadow: "var(--shadow-md)" }}>
                <img src={item.image} alt={item.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-emerald-600 font-semibold capitalize mb-0.5">{item.type}</div>
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
                    </div>
                    <button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-emerald-600">{formatPrice(item.price)}</div>
                      <div className="text-xs text-slate-400">per person</div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Coupon */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-md)" }}>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-500" /> Apply Coupon
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                <Button variant="outline" size="md" onClick={applyCoupon}>Apply</Button>
              </div>
              {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
                  <Percent className="h-4 w-4" /> Coupon &quot;{appliedCoupon.code}&quot; applied — {appliedCoupon.label}!
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {COUPONS.map((c) => (
                  <button key={c.code} onClick={() => { setCoupon(c.code); }}
                    className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors">
                    {c.code} — {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 sticky top-24" style={{ boxShadow: "var(--shadow-lg)" }}>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-5">Order Summary</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Taxes & Fees (12%)</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatPrice(taxes)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="font-medium text-emerald-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-800" />
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="font-bold text-emerald-600 text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button variant="gradient" size="lg" className="w-full mb-3">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <div className="space-y-2 mt-4">
                {[
                  { icon: Shield, text: "Secure SSL encrypted payment" },
                  { icon: CreditCard, text: "All major cards accepted" },
                  { icon: Gift, text: "Earn 500 reward points" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon className="h-3.5 w-3.5 text-emerald-500" /> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

