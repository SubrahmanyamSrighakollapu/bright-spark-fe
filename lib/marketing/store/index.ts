import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem, CartItem } from "@/types/marketing";

interface WishlistStore {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  has: (itemId: string) => boolean;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  total: () => number;
}

interface UIStore {
  theme: "light" | "dark";
  searchOpen: boolean;
  wishlistOpen: boolean;
  compareItems: string[];
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setSearchOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
}

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => set((s) => ({ items: [...s.items, item] })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.itemId !== id) })),
      toggle: (item) => {
        const exists = get().has(item.itemId);
        if (exists) get().remove(item.itemId);
        else get().add(item);
      },
      has: (itemId) => get().items.some((i) => i.itemId === itemId),
    }),
    { name: "bright-spark-travel-wishlist" }
  )
);

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item) => set((s) => ({ items: [...s.items, item] })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "bright-spark-travel-cart" }
  )
);

export const useUI = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      searchOpen: false,
      wishlistOpen: false,
      compareItems: [],
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        get().setTheme(next);
      },
      setSearchOpen: (open) => set({ searchOpen: open }),
      setWishlistOpen: (open) => set({ wishlistOpen: open }),
      addToCompare: (id) => set((s) => ({ compareItems: s.compareItems.includes(id) ? s.compareItems : [...s.compareItems.slice(-2), id] })),
      removeFromCompare: (id) => set((s) => ({ compareItems: s.compareItems.filter((i) => i !== id) })),
    }),
    {
      name: "bright-spark-travel-ui",
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
