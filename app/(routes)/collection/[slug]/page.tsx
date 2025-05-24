'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCollection from '@/components/ProductCollection';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // First, fetch the category by slug
        const categoryResponse = await fetch(`/api/categories?slug=${slug}`);
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category');
        }
        const categoryData = await categoryResponse.json();

        // If no category found, throw an error
        if (categoryData.length === 0) {
          throw new Error('Category not found');
        }

        const categoryId = categoryData[0].id;
        setCategory(categoryData[0]);

        // Then fetch products for this category
        const productsResponse = await fetch(`/api/products?category=${categoryId}`);
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();

        // Transform products to match Product type
        const formattedProducts: Product[] = productsData.map((product: any) => ({
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
        console.error('Error fetching category or products:', error);
        toast.error('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!category) {
    return <div className="text-center py-10">Collection not found</div>;
  }

  return (
    <ProductCollection
      page={category.name}
      title={category.name}
      description={category.description || ''}
      products={products}
      totalResults={totalResults}
    />
  );
}
