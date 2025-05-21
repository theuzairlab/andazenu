'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { getColorName } from '@/lib/colorUtils';
import Image from 'next/image';

// Types
type Order = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  orderItems: OrderItem[];
};

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  product?: {
    name: string;
    imageUrl: string;
  };
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order details');
      }

      setOrder(data.order);
      setNewStatus(data.order.status);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Update local state
      if (order) {
        setOrder({ ...order, status: newStatus as Order['status'] });
      }

      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status. Please try again.');
    }
  };

  const resendOrderConfirmation = async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/resend-email`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend confirmation email');
      }

      toast.success('Order confirmation email sent successfully');
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Failed to send confirmation email. Please try again.');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-4">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => router.push('/admin/orders')}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back to All Orders
        </button>
      </div>

      {/* Order Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-lg font-medium mb-2">Order Status</h2>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="rounded border border-gray-300 py-2 px-3 mr-2"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                onClick={updateOrderStatus}
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                Update Status
              </button>
            </div>
            <button
              onClick={resendOrderConfirmation}
              className="border border-gray-300 px-4 py-2 rounded-lg"
            >
              Resend Confirmation
            </button>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{order.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{order.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{order.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Shipping Address</p>
            <p className="font-medium">{order.address}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Image
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.product?.name || `Product ID: ${item.productId}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Image src={`${item.product?.imageUrl}`} alt={`${item.product?.name}`} width={80} height={80} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Size: {item.size}</div>
                    {item.color && <div className="text-sm text-gray-500">Color: {getColorName(item.color)}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(item.price || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice((item.price || 0) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-4 text-right font-medium">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
