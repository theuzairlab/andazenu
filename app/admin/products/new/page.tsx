import ProductForm from '@/components/admin/ProductForm';

export default function AddProductPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>
      
      <ProductForm />
    </div>
  );
} 