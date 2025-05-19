'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FilterIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import WishlistIcon from './WishlistIcon';
import { getColorClass, getImageForColor } from '@/lib/colorUtils';
import { ensureProductPrice } from '@/lib/priceUtils';

export type Product = {
    id: string | number;
    title: string;
    image: string;
    salePrice: string;
    regularPrice: string;
    discount: string;
    colors: string[];
    colorImages?: Record<string, string>; // Added colorImages to store image URLs for each color
    sizes?: string[];
    description?: string;
    sellingPrice: number; // Numeric value for price calculations
};

export type ProductCollectionProps = {
    page: string;
    title: string;
    description: string;
    products: Product[];
    totalResults?: number;
};

export default function ProductCollection({
    page,
    title,
    description,
    products,
    totalResults
}: ProductCollectionProps) {
    const [selectedColors, setSelectedColors] = useState<Record<string | number, string>>({});
    const [productImages, setProductImages] = useState<Record<string | number, string>>({});
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [sortOption, setSortOption] = useState('Best selling');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sortOptions = [
        'Featured',
        'Best selling',
        'Alphabetically, A-Z',
        'Alphabetically, Z-A',
        'Price, low to high',
        'Price, high to low',
        'Date, old to new',
        'Date, new to old'
    ];

    // Initialize selected colors and product images
    useEffect(() => {
        const initialSelectedColors: Record<string | number, string> = {};
        const initialProductImages: Record<string | number, string> = {};
        
        products.forEach(product => {
            if (product.colors.length > 0) {
                const defaultColor = product.colors[0];
                initialSelectedColors[product.id] = defaultColor;
                
                // Use our utility function to get the image
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

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleColorSelect = (productId: string | number, color: string) => {
        setSelectedColors({
            ...selectedColors,
            [productId]: color
        });
        
        // Update product image based on selected color
        const product = products.find(p => p.id === productId);
        if (product) {
            // Use our utility function to get the image
            const imageUrl = getImageForColor(
                color,
                product.colorImages || {},
                product.image
            );
            
            setProductImages({
                ...productImages,
                [productId]: imageUrl
            });
        }
    };

    const openQuickView = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeQuickView = () => {
        setIsModalOpen(false);
    };

    // Render product based on view mode
    const renderProduct = (product: Product) => {
        if (viewMode === 'grid') {
            // Grid view product card
            return (
                <div key={product.id} className="relative">
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
                    <div className="w-full h-full bg-gray-200 overflow-hidden relative group cursor-pointer">
                      {productImages[product.id] && (
                        <img 
                          src={productImages[product.id] || product.image}
                          alt={product.title}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                        />
                      )}
                      
                      {/* Quick View Button - appears only on image hover */}
                      <div className="absolute bottom-0 left-0 right-0 py-3 px-4 opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition duration-300">
                        <button 
                          onClick={() => openQuickView(product)}
                          className="w-full bg-white text-black hover:bg-black hover:text-white shadow text-center text-sm font-medium py-4 rounded-4xl  transition-colors"
                        >
                          Select Options
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white flex flex-col justify-center items-center">
                      <Link href={`/products/${product.id}`} className="font-bold text-md mb-1 text-center hover:text-gray-500">{product.title}</Link>
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
                </div>
            );
        } else {
            // List view product card
            return (
                <div key={product.id} className="rounded overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Left: Product image */}
                        <div className="w-full md:w-[380px] relative">
                            {/* Discount badge */}
                            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-medium py-1 px-2 rounded">
                                {product.discount}
                            </div>
                            
                            <div className="relative overflow-hidden rounded-xl group">
                                {productImages[product.id] && (
                                    <img
                                        src={productImages[product.id] || product.image}
                                        alt={product.title}
                                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right: Product details */}
                        <div className="flex-1 p-6 flex flex-col justify-center">
                            <div>
                                <Link href={`/products/${product.id}`} className="">
                                    <h3 className="font-medium text-xl mb-2 hover:text-blue-400 transition-colors">{product.title}</h3>
                                </Link>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="font-semibold text-lg">{product.salePrice}</span>
                                    <span className="text-gray-500 line-through text-sm">{product.regularPrice}</span>
                                </div>
                            </div>

                            <div className="">
                                {/* Color options as radio buttons */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {product.colors.map((color, i) => (
                                        <label key={i} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`color-list-${product.id}`}
                                                value={color}
                                                checked={selectedColors[product.id] === color}
                                                onChange={() => handleColorSelect(product.id, color)}
                                                className="sr-only" // Hide the actual radio input
                                            />
                                            <span
                                                className={`block w-5 h-5 rounded-full ${getColorClass(color)} transition-all duration-200 
                                                ${selectedColors[product.id] === color ? 'ring-1 ring-offset-1 ring-black' : ''}`}
                                                aria-label={color}
                                            ></span>
                                        </label>
                                    ))}
                                </div>

                                {/* Add to wishlist button */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openQuickView(product)}
                                        className="flex items-center justify-center px-8 py-3 border border-gray-300 rounded-4xl hover:bg-black hover:text-white transition-colors"
                                    >
                                        <span>Select Options</span>
                                    </button>
                                    <button 
                                        className=" w-13 h-13 flex items-center justify-center border border-gray-300 rounded-full bg-white hover:bg-black hover:text-white transition-colors"
                                        aria-label="Add to wishlist"
                                    >
                                        <WishlistIcon product={ensureProductPrice(product)} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <section className="py-10 bg-white w-full">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-black">
                <div className="max-w-[1400px] mx-auto px-4 text-sm breadcrumbs flex justify-center items-center mb-6">
                    <ul className="flex items-center space-x-2">
                        <li><a href="/" className="text-gray-500 hover:text-black">Home</a></li>
                        <li className="before:content-['>'] before:mx-2 before:text-gray-400">{page}</li>
                    </ul>
                </div>
                <h1 className="text-center text-4xl font-bold mb-2">{title}</h1>
                <p className="text-center text-gray-600 mb-10">{description}</p>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'} border border-gray-300 rounded-sm transition-colors`}
                            aria-label="Grid view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'} border border-gray-300 rounded-sm transition-colors`}
                            aria-label="List view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>
                        
                        <button className="p-2 border border-gray-300 rounded-sm hidden md:flex items-center gap-1">
                            <FilterIcon size={16} />
                            <span className="text-sm">Filter</span>
                        </button>
                    </div>
                    
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1 text-sm border border-gray-300 rounded-sm p-2"
                        >
                            <span>Sort: {sortOption}</span>
                            {isDropdownOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 w-52">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortOption === option ? 'font-medium bg-gray-50' : ''}`}
                                        onClick={() => {
                                            setSortOption(option);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mt-6">
                    {/* Product Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {products.map(product => renderProduct(product))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {products.map(product => renderProduct(product))}
                        </div>
                    )}
                    
                    {products.length === 0 && (
                        <div className="text-center py-20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7h16M4 11h16M4 15h8" />
                            </svg>
                            <h3 className="mt-4 text-xl font-medium text-gray-800">No products found</h3>
                            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </div>
                
                {totalResults && totalResults > 0 && (
                    <div className="flex justify-between items-center mt-10 border-t border-gray-200 pt-6">
                        <div className="text-sm text-gray-600">
                            Showing {products.length} of {totalResults} products
                        </div>
                        
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                                Previous
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-black text-white">
                                1
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                                2
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Quick View Modal */}
            <QuickViewModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={closeQuickView}
            />
        </section>
    );
} 