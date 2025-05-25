'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import QuickViewModal from './QuickViewModal';
import WishlistIcon from './WishlistIcon';
import { getColorClass, getImageForColor } from '@/lib/colorUtils';
import { ensureProductPrice } from '@/lib/priceUtils';
import { Product } from '@/types/product';
import ProductImageSlider from './ProductImageSlider';

export type ProductsSliderProps = {
  title: string;
  description: string;
  products: Product[];
  viewAllPageLink: string;
};

export default function ProductsSlider({
  title,
  description,
  products,
  viewAllPageLink,
}: ProductsSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Record<string | number, string>>({});
  const [productImages, setProductImages] = useState<Record<string | number, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize selected colors and product images
  useEffect(() => {
    const initialSelectedColors: Record<string | number, string> = {};
    const initialProductImages: Record<string | number, string> = {};

    products.forEach(product => {
      if (product.colors.length > 0) {
        const defaultColor = product.colors[0];
        initialSelectedColors[product.id] = defaultColor;

        // Use the utility function to get the image for the default color
        initialProductImages[product.id] = getImageForColor(
          defaultColor,
          product.colorImages || {},
          product.image
        );
      }
    });

    setSelectedColors(initialSelectedColors);
    setProductImages(initialProductImages);
  }, [products]);

  // Calculate how many items to display based on screen size
  const [visibleItems, setVisibleItems] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 768) {
        setVisibleItems(2);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(3);
      } else {
        setVisibleItems(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto sliding functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isHovered) {
      interval = setInterval(() => {
        nextSlide();
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentIndex, isHovered]);

  const nextSlide = () => {
    if (currentIndex < products.length - visibleItems) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    } else {
      setCurrentIndex(products.length - visibleItems);
    }
  };

  const openQuickView = (product: Product) => {
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
    const product = products.find(p => p.id === productId);
    if (product) {
      // Use the utility function to get the image for this color
      const imageUrl = getImageForColor(color, product.colorImages || {}, product.image);

      setProductImages({
        ...productImages,
        [productId]: imageUrl,
      });
    }
  };

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-black">
        <h2 className="text-center text-4xl font-bold mb-2">{title}</h2>
        <p className="text-center text-gray-600 mb-8">{description}</p>

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            className="absolute left-0 sm:-left-5 top-1/3 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
            onClick={prevSlide}
            aria-label="Previous product"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="overflow-hidden" ref={sliderRef}>
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` }}
            >
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex-shrink-0"
                  style={{ width: `calc(100% / ${visibleItems})` }}
                >
                  <div className="mx-2 bg-gray-50 rounded-xl overflow-hidden relative">
                    {/* Discount badge */}
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-medium py-1 px-2 rounded">
                      {product.discount}
                    </div>

                    {/* Wishlist button */}
                    <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <WishlistIcon product={ensureProductPrice(product)} size={16} />
                    </div>

                    {/* Product image with hover effect */}
                    <div className="w-full h-[400px] bg-gray-200 overflow-hidden relative group">
                      <ProductImageSlider
                        mainImage={product.image}
                        colorImages={product.colorImages || {}}
                        selectedColor={selectedColors[product.id]}
                      />

                      {/* Quick View Button - appears only on image hover */}
                      <div className="absolute bottom-0 left-0 right-0 py-3 px-4 opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition duration-300">
                        <button
                          onClick={() => openQuickView(product)}
                          className="w-full bg-white text-black hover:bg-black hover:text-white shadow text-center text-sm font-medium py-4 rounded-4xl  transition-colors cursor-pointer"
                        >
                          Select Options
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white flex flex-col justify-center items-center">
                      <Link
                        href={`/product/${product.id}`}
                        className="font-bold text-md mb-1 text-center hover:text-gray-500"
                      >
                        {product.title}
                      </Link>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="font-semibold text-red-500">{product.salePrice}</span>
                        <span className="text-gray-500 line-through text-xs">
                          {product.regularPrice}
                        </span>
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
                              className={`block w-5 h-5 border border-gray-600 p-1 rounded-full ${getColorClass(color)} transition-all duration-200 
                                ${selectedColors[product.id] === color ? 'ring-2 ring-offset-2 ring-black scale-90' : ''}`}
                              aria-label={color}
                              style={{ backgroundColor: color }}
                            ></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="absolute right-0 sm:-right-5 top-1/3 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
            onClick={nextSlide}
            aria-label="Next product"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <div className="text-center mt-10">
          <Link
            href={viewAllPageLink}
            className="inline-block border border-black text-black px-8 py-2.5 font-medium hover:bg-black hover:text-white transition-colors text-sm rounded"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal product={selectedProduct} isOpen={isModalOpen} onClose={closeQuickView} />
    </section>
  );
}
