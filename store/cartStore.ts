import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  customOrderDescription: string;
  selectedShop: string;

  // Computed
  totalItems: number;
  totalAmount: number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity' | 'total'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  setCustomOrder: (description: string) => void;
  setSelectedShop: (shop: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customOrderDescription: '',
      selectedShop: '',

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get totalAmount() {
        return get().items.reduce((sum, item) => sum + item.total, 0);
      },

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: i.quantity + 1,
                      total: (i.quantity + 1) * i.price,
                    }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: 1,
                total: item.price,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity,
                    total: quantity * i.price,
                  }
                : i
            ),
          };
        }),

      incrementQuantity: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  total: (i.quantity + 1) * i.price,
                }
              : i
          ),
        })),

      decrementQuantity: (productId) =>
        set((state) => {
          const item = state.items.find((i) => i.productId === productId);
          if (!item) return state;

          if (item.quantity <= 1) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: i.quantity - 1,
                    total: (i.quantity - 1) * i.price,
                  }
                : i
            ),
          };
        }),

      setCustomOrder: (customOrderDescription) => set({ customOrderDescription }),

      setSelectedShop: (selectedShop) => set({ selectedShop }),

      clearCart: () =>
        set({
          items: [],
          customOrderDescription: '',
          selectedShop: '',
        }),
    }),
    {
      name: 'gramam-cart',
    }
  )
);
