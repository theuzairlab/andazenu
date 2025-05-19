// Define common types for the application

// Website settings type
export interface WebsiteSettings {
  id: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  heroSliderImages: string[] | null;
  categoryImages: Record<string, string> | null;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: Record<string, string> | null;
  updatedAt: string;
}

// Product type
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  regularPrice: number;
  sellingPrice: number;
  discount?: number;
  stock: number;
  collection: string;
  createdAt: string;
  updatedAt: string;
  productColors?: ProductColor[];
  productSizes?: ProductSize[];
  orderItems?: any[];
}

// Product color type
export interface ProductColor {
  id: string;
  productId: string;
  color: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// Product size type
export interface ProductSize {
  id: string;
  productId: string;
  size: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

// Order type
export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  orderItems?: OrderItem[];
}

// Order item type
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  size: string;
  price: number;
  color?: string;
  product?: Product;
}

// User type
export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: string;
  orders?: Order[];
} 