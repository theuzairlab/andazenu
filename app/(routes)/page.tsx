'use client';

import { useState, useEffect } from 'react';
import HeroSlider from '@/components/HeroSlider';
import Collections from '@/components/Collections';
import FeaturedProducts from '@/components/FeaturedProducts';
import ClientOnly from '@/components/ClientOnly';
import ProductsSlider from '@/components/ProductsSlider';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [kidsProducts, setKidsProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollectionsAndProducts = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categories = await categoriesResponse.json();

        // Transform categories into collections format
        const dynamicCollections = categories.map((category: any) => ({
          id: category.id,
          title: category.name,
          image: category.imageUrl || 'https://via.placeholder.com/240x240?text=Collection',
          link: `/collection/${category.slug}`,
          description: category.description,
        }));

        setCollections(dynamicCollections);

        // Fetch all products
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        // Format products for display
        const formattedProducts = data.map((product: any) => {
          const discount =
            product.discount ||
            Math.round(
              ((product.regularPrice - product.sellingPrice) / product.regularPrice) * 100
            );

          // Determine if it's a kids product
          const isKidsProduct = product.collection === 'KIDS';

          // Choose appropriate sizes based on collection
          const defaultSizes = isKidsProduct
            ? ['2 - 3Y', '4 - 5Y', '6 - 7Y', '8 - 9Y', '10 - 11Y', '12 - 13Y']
            : ['S', 'M', 'L', 'XL', 'XXL'];

          return {
            id: product.id,
            title: product.name,
            image: product.productColors.length > 0 ? product.productColors[0].imageUrl : '',
            salePrice: `Rs.${product.sellingPrice.toLocaleString()}`,
            regularPrice: `Rs.${product.regularPrice.toLocaleString()}`,
            discount: `-${discount}%`,
            colors: product.productColors.map((colorObj: any) => colorObj.color),
            colorImages: product.productColors.reduce((acc: any, colorObj: any) => {
              acc[colorObj.color] = colorObj.imageUrl;
              return acc;
            }, {}),
            sizes: product.sizes || defaultSizes,
            description:
              product.description ||
              (isKidsProduct
                ? 'Comfortable and stylish clothing designed especially for kids. Made from soft, durable fabric perfect for active children.'
                : 'Premium quality t-shirt with a stylish design. Made from soft, comfortable fabric perfect for everyday wear.'),
          };
        });

        // Get featured products (first 10)
        setFeaturedProducts(formattedProducts.slice(0, 10));

        // Get best selling products (all)
        setBestSellingProducts(formattedProducts);

        // Get kids products
        const kidsCollection = formattedProducts.filter((product: any) => {
          const productFromData = data.find((p: any) => p.id === product.id);
          return productFromData.category && 
                 productFromData.category.name && 
                 productFromData.category.name.toLowerCase().includes('kid');
        });
        setKidsProducts(kidsCollection);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };

    fetchCollectionsAndProducts();
  }, []);

  return (
    <ClientOnly>
      <div className="">
        {/* Hero Banner Section */}
        <HeroSlider />

        {/* Collections Section */}
        <Collections
          title="Top Collections"
          description="Express your style with our standout collection fashion meets sophistication."
          collections={collections}
        />

        {/* Featured Products Section */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Best Selling Products Section */}
            <ProductsSlider
              title="Best Selling Products"
              description="Our most popular items that customers love. Quality, style, and comfort that keep them coming back for more."
              products={bestSellingProducts}
              viewAllPageLink="/collection/mens-collection"
            />

            {/* Featured Products Section */}
            <FeaturedProducts
              title="Featured Products"
              description="Discover our top picks! From trendy designs to bestsellers, explore must-have styles that stand out."
              products={featuredProducts}
              viewAllPageLink="/collection/mens-collection"
            />

            {/* Kids Products Section */}
            {kidsProducts.length > 0 && (
              <ProductsSlider
                title="Kids Collection"
                description="Adorable and comfortable clothing designed especially for kids. Fun graphic tees and cozy sweatshirts they'll love to wear."
                products={kidsProducts}
                viewAllPageLink="/collection/kids-collection"
              />
            )}
          </>
        )}
      </div>
    </ClientOnly>
  );
}
