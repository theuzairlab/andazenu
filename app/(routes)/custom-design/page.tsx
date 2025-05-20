'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Minus, Upload, ChevronLeft, ChevronRight, Share } from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';

// Available shirt colors
const colors = [
  { id: 1, name: 'Black', value: 'black', class: 'bg-black border-black' },
  { id: 2, name: 'Olive Green', value: 'olive', class: 'bg-green-700 border-green-700' },
  { id: 3, name: 'Navy', value: 'navy', class: 'bg-indigo-900 border-indigo-900' },
  { id: 4, name: 'Mustard', value: 'mustard', class: 'bg-yellow-500 border-yellow-500' },
  { id: 5, name: 'Maroon', value: 'maroon', class: 'bg-red-800 border-red-800' },
  { id: 6, name: 'White', value: 'white', class: 'bg-white border-gray-300' },
  { id: 7, name: 'Sky Blue', value: 'sky-blue', class: 'bg-sky-400 border-sky-400' },
  { id: 8, name: 'Red', value: 'red', class: 'bg-red-600 border-red-600' },
  { id: 9, name: 'Petroleum Blue', value: 'petroleum-blue', class: 'bg-blue-800 border-blue-800' },
  { id: 10, name: 'Charcoal Gray', value: 'gray', class: 'bg-gray-500 border-gray-500' },
];

// Shirt thumbnails for the left sidebar
const shirtThumbnails = [
  {
    id: 1,
    color: 'Black',
    image: 'https://herotag.pk/cdn/shop/files/black_25fb3c11-9519-441d-8051-78b21f64efa8.jpg',
  },
  {
    id: 2,
    color: 'Green',
    image: 'https://herotag.pk/cdn/shop/files/olive_9e14a57d-4fad-4cef-9f9e-4c71c3ad1381.jpg',
  },
  {
    id: 3,
    color: 'Navy',
    image: 'https://herotag.pk/cdn/shop/files/navy_2241fe84-efa8-41b0-901c-78d0e532fab2.jpg',
  },
  {
    id: 4,
    color: 'Mustard',
    image: 'https://herotag.pk/cdn/shop/files/mustard_a9a93a11-72bf-4b80-b25b-d24ec3c34c01.jpg',
  },
  {
    id: 5,
    color: 'Maroon',
    image: 'https://herotag.pk/cdn/shop/files/maroon_db75ec18-5b8d-4fa0-b122-fc86f04be0e6.jpg',
  },
  {
    id: 6,
    color: 'White',
    image: 'https://herotag.pk/cdn/shop/files/white_b6f04254-e81d-4b12-b8fd-4ddb42d1ff1e.jpg',
  },
  {
    id: 7,
    color: 'Sky Blue',
    image: 'https://herotag.pk/cdn/shop/files/sky-blue_8afb1b13-1ddf-4c09-a86c-20c9fcee582f.jpg',
  },
  {
    id: 8,
    color: 'Red',
    image: 'https://herotag.pk/cdn/shop/files/red_c2c9b887-dbd3-4b17-a1f7-48de5de99e48.jpg',
  },
];

// Related products for People Also Bought section
const relatedProducts = [
  {
    id: 1,
    name: 'Imagine T-Shirt',
    image:
      'https://herotag.pk/cdn/shop/files/imagine-t-shirt-black-500x500-herotag_5ff3b47c-75a9-4dbe-a888-8c0337c93926.jpg',
    price: 1395,
    originalPrice: 2195,
    discount: 36,
  },
  {
    id: 2,
    name: 'Original T-Shirt',
    image:
      'https://herotag.pk/cdn/shop/files/original-t-shirt-white-500x500-herotag_79e20e01-ba6d-4f8d-b9a9-04fa86e2fbc4.jpg',
    price: 1395,
    originalPrice: 2195,
    discount: 36,
  },
  {
    id: 3,
    name: 'Perfection T-Shirt',
    image:
      'https://herotag.pk/cdn/shop/files/perfection-t-shirt-black-500x500-herotag_6eb7dee4-5c7b-45ea-8d5d-a90ed15e02d6.jpg',
    price: 1395,
    originalPrice: 2195,
    discount: 36,
  },
  {
    id: 4,
    name: 'The Tempt for Greatness T-Shirt',
    image:
      'https://herotag.pk/cdn/shop/files/tempt-for-greatness-t-shirt-black-500x500-herotag_a4736d89-caf5-4ae9-bb5d-87e41169f5ff.jpg',
    price: 1395,
    originalPrice: 2195,
    discount: 36,
  },
];

const sizes = ['Small', 'Medium', 'Large', 'X-Large', '2X-Large'];

export default function CustomDesignPage() {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [customText, setCustomText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(shirtThumbnails[2]); // Navy as default
  const [mainImage, setMainImage] = useState(shirtThumbnails[2].image);

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity(quantity + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleThumbnailClick = (thumbnail: (typeof shirtThumbnails)[0]) => {
    setSelectedThumbnail(thumbnail);
    setMainImage(thumbnail.image);
  };

  return (
    <ClientOnly>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-700">Men's Custom Design T-Shirt</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Product Images with Thumbnails */}
          <div className="lg:w-1/2">
            <div className="flex flex-row gap-4">
              {/* Thumbnails */}
              <div className="w-20 flex flex-col gap-3">
                {shirtThumbnails.map(thumbnail => (
                  <div
                    key={thumbnail.id}
                    className={`border ${selectedThumbnail.id === thumbnail.id ? 'border-blue-500' : 'border-gray-200'} cursor-pointer`}
                    onClick={() => handleThumbnailClick(thumbnail)}
                  >
                    <Image
                      src={thumbnail.image}
                      alt={`${thumbnail.color} T-Shirt`}
                      width={80}
                      height={80}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1">
                <div className="aspect-square rounded-lg overflow-hidden relative">
                  <Image
                    src={mainImage}
                    alt="Custom Design T-Shirt"
                    width={800}
                    height={800}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-medium py-1 px-2 rounded">
                    -56%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Men's Custom Design T-Shirt</h1>
            <div className="flex items-center gap-1 mb-4">
              <div className="flex items-center text-gray-400">
                <span className="text-sm">No reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-gray-800">Rs.1,295.00</span>
              <span className="text-gray-500 line-through text-lg">Rs.2,950.00</span>
            </div>

            <div className="border-t border-gray-200 py-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Custom Design</h2>
              <p className="text-gray-600 mb-4">
                Add your name, note or upload your customized idea image to personalise your item.
                Custom items cannot be returned or exchanged.
              </p>

              {/* Text Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Text (Optional)
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="Enter your custom text here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">Design File</label>
                <div className="relative">
                  <input
                    type="file"
                    id="design-file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <label
                    htmlFor="design-file"
                    className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500"
                  >
                    <Upload className="h-5 w-5 mr-2 text-gray-600" />
                    {file ? file.name : 'Upload your design file'}
                  </label>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="border-t border-gray-200 py-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Size: {selectedSize}
                </label>
                <button
                  className="text-sm text-blue-600 underline"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                >
                  Size guide
                </button>
              </div>

              {showSizeGuide && (
                <div className="mb-4 p-4 border border-gray-200 rounded-md">
                  <h3 className="text-sm font-bold mb-2 text-gray-700">Men's T-Shirt Sizes</h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 text-gray-700">Sizes</th>
                        <th className="text-left py-1 text-gray-700">Length</th>
                        <th className="text-left py-1 text-gray-700">Chest</th>
                        <th className="text-left py-1 text-gray-700">Sleeves</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1 font-medium text-gray-700">Small</td>
                        <td className="py-1 text-gray-600">26 in</td>
                        <td className="py-1 text-gray-600">18 in</td>
                        <td className="py-1 text-gray-600">6 in</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 font-medium text-gray-700">Medium</td>
                        <td className="py-1 text-gray-600">27 in</td>
                        <td className="py-1 text-gray-600">20 in</td>
                        <td className="py-1 text-gray-600">7 in</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 font-medium text-gray-700">Large</td>
                        <td className="py-1 text-gray-600">28 in</td>
                        <td className="py-1 text-gray-600">21 in</td>
                        <td className="py-1 text-gray-600">8 in</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 font-medium text-gray-700">X-Large</td>
                        <td className="py-1 text-gray-600">29 in</td>
                        <td className="py-1 text-gray-600">22 in</td>
                        <td className="py-1 text-gray-600">9 in</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium text-gray-700">2X-Large</td>
                        <td className="py-1 text-gray-600">30 in</td>
                        <td className="py-1 text-gray-600">23 in</td>
                        <td className="py-1 text-gray-600">10 in</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`px-4 py-2 border text-sm font-medium ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="border-t border-gray-200 py-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Color: {selectedColor.name}
              </label>
              <div className="flex flex-wrap gap-3 mb-6">
                {colors.map(color => (
                  <button
                    key={color.id}
                    className={`w-8 h-8 rounded-full ${color.class} ${
                      selectedColor.id === color.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color.name}
                  ></button>
                ))}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="border-t border-gray-200 py-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    className="p-2 border-r border-gray-300 hover:bg-gray-50"
                    onClick={() => handleQuantityChange('decrement')}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="w-12 text-center text-gray-700">{quantity}</span>
                  <button
                    className="p-2 border-l border-gray-300 hover:bg-gray-50"
                    onClick={() => handleQuantityChange('increment')}
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
                <button className="p-3 border border-gray-300 hover:border-blue-300 transition-colors">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t border-gray-200 py-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-700">Estimated delivery:</span>
                <span className="font-bold text-gray-700">2-5 days</span>
                <span>across Pakistan.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Free shipping:</span>
                <span className="font-bold text-gray-700">On all orders over Rs. 5,000.</span>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="border-t border-gray-200 pt-4 mt-4 flex items-center gap-3">
              <button className="flex items-center text-gray-600 hover:text-blue-600">
                <Share className="h-4 w-4 mr-1" />
                <span className="text-sm">Share</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600">
                <span className="text-sm">Ask a question</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
