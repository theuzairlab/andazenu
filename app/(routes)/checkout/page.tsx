'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useCart from '@/app/stores/useCart';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getColorName } from '@/lib/colorUtils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    saveInfo: false,
  });
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = getTotalPrice();
  const shipping = subtotal < 5000 ? 150 : 0;
  const total = subtotal + shipping;

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Apply discount code
  const handleApplyDiscount = () => {
    // In a real application, you would check the discount code against a database
    // For now, just show a message
    toast.error('Invalid discount code or expired');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          shipping,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Order created successfully
      clearCart(); // Clear the cart
      toast.success('Order placed successfully!');

      // Redirect to order confirmation page
      router.push(`/orders`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty, show empty cart message with link to continue shopping
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            href="/"
            className="bg-black text-white px-6 py-3 rounded-4xl font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column - Customer Information and Shipping */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email or mobile phone number"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-600">
                  Email me with news and offers
                </label>
              </div> */}
            </div>

            {/* Delivery Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Delivery</h2>

              <div className="mb-4">
                <select
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
                  defaultValue="Pakistan"
                >
                  <option value="Pakistan">Pakistan</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="First name"
                  className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal code (optional)"
                  className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="mb-4">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveInfo"
                  name="saveInfo"
                  checked={formData.saveInfo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="saveInfo" className="ml-2 block text-sm text-gray-600">
                  Save this information for next time
                </label>
              </div> */}
            </div>

            {/* Shipping Method */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Shipping method</h2>
              <div className="border border-gray-300 rounded p-4 flex justify-between items-center">
                <div className="font-medium">Standard</div>
                <div className="text-gray-600">Rs {shipping.toLocaleString()}</div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              <p className="text-sm text-gray-500 mb-4">
                All transactions are secure and encrypted.
              </p>

              <div className="border border-gray-300 rounded p-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    defaultChecked={true}
                    onChange={() => { }}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <label htmlFor="cod" className="ml-2 block font-medium text-gray-800">
                    Cash on Delivery (COD)
                  </label>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Billing address</h2>

              <div className="border border-gray-300 rounded p-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sameAsShipping"
                    name="billingAddress"
                    value="same"
                    defaultChecked={true}
                    onChange={() => { }}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <label htmlFor="sameAsShipping" className="ml-2 block font-medium text-gray-800">
                    Same as shipping address
                  </label>
                </div>
              </div>

              <div className="border border-gray-300 rounded p-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="differentBilling"
                    name="billingAddress"
                    value="different"
                    disabled
                    className="h-4 w-4 text-gray-400 focus:ring-black border-gray-300"
                  />
                  <label
                    htmlFor="differentBilling"
                    className="ml-2 block font-medium text-gray-400"
                  >
                    Use a different billing address
                  </label>
                </div>
              </div>
            </div>

            {/* Submit button (Mobile Only) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-6 rounded-4xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 lg:hidden"
            >
              {loading ? 'Processing...' : `Complete order - Rs ${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 p-6 rounded-lg">
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.color}-${item.size}-${index}`}
                  className="flex"
                >
                  <div className="relative">
                    <div className="bg-white w-20 h-20 border rounded overflow-hidden">
                      <img
                        src={item.product.colorImages?.[item.color] || item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="ml-4 flex-1 mt-[-8px]">
                    <h3 className="font-medium text-sm">{item.product.title}</h3>
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
                    <div className="font-medium">{item.product.salePrice}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="border-t border-b py-4 mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value)}
                  placeholder="Discount code"
                  className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  onClick={handleApplyDiscount}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-r"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal • {getTotalItems()} items</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `Rs ${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>Rs {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button (Desktop Only) */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="hidden lg:block w-full bg-black text-white py-3 px-6 rounded-4xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Complete order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
