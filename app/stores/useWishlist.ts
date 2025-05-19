import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../../components/ProductCollection';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string | number) => void;
  isInWishlist: (productId: string | number) => boolean;
  clearWishlist: () => void;
}

const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const { items } = get();
        const isItemExist = items.some(item => item.id === product.id);
        
        if (!isItemExist) {
          set({ items: [...items, product] });
        }
      },
      
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== productId) });
      },
      
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some(item => item.id === productId);
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'wishlist-storage', // unique name for localStorage
    }
  )
);

export default useWishlist; 