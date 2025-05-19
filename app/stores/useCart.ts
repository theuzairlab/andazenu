import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../../components/ProductCollection';
import { ensureProductPrice, priceToNumber } from '@/lib/priceUtils';

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
  updateQuantity: (productId: string | number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemPrice: (item: CartItem) => number;
}

const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        
        // Ensure product has valid sellingPrice before adding to cart
        const validItem = {
          ...item,
          product: ensureProductPrice(item.product)
        };
        
        // Check if the item already exists with the same color and size
        const existingItemIndex = items.findIndex(
          i => i.product.id === validItem.product.id && i.color === validItem.color && i.size === validItem.size
        );
        
        if (existingItemIndex !== -1) {
          // If item exists, update quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += validItem.quantity;
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
      getItemPrice: (item) => {
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
            return total + (price * item.quantity);
          }, 0);
          
          return total;
        } catch (error) {
          console.error('Error calculating total price:', error);
          return 0;
        }
      }
    }),
    {
      name: 'cart-storage', // unique name for localStorage
    }
  )
);

export default useCart; 