'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCollection from '@/components/ProductCollection';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setTotalResults(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch search results from API
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const searchResults = await response.json();

        // Transform products to match Product type
        const formattedProducts: Product[] = searchResults.map((product: any) => ({
          id: product.id,
          title: product.name,
          image: product.productColors.length > 0 ? product.productColors[0].imageUrl : '',
          salePrice: `Rs.${product.sellingPrice.toLocaleString()}`,
          regularPrice: `Rs.${product.regularPrice.toLocaleString()}`,
          discount: product.discount ? `-${product.discount}%` : '',
          colors: product.productColors.map((colorObj: any) => colorObj.color),
          colorImages: product.productColors.reduce((acc: any, colorObj: any) => {
            acc[colorObj.color] = colorObj.imageUrl;
            return acc;
          }, {}),
          sizes: product.productSizes.map((sizeObj: any) => sizeObj.size),
          description: product.description || '',
          sellingPrice: product.sellingPrice,
        }));

        setProducts(formattedProducts);
        setTotalResults(formattedProducts.length);
      } catch (error) {
        console.error('Error fetching search results:', error);
        toast.error('Failed to load search results');
        setProducts([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ProductCollection
      page="Search Results"
      title={`Search Results for "${query}"`}
      description={`${totalResults} product${totalResults !== 1 ? 's' : ''} found`}
      products={products}
      totalResults={totalResults}
    />
  );
}
