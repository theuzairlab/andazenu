'use client';

import { useState, useEffect } from 'react';
import ClientOnly from '@/components/ClientOnly';
import ProductCollection, { Product } from '@/components/ProductCollection';
import { createColorImageMap } from '@/lib/colorUtils';

export default function AllCollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all products without any category filter
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setTotalResults(data.length);

        // Transform the data to match the Product type
        const formattedProducts = data.map((product: any) => {
          // Calculate discount percentage
          const discount =
            product.discount ||
            Math.round(
              ((product.regularPrice - product.sellingPrice) / product.regularPrice) * 100
            );

          // Use our utility function to create the color-to-image mapping
          const colorImageMap = createColorImageMap(product.productColors);

          return {
            id: product.id,
            title: product.name,
            image: product.productColors.length > 0 ? product.productColors[0].imageUrl : '',
            salePrice: `Rs.${product.sellingPrice.toLocaleString()}`,
            regularPrice: `Rs.${product.regularPrice.toLocaleString()}`,
            sellingPrice: product.sellingPrice,
            discount: `-${discount}%`,
            colors: product.productColors.map((colorObj: any) => colorObj.color),
            colorImages: colorImageMap,
            sizes: product.productSizes?.map((sizeObj: any) => sizeObj.size) || ['S', 'M', 'L', 'XL', 'XXL'],
            description:
              product.description ||
              'Premium quality product with a stylish design. Made from soft, comfortable fabric perfect for everyday wear.',
            // Include category information for filtering/display
            category: product.category?.name || '',
            categorySlug: product.category?.slug || '',
          };
        });

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ClientOnly>
      <div className="">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ProductCollection
            page="All Collections"
            title="All Collections"
            description="Explore our complete catalog of premium t-shirts, sweatshirts, and apparel. From men's classics to stylish women's designs and fun kids' options, discover the perfect choice for every style preference."
            products={products}
            totalResults={totalResults}
          />
        )}
      </div>
    </ClientOnly>
  );
} 