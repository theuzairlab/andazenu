'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product');
        router.push('/admin/products');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProduct();
  }, [params.id, router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      
      {product && <ProductForm initialData={product} isEditing={true} />}
    </div>
  );
} 