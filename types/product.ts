export type ProductSize = {
  size: string;
  stock: number;
};

export type Product = {
  id: number | string;
  title: string;
  image: string;
  salePrice: string;
  regularPrice: string;
  discount: string;
  colors: string[];
  colorImages?: Record<string, string>;
  sizes: string[];
  description: string;
  stock: number;
  productSizes: ProductSize[];
  sellingPrice: number;
  category?: string;
  categorySlug?: string;
}; 