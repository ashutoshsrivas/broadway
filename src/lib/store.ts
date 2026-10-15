"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The bag. Keyed by variant (colourway), because that is what actually ships.
 *
 * Prices held here are for display only — every price is recomputed from the
 * database when the order is placed, so a tampered localStorage cart cannot
 * change what a shopper is charged.
 */
export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  colorName: string;
  price: number;
  mrp: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          const ceiling = item.stock || 99;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, ceiling) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, ceiling) }],
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock || 99) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      setIsOpen: (open) => set({ isOpen: open }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "broadway-cart" }
  )
);
