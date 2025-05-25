import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { ensureProductPrice, priceToNumber } from '@/lib/priceUtils';
import toast from 'react-hot-toast';

export interface CartItem {
  product: Product;
  quantity: number;
  color: string;
  size: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string | number, color: string, size: string) => void;
  updateQuantity: (
    productId: string | number,
    color: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemPrice: (item: CartItem) => number;
  getItemQuantityInCart: (productId: string | number, color: string, size: string) => number;
}

const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      getItemQuantityInCart: (productId, color, size) => {
        const { items } = get();
        const existingItem = items.find(
          i =>
            i.product.id === productId &&
            i.color === color &&
            i.size === size
        );
        return existingItem ? existingItem.quantity : 0;
      },

      addItem: item => {
        const { items, getItemQuantityInCart } = get();

        // Ensure product has valid sellingPrice before adding to cart
        const validItem = {
          ...item,
          product: ensureProductPrice(item.product),
        };

        // Get current quantity in cart for this product variant
        const currentQuantityInCart = getItemQuantityInCart(
          validItem.product.id,
          validItem.color,
          validItem.size
        );

        // Get available stock for this size
        const availableStock = validItem.product.productSizes?.find(
          s => s.size === validItem.size
        )?.stock || 0;

        // Calculate total quantity after adding
        const totalQuantity = currentQuantityInCart + validItem.quantity;

        // Check if total quantity exceeds available stock
        if (totalQuantity > availableStock) {
          toast.error(`Cannot add ${validItem.quantity} more items. Only ${availableStock - currentQuantityInCart} items available in stock.`);
          return;
        }

        // Check if the item already exists with the same color and size
        const existingItemIndex = items.findIndex(
          i =>
            i.product.id === validItem.product.id &&
            i.color === validItem.color &&
            i.size === validItem.size
        );

        if (existingItemIndex !== -1) {
          // If item exists, update quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity = totalQuantity;
          set({ items: updatedItems });
        } else {
          // If item doesn't exist, add it
          set({ items: [...items, validItem] });
        }
      },

      removeItem: (productId, color, size) => {
        const { items } = get();
        const filteredItems = items.filter(
          item => !(item.product.id === productId && item.color === color && item.size === size)
        );
        set({ items: filteredItems });
      },

      updateQuantity: (productId, color, size, quantity) => {
        const { items } = get();
        const updatedItems = items.map(item => {
          if (item.product.id === productId && item.color === color && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get numeric price from a cart item (product)
      getItemPrice: item => {
        // Ensure the product has a valid sellingPrice
        const product = ensureProductPrice(item.product);
        return product.sellingPrice;
      },

      getTotalPrice: () => {
        const { items, getItemPrice } = get();
        try {
          // Calculate total price by summing all items
          const total = items.reduce((total, item) => {
            const price = getItemPrice(item);
            return total + price * item.quantity;
          }, 0);

          return total;
        } catch (error) {
          console.error('Error calculating total price:', error);
          return 0;
        }
      },
    }),
    {
      name: 'cart-storage', // unique name for localStorage
    }
  )
);

export default useCart;
