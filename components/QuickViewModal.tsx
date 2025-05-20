'use client';

import { useState, useEffect, useRef } from 'react';
import { products } from './ProductsSlider';
import { Product } from './ProductCollection';
import WishlistIcon from './WishlistIcon';
import useCart from '@/app/stores/useCart';
import { toast } from 'react-hot-toast';
import { ensureProductPrice } from '@/lib/priceUtils';
import { getColorClass, getColorName, getImageForColor } from '@/lib/colorUtils';
import Link from 'next/link';
import { Info } from 'lucide-react';

type QuickViewModalProps = {
  product: products | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    if (product) {
      if (product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
        // Use the utility function to get the image for the default color
        setCurrentImage(
          getImageForColor(product.colors[0], product.colorImages || {}, product.image)
        );
      }

      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product && selectedColor) {
      // Use the utility function to get the image for the selected color
      setCurrentImage(getImageForColor(selectedColor, product.colorImages || {}, product.image));
    }
  }, [selectedColor, product]);

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
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
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

  if (!isOpen || !product) return null;

  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

  const description =
    product.description ||
    'Premium quality t-shirt with a stylish design. Made from soft, comfortable fabric perfect for everyday wear.';

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Dark overlay with click to close */}
      <div className="fixed inset-0 bg-black opacity-80" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen p-4 relative">
        <div
          ref={modalRef}
          className="bg-white rounded-lg max-w-5xl w-full relative max-h-[75vh] z-10 flex flex-col md:flex-row overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black z-20"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Product Image - Full height and non-scrollable */}
          <div className="w-full md:w-1/2 h-full sticky top-0 left-0">
            {/* Discount Badge */}
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-red-500 text-white text-xs font-medium py-1 px-2 rounded">
                {product.discount}
              </div>
            </div>

            <div className="h-full">
              {currentImage && (
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          </div>

          {/* Product Details - Scrollable */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-[75vh]">
            <h2 className="text-2xl font-bold mb-2">{product.title}</h2>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl font-semibold text-red-500">{product.salePrice}</span>
              <span className="text-gray-400 line-through">{product.regularPrice}</span>
            </div>

            <p className="text-gray-600 mb-6">{description}</p>

            <div className="mb-6">
              <p className="font-medium mb-2">Size: {selectedSize}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded-4xl ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-500 bg-white'
                    }`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="font-medium mb-2">Color: {getColorName(selectedColor)}</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(color => (
                  <button key={color} className="relative" onClick={() => handleColorSelect(color)}>
                    <span
                      className={`block w-8 h-8 rounded-full ${getColorClass(color)} 
                        ${selectedColor === color ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                      aria-label={getColorName(color)}
                      style={{ backgroundColor: color }}
                    ></span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <div className="w-30 flex items-center border border-gray-300 rounded-4xl">
                <button
                  className="w-30 h-12 flex items-center justify-center"
                  onClick={decreaseQuantity}
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
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-full h-12 text-center border-none focus:outline-none"
                />
                <button
                  className="w-30 h-12 flex items-center justify-center"
                  onClick={increaseQuantity}
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
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-4xl cursor-pointer"
                >
                  Add to Cart
                </button>
                <div className="w-12 h-12 border border-gray-300 rounded-4xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <WishlistIcon product={ensureProductPrice(product)} size={20} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc ml-5 text-gray-600 space-y-1">
                <li>100% Cotton, premium quality</li>
                <li>Pre-shrunk fabric</li>
                <li>Relaxed fit</li>
                <li>Machine washable</li>
              </ul>
            </div>
            <Link href={`/product/${product.id}`} className="text-black font-medium mt-4 hover:text-gray-500 transition-colors flex items-center gap-0"  ><Info className='w-4 h-4 mr-2' /> View Details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
