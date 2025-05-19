'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ProductRedirect() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  useEffect(() => {
    router.replace(`/product/${id}`);
  }, [router, id]);
  
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
} 