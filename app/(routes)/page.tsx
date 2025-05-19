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

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all products
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Format products for display
        const formattedProducts = data.map((product: any) => {
          const discount = product.discount || Math.round(
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
            description: product.description || (isKidsProduct 
              ? 'Comfortable and stylish clothing designed especially for kids. Made from soft, durable fabric perfect for active children.'
              : 'Premium quality t-shirt with a stylish design. Made from soft, comfortable fabric perfect for everyday wear.')
          };
        });
        
        // Get featured products (first 10)
        setFeaturedProducts(formattedProducts.slice(0, 10));
        
        // Get best selling products (all)
        setBestSellingProducts(formattedProducts);
        
        // Get kids products
        const kidsCollection = formattedProducts.filter((product: any) => {
          const productFromData = data.find((p: any) => p.id === product.id);
          return productFromData.collection === 'KIDS';
        });
        setKidsProducts(kidsCollection);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };
    
    fetchAllProducts();
  }, []);

  const collectionsData = [
      {
        id: 1,
        title: 'Graphic Tees',
        image: 'https://herotag.pk/cdn/shop/files/Graphic-Tees.png?v=1732727323&width=240',
        link: '/collections/graphic-tees'
      },
      {
        id: 2,
        title: 'Basic Tees',
        image: 'https://herotag.pk/cdn/shop/files/Basic-Tees.png?v=1732727379&width=240',
        link: '/collections/basic-tees'
      },
      {
        id: 3,
        title: 'Full Sleeve Tees',
        image: 'https://herotag.pk/cdn/shop/files/Full-Sleeves-2.png?v=1732727417&width=240',
        link: '/collections/full-sleeve-tees'
      },
      {
        id: 4,
        title: 'Kids Tees',
        image: 'https://herotag.pk/cdn/shop/files/Kids-Tees.png?v=1732727485&width=240',
        link: '/collection/kids-collection'
      },
      {
        id: 5,
        title: 'Sweatshirts',
        image: 'https://herotag.pk/cdn/shop/files/Sweatshirts-2.png?v=1732728129&width=240',
        link: '/collections/sweatshirts'
      },
      {
        id: 6,
        title: 'Hoodies',
        image: 'https://herotag.pk/cdn/shop/files/Hoodies.png?v=1732727215&width=240',
        link: '/collections/hoodies'
      }
  ];

  return (
      <ClientOnly>
      <div className="">
        {/* Hero Banner Section */}
        <HeroSlider />
        
        {/* Collections Section */}
        <Collections
          title="Top Collections"
          description="Express your style with our standout collection fashion meets sophistication."
          collections={collectionsData} 
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
