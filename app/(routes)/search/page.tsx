'use client';

import { Suspense } from 'react';
import SearchContent from '@/components/SearchContent'; // Assume this is your actual search component

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}