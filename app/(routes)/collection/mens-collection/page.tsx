'use client';

import { useState, useEffect } from 'react';
import ClientOnly from '@/components/ClientOnly';
import ProductCollection from '@/components/ProductCollection';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';
import { createColorImageMap } from '@/lib/colorUtils';

export default function MensCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // First get the category ID for men's collection
        const categoryResponse = await fetch('/api/categories?slug=mens-collection');
        const categories = await categoryResponse.json();
        
        if (!categories || categories.length === 0) {
          throw new Error("Men's category not found");
        }
        
        const categoryId = categories[0].id;
        
        // Then fetch products with that category ID
        const response = await fetch(`/api/products?category=${categoryId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch men's products");
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
            sizes: product.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
            description:
              product.description ||
              'Premium quality t-shirt with a stylish design. Made from soft, comfortable fabric perfect for everyday wear.',
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
            page="Men's Collection"
            title="Men's Collection"
            description="Discover a world of style and comfort with our men's collection. From classic t-shirts to cozy sweatshirts and stylish hoodies, we have everything you need to elevate your wardrobe."
            products={products}
            totalResults={totalResults}
          />
        )}
      </div>
    </ClientOnly>
  );
}
