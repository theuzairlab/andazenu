'use client';

import { useState, useEffect, useRef, TouchEvent } from 'react';
import { Product } from '@/types/product';
import WishlistIcon from './WishlistIcon';
import useCart from '@/app/stores/useCart';
import { toast } from 'react-hot-toast';
import { ensureProductPrice } from '@/lib/priceUtils';
import { getColorClass, getColorName, getImageForColor } from '@/lib/colorUtils';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Info, Minus, Plus, X } from 'lucide-react';

type QuickViewModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState('');
  const [allProductImages, setAllProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCart();
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance threshold
  const minSwipeDistance = 50;

  useEffect(() => {
    if (product) {
      // Initialize size stock information
      const stockInfo: Record<string, number> = {};
      
      // If we have specific size stock information, use that
      if (product.productSizes && product.productSizes.length > 0) {
        product.productSizes.forEach(size => {
          stockInfo[size.size] = size.stock || 0;
        });
      } else if (product.sizes && product.stock !== undefined) {
        // If we have total stock but no size-specific stock, distribute evenly
        const totalStock = product.stock;
        const stockPerSize = Math.floor(totalStock / product.sizes.length);
        product.sizes.forEach(size => {
          stockInfo[size] = stockPerSize;
        });
      }
      
      // Log stock info for debugging
      console.log("Product:", product.title);
      console.log("Stock info:", stockInfo);
      console.log("Product sizes:", product.productSizes);

      
      
      setSizeStock(stockInfo);
      
      if (product.colors.length > 0) {
        setSelectedColor(product.colors[0]);

        // Generate all product images based on colors
        const images: string[] = [];

        // Add main product image first
        images.push(product.image);

        // Add color variant images if they exist
        if (product.colorImages) {
          Object.values(product.colorImages).forEach(img => {
            if (img && !images.includes(img)) {
              images.push(img);
            }
          });
        }

        setAllProductImages(images);

        // Use the utility function to get the image for the default color
        const defaultImage = getImageForColor(product.colors[0], product.colorImages || {}, product.image);
        setCurrentImage(defaultImage);

        // Find index of default image
        const defaultIndex = images.indexOf(defaultImage);
        setCurrentImageIndex(defaultIndex !== -1 ? defaultIndex : 0);
      }

      if (product.sizes && product.sizes.length > 0) {
        // Find first size that has stock
        const firstAvailableSize = product.sizes.find(size => stockInfo[size] > 0) || product.sizes[0];
        setSelectedSize(firstAvailableSize);
      }
    }
  }, [product]);


  useEffect(() => {
    if (product && selectedColor) {
      // Use the utility function to get the image for the selected color
      const newImage = getImageForColor(selectedColor, product.colorImages || {}, product.image);
      setCurrentImage(newImage);

      // Find index of new image in all images array
      const newIndex = allProductImages.indexOf(newImage);
      if (newIndex !== -1) {
        setCurrentImageIndex(newIndex);
      }
    }
  }, [selectedColor, product, allProductImages]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body from scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    // Reset quantity to 1 when changing size
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    const availableStock = sizeStock[selectedSize];
    if (availableStock === undefined) {
      toast.error('Stock information not available');
      return;
    }

    // Convert to Product type with required sellingPrice field using our utility
    const productWithSellingPrice = ensureProductPrice(product);

    // Add item to cart
    addItem({
      product: productWithSellingPrice,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    });

    // Show success message
    toast.success(`${product.title} added to cart!`);

    // Close modal and open cart
    onClose();
    openCart();
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    const availableStock = sizeStock[selectedSize];
    if (availableStock === undefined) {
      toast.error('Stock information not available');
      return;
    }

    // Convert to Product type with required sellingPrice field using our utility
    const productWithSellingPrice = ensureProductPrice(product);

    // Add item to cart
    addItem({
      product: productWithSellingPrice,
      quantity,
      color: selectedColor,
      size: selectedSize,
    });

    // Close modal
    onClose();

    // Redirect to checkout
    window.location.href = '/checkout';
  };

  // Decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Increase quantity
  const increaseQuantity = () => {
    const maxStock = selectedSize ? sizeStock[selectedSize] : 0;
    if (maxStock === 0) {
      toast.error('This size is out of stock');
      return;
    }
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Only ${maxStock} items available in stock`);
    }
  };

  // Image navigation functions
  const goToNextImage = () => {
    if (allProductImages.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === allProductImages.length - 1 ? 0 : prevIndex + 1
    );
    setCurrentImage(allProductImages[currentImageIndex === allProductImages.length - 1 ? 0 : currentImageIndex + 1]);
  };

  const goToPrevImage = () => {
    if (allProductImages.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? allProductImages.length - 1 : prevIndex - 1
    );
    setCurrentImage(allProductImages[currentImageIndex === 0 ? allProductImages.length - 1 : currentImageIndex - 1]);
  };

  // Touch event handlers for mobile swiping
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextImage();
    }

    if (isRightSwipe) {
      goToPrevImage();
    }
  };

  if (!isOpen || !product) return null;

  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

  const description =
    product.description ||
    'Premium quality t-shirt with a stylish design. Made from soft, comfortable fabric perfect for everyday wear.';

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Dark overlay with click to close */}
      <div className="fixed inset-0 bg-black/70" onClick={onClose}></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-0 sm:p-4 relative">
        <div
          ref={modalRef}
          className="bg-white w-full h-full sm:h-auto sm:rounded-lg sm:max-h-[90vh] md:max-h-[85vh] 
                    z-10 flex flex-col md:flex-row overflow-auto max-w-full sm:max-w-[95vw] md:max-w-5xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black z-20 bg-white rounded-full p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Image Section */}
          <div className="w-full md:w-1/2 bg-gray-50">
            {/* Image carousel container */}
            <div
              ref={carouselRef}
              className="relative w-full h-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Current image */}
              {currentImage && (
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Navigation arrows - hidden on mobile, visible on larger screens */}
              {allProductImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 
                              bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={goToNextImage}
                    className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 
                              bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter badge - like 4/15 */}
              {allProductImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1 text-xs font-medium shadow-md">
                  {currentImageIndex + 1}/{allProductImages.length}
                </div>
              )}

              {/* Discount Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-red-500 text-white text-xs font-medium py-1 px-3 rounded-full">
                  {product.discount}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-8 overflow-y-auto bg-white">
            <h2 className="text-xl md:text-2xl font-bold mb-2">{product.title}</h2>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl md:text-2xl font-semibold text-red-500">{product.salePrice}</span>
              <span className="text-gray-400 line-through text-sm md:text-base">{product.regularPrice}</span>
            </div>

            <p className="text-gray-600 mb-6 text-sm md:text-base">{description}</p>

            {/* Size Selection */}
            <div className="mb-5">
              <p className="font-medium mb-3 text-gray-700">Size: {selectedSize}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const isOutOfStock = sizeStock[size] === 0;
                  return (
                  <button
                    key={size}
                      className={`px-4 py-2 border text-sm font-medium rounded relative
                        ${selectedSize === size
                        ? 'border-black bg-black text-white'
                          : isOutOfStock
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                      onClick={() => !isOutOfStock && handleSizeSelect(size)}
                      disabled={isOutOfStock}
                  >
                    {size}
                      {isOutOfStock && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded">
                          Out of Stock
                        </span>
                      )}
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <p className="font-medium mb-3 text-gray-700">Color: {getColorName(selectedColor)}</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    className="relative"
                    onClick={() => handleColorSelect(color)}
                  >
                    <span
                      className={`block w-9 h-9 border border-gray-500 p-1 rounded-full 
                        ${selectedColor === color ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                      aria-label={getColorName(color)}
                      style={{ backgroundColor: color }}
                    ></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <ul className="space-y-3 text-sm">
                <li className="flex">
                  <span className="w-24 text-gray-500">Available:</span>
                  {selectedSize ? (
                    <span className={sizeStock[selectedSize] === 0 ? 'text-red-500' : 'text-green-500'}>
                      {sizeStock[selectedSize] === 0 ? 'Out of Stock' : `${sizeStock[selectedSize]} in stock`}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select a size to check availability</span>
                  )}
                </li>
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-5">
              <div className="flex items-center gap-2">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-200 rounded-full w-[140px] h-12">
                <button
                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black"
                  onClick={decreaseQuantity}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                </button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                <button
                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black"
                  onClick={increaseQuantity}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                </button>
              </div>

                {/* Wishlist and Compare */}
                <div className="flex gap-3 my-4">
                  <button className="w-12 h-12 border border-gray-200 rounded-full 
                                flex items-center justify-center hover:bg-gray-50">
                    <WishlistIcon product={ensureProductPrice(product)} size={20} />
                </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || sizeStock[selectedSize] === 0}
              className={`flex-1 py-4 w-full font-medium rounded-full transition-colors cursor-pointer
                ${!selectedSize || !selectedColor || sizeStock[selectedSize] === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
              {!selectedSize || !selectedColor
                ? 'Select Options'
                : sizeStock[selectedSize] === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'
              }
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={!selectedSize || !selectedColor || sizeStock[selectedSize] === 0}
              className={`w-full h-12 font-medium rounded-full transition-colors cursor-pointer mt-2
                ${!selectedSize || !selectedColor || sizeStock[selectedSize] === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
                }`}
            >
              {!selectedSize || !selectedColor
                ? 'Select Options'
                : sizeStock[selectedSize] === 0
                  ? 'Out of Stock'
                  : 'Buy it now'
              }
            </button>

            {/* View Full Details */}
            <Link href={`/product/${product.id}`}
              className="flex items-center text-black font-medium hover:text-gray-600 transition-colors">
              View Full Details <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
