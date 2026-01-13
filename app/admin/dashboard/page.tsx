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
  Clock,
  ChevronRight,
  Phone,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Bike,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Order, User as UserType } from '@/types';
import { formatDate } from '@/lib/utils';

const typeIcons: Record<string, string> = {
  shopping: '🛒',
  ride: '🛵',
  service: '🔧',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#dbeafe', text: '#2563eb' },
  in_progress: { bg: '#e0e7ff', text: '#4f46e5' },
  delivered: { bg: '#dcfce7', text: '#16a34a' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

interface Partner {
  id: string;
  status: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch users
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('type', '==', 'customer'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserType[];
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch partners
  useEffect(() => {
    const partnersRef = collection(db, 'partners');
    const unsubscribe = onSnapshot(partnersRef, (snapshot) => {
      const partnersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Partner[];
      setPartners(partnersData);
    });

    return () => unsubscribe();
  }, []);

  // Calculate date ranges
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Filter orders by date
  const getOrderDate = (order: Order) => {
    if (!order.createdAt) return new Date(0);
    return typeof order.createdAt.toDate === 'function'
      ? order.createdAt.toDate()
      : new Date(order.createdAt as any);
  };

  const todayOrders = orders.filter((order) => getOrderDate(order) >= today);
  const yesterdayOrders = orders.filter((order) => {
    const date = getOrderDate(order);
    return date >= yesterday && date < today;
  });

  const thisWeekOrders = orders.filter((order) => getOrderDate(order) >= thisWeekStart);
  const lastWeekOrders = orders.filter((order) => {
    const date = getOrderDate(order);
    return date >= lastWeekStart && date < thisWeekStart;
  });

  const thisMonthOrders = orders.filter((order) => getOrderDate(order) >= thisMonthStart);

  // Calculate stats
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const completedOrders = orders.filter((order) =>
    order.status === 'completed' || order.status === 'delivered'
  );
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled');

  // Revenue calculations
  const calculateRevenue = (orderList: Order[]) =>
    orderList.reduce((sum, order) => sum + ((order as any).finalAmount || order.totalAmount || 0), 0);

  const todayRevenue = calculateRevenue(todayOrders);
  const yesterdayRevenue = calculateRevenue(yesterdayOrders);
  const thisWeekRevenue = calculateRevenue(thisWeekOrders);
  const lastWeekRevenue = calculateRevenue(lastWeekOrders);
  const thisMonthRevenue = calculateRevenue(thisMonthOrders);
  const totalRevenue = calculateRevenue(completedOrders);

  // Growth calculations
  const dailyGrowth = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : todayRevenue > 0 ? '100' : '0';

  const weeklyGrowth = lastWeekRevenue > 0
    ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100).toFixed(1)
    : thisWeekRevenue > 0 ? '100' : '0';

  // Average order value
  const avgOrderValue = completedOrders.length > 0
    ? Math.round(totalRevenue / completedOrders.length)
    : 0;

  // Order breakdown
  const orderBreakdown = {
    shopping: orders.filter((o) => o.type === 'shopping').length,
    ride: orders.filter((o) => o.type === 'ride').length,
    service: orders.filter((o) => o.type === 'service').length,
  };

  // Partner stats
  const activePartners = partners.filter(p => p.status === 'approved' && p.isActive).length;
  const pendingPartners = partners.filter(p => p.status === 'pending').length;

  // Completion rate
  const completionRate = orders.length > 0
    ? ((completedOrders.length / orders.length) * 100).toFixed(1)
    : '0';

  const recentOrders = orders.slice(0, 10);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Real-time overview of your business</p>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Today's Orders */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Today's Orders</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{todayOrders.length}</p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                vs {yesterdayOrders.length} yesterday
              </p>
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Today's Revenue</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>₹{todayRevenue.toLocaleString()}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                {parseFloat(dailyGrowth) >= 0 ? (
                  <TrendingUp style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                ) : (
                  <TrendingDown style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                )}
                <span style={{ fontSize: '12px', color: parseFloat(dailyGrowth) >= 0 ? '#16a34a' : '#dc2626' }}>
                  {dailyGrowth}% vs yesterday
                </span>
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee style={{ width: '22px', height: '22px', color: '#16a34a' }} />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Pending Orders</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: pendingOrders.length > 0 ? '#d97706' : '#1e293b', margin: '8px 0 0' }}>{pendingOrders.length}</p>
              {pendingOrders.length > 0 && (
                <p style={{ fontSize: '12px', color: '#d97706', marginTop: '4px' }}>Needs attention!</p>
              )}
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '22px', height: '22px', color: '#d97706' }} />
            </div>
          </div>
        </div>

        {/* Active Partners */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Active Partners</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{activePartners}</p>
              {pendingPartners > 0 && (
                <p style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}>{pendingPartners} pending approval</p>
              )}
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#ede9fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bike style={{ width: '22px', height: '22px', color: '#7c3aed' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Weekly Revenue Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar style={{ width: '18px', height: '18px', color: '#64748b' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>This Week</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Revenue</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669', margin: 0 }}>₹{thisWeekRevenue.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Orders</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{thisWeekOrders.length}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', backgroundColor: parseFloat(weeklyGrowth) >= 0 ? '#dcfce7' : '#fee2e2', borderRadius: '8px' }}>
            {parseFloat(weeklyGrowth) >= 0 ? (
              <TrendingUp style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            ) : (
              <TrendingDown style={{ width: '16px', height: '16px', color: '#dc2626' }} />
            )}
            <span style={{ fontSize: '13px', fontWeight: '500', color: parseFloat(weeklyGrowth) >= 0 ? '#16a34a' : '#dc2626' }}>
              {weeklyGrowth}% vs last week
            </span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 style={{ width: '18px', height: '18px', color: '#64748b' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Performance</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase' }}>Avg Order Value</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>₹{avgOrderValue}</p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase' }}>Completion Rate</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', margin: 0 }}>{completionRate}%</p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#16a34a', margin: '0 0 4px', textTransform: 'uppercase' }}>Completed</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', margin: 0 }}>{completedOrders.length}</p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#dc2626', margin: '0 0 4px', textTransform: 'uppercase' }}>Cancelled</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626', margin: 0 }}>{cancelledOrders.length}</p>
            </div>
          </div>
        </div>

        {/* All-time Stats */}
        <div style={{ backgroundColor: '#059669', border: '1px solid #059669', borderRadius: '12px', padding: '20px', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <IndianRupee style={{ width: '18px', height: '18px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Total Revenue</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px' }}>₹{totalRevenue.toLocaleString()}</p>
          <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>From {completedOrders.length} completed orders</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 2px' }}>This Month</p>
              <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>₹{thisMonthRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 2px' }}>Total Users</p>
              <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Type Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag style={{ width: '24px', height: '24px', color: '#f97316' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.shopping}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Shopping Orders</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.ride}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Ride Bookings</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench style={{ width: '24px', height: '24px', color: '#22c55e' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.service}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Service Requests</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#059669', fontWeight: '500' }}>
            View All
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Loading orders...</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentOrders.map((order) => {
              const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '120px' }}>
                      <span style={{ fontSize: '24px' }}>{typeIcons[order.type] || '📦'}</span>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>#{order.id.slice(-6)}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0', textTransform: 'capitalize' }}>{order.type}</p>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{order.userName || 'Customer'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Phone style={{ width: '12px', height: '12px', color: '#64748b' }} />
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{order.userPhone || 'No phone'}</p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      {(order.totalAmount > 0 || (order as any).finalAmount) && (
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: 0 }}>
                          ₹{(order as any).finalAmount || order.totalAmount}
                        </p>
                      )}
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        marginTop: '4px'
                      }}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <ClipboardList style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>No orders yet</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Orders will appear here when customers place them</p>
          </div>
        )}
      </div>
    </div>
  );
}
