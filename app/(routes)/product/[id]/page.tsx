'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import WishlistIcon from '@/components/WishlistIcon';
import useWishlist from '@/app/stores/useWishlist';
import { Product } from '@/types/product';
import ProductsSlider from '@/components/ProductsSlider';
import { ChevronDown, ChevronUp, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import useCart from '@/app/stores/useCart';
import {
  getColorName,
  getColorClass,
  createColorImageMap,
  getImageForColor,
} from '@/lib/colorUtils';

type DetailedProduct = Product & {
  sku?: string;
  vendor?: string;
  collections?: string[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // Ensure id is a string
  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImage, setCurrentImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [expandedSection, setExpandedSection] = useState('description');
  const [colorSwatchSelected, setColorSwatchSelected] = useState<Record<string, boolean>>({});
  const { addItem, openCart } = useCart();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const productData = await response.json();

        // Create color-to-image mapping using our utility function
        const colorImageMap = createColorImageMap(productData.productColors);

        // Format product for display
        const formattedProduct = {
          id: productData.id,
          title: productData.name,
          image: productData.productColors[0]?.imageUrl || '',
          salePrice: `Rs.${productData.sellingPrice.toLocaleString()}`,
          regularPrice: `Rs.${productData.regularPrice.toLocaleString()}`,
          sellingPrice: productData.sellingPrice,
          discount: `-${Math.round(((productData.regularPrice - productData.sellingPrice) / productData.regularPrice) * 100)}%`,
          colors: productData.productColors.map((color: any) => color.color),
          colorImages: colorImageMap,
          sizes: productData.productSizes.map((size: any) => size.size),
          description: productData.description || '',
          stock: productData.stock || 0,
          productSizes: productData.productSizes.map((size: any) => ({
            size: size.size,
            stock: size.stock || 0
          })),
          // Additional fields for DetailedProduct
          sku: `HTK-TRH-${Math.floor(1000 + Math.random() * 9000)}`,
          vendor: 'Andaze E Nu',
          collections: [productData?.category?.name],
        };

        setProduct(formattedProduct);

        // Print the mapping for debugging
        console.log('Color to Image mapping:', colorImageMap);

        // Set initial selections
        if (formattedProduct.colors.length > 0) {
          const firstColor = formattedProduct.colors[0];
          setSelectedColor(firstColor);

          // Use our utility function to get the image for this color
          const initialImage = getImageForColor(
            firstColor,
            formattedProduct.colorImages,
            formattedProduct.image
          );
          setCurrentImage(initialImage);

          const initialColorState: Record<string, boolean> = {};
          formattedProduct.colors.forEach((color: string) => {
            initialColorState[color] = color === firstColor;
          });
          setColorSwatchSelected(initialColorState);
        }

        if (formattedProduct.sizes.length > 0) {
          setSelectedSize(formattedProduct.sizes[0]);
        }

        // Fetch related products
        fetchRelatedProducts(productData.collection);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch related products
  const fetchRelatedProducts = async (collection: string) => {
    try {
      const response = await fetch(`/api/products?collection=${collection}`);
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }

      const data = await response.json();

      // Format related products
      const formattedProducts = data.slice(0, 4).map((product: any) => {
        // Create color-to-image mapping using our utility function
        const colorImageMap = createColorImageMap(product.productColors);

        // Ensure we have sizes array
        const sizes = product.productSizes?.map((size: any) => size.size) || ['S', 'M', 'L', 'XL'];
        const productSizes = product.productSizes?.map((size: any) => ({
          size: size.size,
          stock: size.stock || 0
        })) || sizes.map(size => ({ size, stock: 0 }));

        return {
          id: product.id,
          title: product.name,
          image: product.productColors[0]?.imageUrl || '',
          salePrice: `Rs.${product.sellingPrice.toLocaleString()}`,
          regularPrice: `Rs.${product.regularPrice.toLocaleString()}`,
          sellingPrice: product.sellingPrice,
          discount: `-${Math.round(((product.regularPrice - product.sellingPrice) / product.regularPrice) * 100)}%`,
          colors: product.productColors.map((color: any) => color.color),
          colorImages: colorImageMap,
          sizes: sizes,
          description: product.description || '',
          stock: product.stock || 0,
          productSizes: productSizes
        };
      });

      setRelatedProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
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

    // Add item to cart
    addItem({
      product: product as any, // Type assertion to fix type issue
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    });

    // Show success message
    toast.success(`${product.title} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    // Add item to cart
    addItem({
      product,
      quantity,
      color: selectedColor,
      size: selectedSize,
    });

    // Redirect to checkout
    window.location.href = '/checkout';
  };

  // Handle color selection - using our utility function for image mapping
  const handleColorSelect = (color: string) => {
    console.log(`Color selected: ${color}`);
    setSelectedColor(color);

    if (product) {
      // Use the utility function to get the correct image for this color
      const imageUrl = getImageForColor(color, product.colorImages || {}, product.image);
      setCurrentImage(imageUrl);
    }

    // Update color swatch selection state
    const newColorState: Record<string, boolean> = {};
    Object.keys(colorSwatchSelected).forEach((c: string) => {
      newColorState[c] = c === color;
    });
    setColorSwatchSelected(newColorState);
  };

  // Decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p className="mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-[1400px] mx-auto px-4">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2">&bull;</span>
          <span className="text-black">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Product Images */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-4">
              <div className="flex gap-4">
                {/* Thumbnails */}
                <div className="hidden md:flex flex-col gap-2">
                  {Object.entries(product.colorImages || {}).map(([color, imageUrl], index) => (
                    <button
                      key={index}
                      className={`w-12 h-auto rounded-md border overflow-hidden ${selectedColor === color ? 'border-black' : 'border-gray-200'}`}
                      onClick={() => handleColorSelect(color)}
                      aria-label={`View ${product.title} in ${getColorName(color)}`}
                    >
                      <img
                        src={imageUrl as string}
                        alt={`${product.title} in ${getColorName(color)}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-1 relative">
                  {/* Discount badge */}
                  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-medium py-1 px-2 rounded">
                    {product.discount}
                  </div>

                  <div className="overflow-hidden">
                    <img
                      src={currentImage}
                      alt={product.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2">
            <div className="pb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.title}</h1>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-semibold text-red-500">{product.salePrice}</span>
                <span className="text-gray-400 line-through">{product.regularPrice}</span>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                {/* <div className="flex items-center gap-4 mb-2">
                  <span className="font-medium">Size: {selectedSize}</span>
                  <Link href="#" className="text-sm text-gray-500 underline hover:text-black">
                    Size guide
                  </Link>
                </div> */}

                <div className="flex flex-wrap gap-2">
                  {product.sizes &&
                    product.sizes.map(size => (
                      <button
                        key={size}
                        className={`px-4 py-2 border text-sm rounded-4xl ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-gray-500 bg-white'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <p className="font-medium mb-2">Color: {getColorName(selectedColor)}</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors &&
                    product.colors.map(color => (
                      <button
                        key={color}
                        className="relative"
                        onClick={() => handleColorSelect(color)}
                        aria-label={`Select ${getColorName(color)} color`}
                      >
                        <span
                          className={`block w-8 h-8 border border-gray-500 p-1 rounded-full 
                                                ${colorSwatchSelected[color] ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                          style={{ backgroundColor: color }}
                        ></span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-3 flex items-center border border-gray-300 rounded-4xl">
                  <button
                    className="w-28 h-12 flex items-center justify-center"
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
                    className="w-28 h-12 flex items-center justify-center"
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

                <button
                  onClick={handleAddToCart}
                  className="col-span-8 h-12 bg-black text-white font-medium hover:bg-gray-800 transition-colors rounded-4xl cursor-pointer"
                >
                  Add to Cart
                </button>

                <div className="w-12 h-12 border border-gray-300 rounded-4xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                  {product && <WishlistIcon product={product} size={20} />}
                </div>
              </div>

              <button 
                onClick={handleBuyNow}
                className="w-full h-12 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors mb-8 rounded-4xl"
              >
                Buy it now
              </button>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex">
                    <span className="w-24 text-gray-500">Available:</span>
                    <span>Instock</span>
                  </li>
                  <li className="flex">
                    <span className="w-24 text-gray-500">Vendor:</span>
                    <span>{product.vendor}</span>
                  </li>
                  <li className="flex">
                    <span className="w-24 text-gray-500">Collection:</span>
                    <span>{product.collections && product.collections[0]}</span>
                  </li>
                </ul>
              </div>

              {/* Accordions */}
              <div className="space-y-2">
                {/* Description Accordion */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <button
                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSection('description')}
                  >
                    <span className="font-medium">Description</span>
                    {expandedSection === 'description' ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {expandedSection === 'description' && (
                    <div className="p-4 bg-white">
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  )}
                </div>

                {/* Shipping Accordion */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <button
                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSection('shipping')}
                  >
                    <span className="font-medium">Shipping</span>
                    {expandedSection === 'shipping' ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {expandedSection === 'shipping' && (
                    <div className="p-4 bg-white">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <Truck size={16} className="mr-2 mt-0.5" />
                          <span>Free shipping on orders over Rs.1000</span>
                        </li>
                        <li className="flex items-start">
                          <Package size={16} className="mr-2 mt-0.5" />
                          <span>Deliveries typically arrive within 3-5 business days</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-16">
            <ProductsSlider
              title="You may also like"
              description="Customers who bought this item also purchased"
              products={relatedProducts}
              viewAllPageLink="/collection/all-collections"
            />
          </div>
        )}
      </div>
    </div>
  );
}
