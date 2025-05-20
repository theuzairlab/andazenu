'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ColorPicker from './ColorPicker';
import SizeManager from './SizeManager';
import { uploadImage } from '@/lib/imagekit';
import { priceToNumber, parsePrice, calculateDiscountPercentage } from '@/lib/priceUtils';

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

// Define Category interface
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [regularPrice, setRegularPrice] = useState(
    initialData?.regularPrice ? priceToNumber(initialData.regularPrice).toString() : ''
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialData?.sellingPrice ? priceToNumber(initialData.sellingPrice).toString() : ''
  );
  const [discount, setDiscount] = useState(
    initialData?.discount ? priceToNumber(initialData.discount).toString() : ''
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [stock, setStock] = useState(initialData?.stock || 0);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Complex fields
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories');

      if (!response.ok) {
        throw new Error('Failed to load categories');
      }

      const data = await response.json();
      setCategories(data);

      // If editing and we have a categoryId, use it
      // Otherwise if creating new product and we have categories, use the first one
      if (!isEditing && data.length > 0 && !categoryId) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load initial data for complex fields
  useEffect(() => {
    if (initialData) {
      // Load colors
      if (initialData.productColors && initialData.productColors.length > 0) {
        setColors(
          initialData.productColors.map((c: any) => ({
            id: c.id,
            color: c.color,
            imageUrl: c.imageUrl,
          }))
        );
      }

      // Load sizes
      if (initialData.productSizes && initialData.productSizes.length > 0) {
        setSizes(
          initialData.productSizes.map((s: any) => ({
            id: s.id,
            size: s.size,
            stock: s.stock,
          }))
        );
      }
    }
  }, [initialData]);

  // Calculate discount automatically based on regular and selling price
  useEffect(() => {
    if (regularPrice && sellingPrice) {
      const regular = priceToNumber(regularPrice);
      const selling = priceToNumber(sellingPrice);

      if (regular > 0 && selling > 0 && regular > selling) {
        const discountValue = calculateDiscountPercentage(regular, selling);
        setDiscount(discountValue.toString());
      } else {
        setDiscount('');
      }
    }
  }, [regularPrice, sellingPrice]);

  // Handle stock change safely
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Set as empty string when input is empty, otherwise parse as integer
    const numValue = value === '' ? 0 : parseInt(value);
    setStock(isNaN(numValue) ? 0 : numValue);
  };

  // Handle price change with validation
  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;

    // Allow empty value or numbers with up to one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Validate form
      if (!name || !description || !regularPrice || !sellingPrice || !categoryId) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (colors.length === 0) {
        toast.error('Please add at least one color variant');
        setIsLoading(false);
        return;
      }

      if (sizes.length === 0) {
        toast.error('Please add at least one size');
        setIsLoading(false);
        return;
      }

      // Upload any new images to ImageKit
      const updatedColors = await Promise.all(
        colors.map(async color => {
          // If color has a file, upload it
          if (color.file) {
            try {
              const fileName = `${name.replace(/\s+/g, '-').toLowerCase()}-${color.color.replace('#', '')}-${Date.now()}`;
              const imageUrl = await uploadImage(color.file, fileName);

              return {
                ...color,
                imageUrl,
              };
            } catch (error) {
              console.error('Error uploading image:', error);
              // Use a placeholder image if upload fails
              return {
                ...color,
                imageUrl:
                  color.imageUrl || 'https://via.placeholder.com/400x400?text=Image+Upload+Failed',
              };
            }
          }

          return color;
        })
      );

      // Prepare data for API
      const productData = {
        name,
        description,
        regularPrice: parsePrice(regularPrice),
        sellingPrice: parsePrice(sellingPrice),
        discount: discount ? parsePrice(discount) : null,
        categoryId,
        stock: parseInt(stock.toString()),
        colors: updatedColors.map(color => ({
          id: color.id,
          color: color.color,
          imageUrl: color.imageUrl,
        })),
        sizes: sizes.map(size => ({
          id: size.id,
          size: size.size,
          stock: parseInt(size.stock.toString()),
        })),
      };

      // Call API to create or update product
      const url = isEditing ? `/api/products/${initialData.id}` : '/api/products';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save product');
      }

      toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-medium mb-6">Basic Information</h2>

        {/* Product Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            required
          ></textarea>
        </div>

        {/* Collection/Category */}
        <div className="mb-4">
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Collection *
          </label>
          {loadingCategories ? (
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="animate-spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading collections...
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col">
              <span className="text-sm text-red-500 mb-2">
                No collections found. Please create a collection first.
              </span>
              <a href="/admin/categories" className="text-sm text-blue-500 hover:text-blue-700">
                Go to Collection Management
              </a>
            </div>
          ) : (
            <select
              id="categoryId"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            >
              <option value="">Select a Collection</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">Select the collection this product belongs to</p>
            <a href="/admin/categories" className="text-xs text-blue-500 hover:text-blue-700">
              Manage Collections
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-medium mb-6">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Regular Price */}
          <div>
            <label htmlFor="regularPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Regular Price *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                Rs.
              </span>
              <input
                type="text"
                id="regularPrice"
                value={regularPrice}
                onChange={e => handlePriceChange(e, setRegularPrice)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                Rs.
              </span>
              <input
                type="text"
                id="sellingPrice"
                value={sellingPrice}
                onChange={e => handlePriceChange(e, setSellingPrice)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <div className="relative">
              <input
                type="text"
                id="discount"
                value={discount}
                onChange={e => handlePriceChange(e, setDiscount)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Auto-calculated"
                disabled
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                %
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Automatically calculated from prices</p>
          </div>
        </div>

        {/* Stock */}
        <div className="mt-4">
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Total Stock *
          </label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={handleStockChange}
            min={0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be distributed across sizes in the next section
          </p>
        </div>
      </div>

      {/* Color Variants */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-medium mb-6">Color Variants</h2>
        <ColorPicker colors={colors} setColors={setColors} />
      </div>

      {/* Size Options */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-medium mb-6">Size Options</h2>
        <SizeManager sizes={sizes} setSizes={setSizes} totalStock={stock} />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
