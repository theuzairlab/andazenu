'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import useWishlist from '@/app/stores/useWishlist';
import { Product } from './ProductCollection';
import toast from 'react-hot-toast';

interface WishlistIconProps {
  product: Product;
  className?: string;
  size?: number;
}

export default function WishlistIcon({ product, className = '', size = 20 }: WishlistIconProps) {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if product is in wishlist on component mount and when wishlist changes
  useEffect(() => {
    setIsFavorite(isInWishlist(product.id));
  }, [isInWishlist, product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite) {
      removeItem(product.id);
      toast.error(`${product.title} removed from wishlist`);
    } else {
      addItem(product);
      toast.success(`${product.title} added to wishlist`);
    }

    setIsFavorite(!isFavorite);
  };

  return (
    <div
      onClick={toggleWishlist}
      className={`flex items-center justify-center cursor-pointer ${className}`}
      aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={size}
        fill={isFavorite ? 'currentColor' : 'none'}
        className={`transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
      />
    </div>
  );
}
