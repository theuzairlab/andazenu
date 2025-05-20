'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useWishlist from '@/app/stores/useWishlist';
import { Product } from '@/components/ProductCollection';
import { products } from '@/components/ProductsSlider';
import QuickViewModal from '@/components/QuickViewModal';
import { getColorClass, getImageForColor } from '@/lib/colorUtils';
import { ensureProductPrice } from '@/lib/priceUtils';

export type products = {
  id: number | string;
  title: string;
  image: string;
  salePrice: string;
  regularPrice: string;
  discount: string;
  colors: string[];
  colorImages?: Record<string, string>;
  sizes?: string[];
  description?: string;
};

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [selectedColors, setSelectedColors] = useState<Record<string | number, string>>({});
  const [productImages, setProductImages] = useState<Record<string | number, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<products | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setWishlistItems(items);

    // Initialize selected colors for each product (choose first color by default)
    const initialSelectedColors: Record<string | number, string> = {};
    const initialProductImages: Record<string | number, string> = {};

    items.forEach(item => {
      if (item.colors.length > 0) {
        initialSelectedColors[item.id] = item.colors[0];

        // Use our utility function to get the image
        initialProductImages[item.id] = getImageForColor(
          item.colors[0],
          item.colorImages || {},
          item.image
        );
      }
    });

    setSelectedColors(initialSelectedColors);
    setProductImages(initialProductImages);
  }, [items]);

  const openQuickView = (product: products) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeQuickView = () => {
    setIsModalOpen(false);
  };

  const handleColorSelect = (productId: string | number, color: string) => {
    setSelectedColors({
      ...selectedColors,
      [productId]: color,
    });

    // Update product image based on selected color
    const product = wishlistItems.find(item => item.id === productId);
    if (product) {
      // Use our utility function to get the image
      const imageUrl = getImageForColor(color, product.colorImages || {}, product.image);

      setProductImages({
        ...productImages,
        [productId]: imageUrl,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="mb-6 text-center">
        <div className="text-sm mb-2">
          <Link href="/" className="text-gray-500 hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-gray-400">&bull;</span>
          <span className="text-black">Wishlist</span>
        </div>
        <h1 className="text-3xl font-bold">Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium mb-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">
            Add items to your wishlist by clicking the heart icon on products.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-black text-white rounded-4xl hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {wishlistItems.map(product => (
            <div key={product.id} className="group relative">
              <div className="mx-2 bg-gray-50 rounded-xl overflow-hidden relative">
                {/* Discount badge */}
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-medium py-1 px-2 rounded">
                  {product.discount}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 cursor-pointer bg-white rounded-full flex items-center justify-center shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-700"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                {/* Product image with hover effect */}
                <div className="relative overflow-hidden">
                  {productImages[product.id] && (
                    <img
                      src={productImages[product.id] || product.image}
                      alt={product.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                  )}

                  {/* Quick View Button - appears only on image hover */}
                  <div className="absolute bottom-0 left-0 right-0 py-3 px-4 opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition duration-300">
                    {/* <Link 
                      href={`/products/${product.id}`}
                      className="block w-full bg-white text-black hover:bg-black hover:text-white shadow text-center text-sm font-medium py-4 rounded-4xl transition-colors"
                    >
                      View Product
                    </Link> */}

                    <button
                      onClick={() => openQuickView(product)}
                      className="w-full bg-white text-black hover:bg-black hover:text-white shadow text-center text-sm font-medium py-4 rounded-4xl  transition-colors cursor-pointer"
                    >
                      Select Options
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-bold text-md mb-1 text-center hover:text-gray-600">
                    {product.title}
                  </h3>
                </Link>
                <div className="flex items-start gap-2 mb-2">
                  <span className="font-semibold text-red-500">{product.salePrice}</span>
                  <span className="text-gray-500 line-through text-xs">{product.regularPrice}</span>
                </div>

                {/* Color options as radio buttons */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {product.colors.map((color, i) => (
                    <label key={i} className="cursor-pointer">
                      <input
                        type="radio"
                        name={`color-${product.id}`}
                        value={color}
                        checked={selectedColors[product.id] === color}
                        onChange={() => handleColorSelect(product.id, color)}
                        className="sr-only" // Hide the actual radio input
                      />
                      <span
                        className={`block w-5 h-5 rounded-full ${getColorClass(color)} transition-all duration-200 
                          ${selectedColors[product.id] === color ? 'ring-2 ring-offset-2 ring-black scale-90' : ''}`}
                        aria-label={color}
                        style={{ backgroundColor: color }}
                      ></span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal product={selectedProduct} isOpen={isModalOpen} onClose={closeQuickView} />
    </div>
  );
}
