"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { useCart } from "@/lib/marketing/store";
import type { CartItem } from "@/types/marketing";

type BookingActionsProps = {
  item: Omit<CartItem, "id" | "quantity" | "details">;
  details?: CartItem["details"];
};

export function BookingActions({ item, details = {} }: BookingActionsProps) {
  const router = useRouter();
  const { add } = useCart();

  const queueItem = () => {
    add({
      id: `${item.type}-${Date.now()}`,
      ...item,
      quantity: 1,
      details,
    });
  };

  const handleAddToCart = () => {
    queueItem();
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button variant="gradient" size="lg" onClick={handleAddToCart}>
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          queueItem();
          router.push("/checkout");
        }}
      >
        <Zap className="h-4 w-4" />
        Book Instantly
      </Button>
    </div>
  );
}
