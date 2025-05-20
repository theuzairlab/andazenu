'use client';

import { useState, useEffect } from 'react';
import ClientOnly from '@/components/ClientOnly';
import ProductCollection, { Product } from '@/components/ProductCollection';
import { createColorImageMap } from '@/lib/colorUtils';

export default function KidsCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products?collection=KIDS');

        if (!response.ok) {
          throw new Error("Failed to fetch kids' products");
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
            sizes: product.sizes || [
              '2 - 3Y',
              '4 - 5Y',
              '6 - 7Y',
              '8 - 9Y',
              '10 - 11Y',
              '12 - 13Y',
            ],
            description:
              product.description ||
              'Comfortable and stylish clothing designed especially for kids. Made from soft, durable fabric perfect for active children.',
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
            page="Kids Collection"
            title="Kids Collection"
            description="Discover adorable and comfortable clothing designed especially for kids. From fun graphic tees to cozy sweatshirts, our kids collection combines style, comfort, and durability."
            products={products}
            totalResults={totalResults}
          />
        )}
      </div>
    </ClientOnly>
  );
}
