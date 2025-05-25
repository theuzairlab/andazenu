'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import useCart from '@/app/stores/useCart';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { getColorName } from '@/lib/colorUtils';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalItems, getTotalPrice } =
    useCart();

  const cartRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close cart
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeCart]);

  // Handle escape key to close cart
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closeCart]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle quantity updates with stock validation
  const handleQuantityChange = (
    productId: string | number,
    color: string,
    size: string,
    quantity: number,
    availableStock: number
  ) => {
    if (quantity < 1) return; // Don't allow quantities less than 1
    
    // Check if requested quantity exceeds available stock
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }
    
    updateQuantity(productId, color, size, quantity);
  };

  // Format price with Rs prefix
  const formatRupees = (amount: number) => {
    return `Rs.${amount.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 transition-opacity flex justify-end"
      aria-modal="true"
      role="dialog"
      aria-label="Shopping Cart"
    >
      <div
        ref={cartRef}
        className="bg-white w-full max-w-md h-full flex flex-col shadow-xl transform transition-transform duration-300"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Cart header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Shopping Cart ({getTotalItems()})</h2>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-black transition-colors"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart content */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div className="w-24 h-24 text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium">Your cart is currently empty!</h3>
              <p className="text-gray-500">
                You may check out all the available products and buy some.
              </p>
              <button
                onClick={closeCart}
                className="mt-4 bg-black text-white py-3 px-6 rounded-3xl font-medium hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                // Get available stock for this item's size
                const availableStock = item.product.productSizes?.find(
                  s => s.size === item.size
                )?.stock || 0;

                return (
                  <div
                    key={`${item.product.id}-${item.color}-${item.size}-${index}`}
                    className="flex border-b pb-4"
                  >
                    {/* Product image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.product.colorImages?.[item.color] || item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Product details */}
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm">{item.product.title}</h3>
                        <button
                          onClick={() => removeItem(item.product.id, item.color, item.size)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <span className="font-semibold">Color: </span>
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        {getColorName(item.color)}
                      </div>

                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <span className="font-semibold">Size: </span> {item.size}
                      </div>

                      {/* Stock information */}
                      <div className="text-sm mt-1">
                        <span className={availableStock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {availableStock} in stock
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Quantity selector */}
                        <div className="flex items-center border rounded-3xl">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.color,
                                item.size,
                                item.quantity - 1,
                                availableStock
                              )
                            }
                            className={`w-8 h-8 flex items-center justify-center ${
                              item.quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-black'
                            }`}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.color,
                                item.size,
                                item.quantity + 1,
                                availableStock
                              )
                            }
                            className={`w-8 h-8 flex items-center justify-center ${
                              item.quantity >= availableStock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-black'
                            }`}
                            disabled={item.quantity >= availableStock}
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="font-medium">
                          {formatRupees(
                            typeof item.product.sellingPrice === 'number'
                              ? item.product.sellingPrice * item.quantity
                              : parseInt(item.product.salePrice.replace(/[^0-9]/g, ''), 10) *
                                  item.quantity
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Free shipping progress */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.51 2.83002H8.49C6 2.83002 5.45 4.07002 5.13 5.59002L4 11H20L18.87 5.59002C18.55 4.07002 18 2.83002 15.51 2.83002Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.52 13.57C2.52 14.62 3.37 15.47 4.42 15.47H5.58C5.58 16.8 6.65 17.87 7.98 17.87C9.31 17.87 10.38 16.8 10.38 15.47H13.62C13.62 16.8 14.69 17.87 16.02 17.87C17.35 17.87 18.42 16.8 18.42 15.47H19.58C20.63 15.47 21.48 14.62 21.48 13.57V11H4V13.57H2.52Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 21C9.10457 21 10 20.1046 10 19C10 17.8954 9.10457 17 8 17C6.89543 17 6 17.8954 6 19C6 20.1046 6.89543 21 8 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 21C17.1046 21 18 20.1046 18 19C18 17.8954 17.1046 17 16 17C14.8954 17 14 17.8954 14 19C14 20.1046 14.8954 21 16 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 12V15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12V15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  Spend {formatRupees(Math.max(0, 5000 - getTotalPrice()))} more to enjoy Free
                  shipping!
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (getTotalPrice() / 5000) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatRupees(getTotalPrice())}</span>
            </div>

            {/* Shipping note */}
            <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>

            {/* Checkout button */}
            <Link
              href="/checkout"
              className="w-full bg-black text-white py-3 px-4 rounded-3xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              onClick={closeCart}
            >
              Proceed to Checkout
            </Link>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              className="w-full text-black py-3 px-4 border border-black rounded-3xl font-medium hover:bg-gray-100 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
