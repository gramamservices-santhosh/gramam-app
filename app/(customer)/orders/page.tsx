'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Filter } from 'lucide-react';
import Card from '@/components/ui/Card';
import OrderCard from '@/components/orders/OrderCard';
import { SkeletonOrderCard } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '@/types';
import { cn } from '@/lib/utils';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const typeFilters = [
  { id: 'all', label: 'All Types', icon: '📋' },
  { id: 'shopping', label: 'Shopping', icon: '📦' },
  { id: 'transport', label: 'Transport', icon: '🛵' },
  { id: 'service', label: 'Services', icon: '🔧' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    // Subscribe to user's orders
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthenticated]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter === 'active') {
      if (['completed', 'delivered', 'cancelled'].includes(order.status)) return false;
    } else if (statusFilter === 'completed') {
      if (!['completed', 'delivered'].includes(order.status)) return false;
    } else if (statusFilter === 'cancelled') {
      if (order.status !== 'cancelled') return false;
    }

    // Type filter
    if (typeFilter !== 'all' && order.type !== typeFilter) return false;

    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="px-4 py-8 text-center">
        <span className="text-6xl">🔐</span>
        <h2 className="text-xl font-semibold text-foreground mt-4">
          Login Required
        </h2>
        <p className="text-muted mt-2">Please login to view your orders</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted">Track all your orders</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              statusFilter === filter.id
                ? 'bg-primary text-white'
                : 'bg-card border border-border text-foreground hover:border-primary/50'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
        {typeFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setTypeFilter(filter.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center gap-1',
              typeFilter === filter.id
                ? 'bg-secondary/20 text-secondary border border-secondary/30'
                : 'bg-card border border-border text-muted hover:text-foreground'
            )}
          >
            <span>{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <>
            <SkeletonOrderCard />
            <SkeletonOrderCard />
            <SkeletonOrderCard />
          </>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <Card className="text-center py-12">
            <span className="text-6xl">📋</span>
            <h2 className="text-xl font-semibold text-foreground mt-4">
              No Orders Found
            </h2>
            <p className="text-muted mt-2">
              {statusFilter === 'all'
                ? 'You haven\'t placed any orders yet'
                : `No ${statusFilter} orders`}
            </p>
            <button
              onClick={() => router.push('/home')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium"
            >
              Start Shopping
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}
