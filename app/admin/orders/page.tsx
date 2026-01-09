'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'ride', label: 'Ride' },
  { value: 'service', label: 'Service' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (typeFilter !== 'all' && order.type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.userName?.toLowerCase().includes(query) ||
        order.userPhone?.includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'primary' | 'secondary' | 'success' | 'danger'> = {
      pending: 'warning',
      confirmed: 'primary',
      preparing: 'secondary',
      out_for_delivery: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'warning'}>{status.replace('_', ' ')}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shopping':
        return '🛒';
      case 'ride':
        return '🏍️';
      case 'service':
        return '🔧';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted">Manage all customer orders</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID, customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border border-border rounded-xl px-4 py-3 text-foreground"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-card border border-border rounded-xl px-4 py-3 text-foreground"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-border/30">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Order</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Type</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Amount</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Date</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border hover:bg-border/20 transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="font-medium text-foreground">#{order.id.slice(-6)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-foreground">{order.userName || 'N/A'}</p>
                    <p className="text-sm text-muted">{order.userPhone}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xl">{getTypeIcon(order.type)}</span>
                  </td>
                  <td className="py-4 px-4 font-medium text-primary">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-4 px-4 text-sm text-muted">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-foreground font-medium">No orders found</p>
            <p className="text-sm text-muted mt-1">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Orders will appear here'}
            </p>
          </div>
        )}
      </Card>

      <p className="text-sm text-muted text-center">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>
    </div>
  );
}
