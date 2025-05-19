'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/app/stores/useAuth';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';

type OrderItem = {
  id: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  product: {
    name: string;
    imageUrl: string;
  } | null;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
};

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    fetchUserOrders();
  }, [isAuthenticated, router]);

  const fetchUserOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load your orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Format status to be more user-friendly
  const formatStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Order Received';
      case 'PROCESSING':
        return 'Processing';
      case 'SHIPPED':
        return 'Shipped';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Get appropriate color for status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="flex flex-col space-y-2">
          <p><span className="font-medium">Email:</span> {user?.email}</p>
          <p><span className="font-medium">Name:</span> {user?.name || 'Not set'}</p>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="border-b pb-4 mb-4">
            <p className="text-gray-500 mb-1">No orders found</p>
            <p className="text-sm text-gray-600">
              Your order history will appear here once you've made a purchase.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between md:items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center">
                    <p className="text-sm mr-2">Status:</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.orderItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.product?.name || 'Product'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">Size: {item.size}</div>
                              <div className="text-sm text-gray-500">Color: {item.color}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatPrice(item.price || 0)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              {formatPrice((item.price || 0) * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-right font-medium">
                            Total:
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold">
                            {formatPrice(order.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {/* Shipping Information */}
                {order.status === 'SHIPPED' && (
                  <div className="p-4 border-t">
                    <h3 className="text-md font-medium mb-2">Shipping Information</h3>
                    <p className="text-sm text-gray-600">
                      Your order has been shipped. It should arrive in 3-5 business days.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex flex-col space-y-2 mt-6">
          <p className="text-sm text-gray-600">
            Need help with an order? Contact our customer support:
          </p>
          <p className="text-sm font-medium">
            Call or WhatsApp: +92 319 6557338
          </p>
        </div>
      </div>
    </div>
  );
} 