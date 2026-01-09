'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Navigation,
  Wrench,
  IndianRupee,
  Users,
  ClipboardList,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatsCard from '@/components/admin/StatsCard';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get today's start
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    // Subscribe to orders
    const ordersRef = collection(db, 'orders');
    const recentQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(recentQuery, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      setRecentOrders(orders);

      // Calculate stats
      const todayOrders = orders.filter(
        (o) => o.createdAt.toMillis() >= todayTimestamp.toMillis()
      );
      const pendingOrders = orders.filter((o) =>
        ['pending', 'confirmed', 'assigned'].includes(o.status)
      );
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders: pendingOrders.length,
        totalUsers: 0, // Would need separate query
      });

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const orderTypeIcons = {
    shopping: ShoppingBag,
    transport: Navigation,
    service: Wrench,
  };

  const statusVariants: Record<string, 'warning' | 'primary' | 'success' | 'danger' | 'secondary'> = {
    pending: 'warning',
    confirmed: 'secondary',
    assigned: 'secondary',
    picked: 'primary',
    onway: 'primary',
    delivered: 'success',
    completed: 'success',
    cancelled: 'danger',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon={ClipboardList}
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Today's Revenue"
          value={stats.todayRevenue}
          icon={IndianRupee}
          color="success"
          isCurrency
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="secondary"
        />
      </div>

      {/* Order Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentOrders.filter((o) => o.type === 'shopping').length}
              </p>
              <p className="text-sm text-muted">Shopping Orders</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentOrders.filter((o) => o.type === 'transport').length}
              </p>
              <p className="text-sm text-muted">Transport Orders</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentOrders.filter((o) => o.type === 'service').length}
              </p>
              <p className="text-sm text-muted">Service Orders</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary flex items-center gap-1 hover:underline"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 5).map((order) => {
                const Icon = orderTypeIcons[order.type];
                return (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-border/30 cursor-pointer"
                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted" />
                        <span className="text-sm text-foreground capitalize">{order.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-foreground">{order.userName}</p>
                        <p className="text-xs text-muted">{order.userVillage}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariants[order.status]} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {formatRelativeTime(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recentOrders.length === 0 && (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No orders yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
