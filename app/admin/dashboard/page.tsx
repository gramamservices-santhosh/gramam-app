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
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
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

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
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

  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((order) => {
    if (!order.createdAt) return false;
    const orderDate = typeof order.createdAt.toDate === 'function'
      ? order.createdAt.toDate()
      : new Date(order.createdAt as any);
    return orderDate >= today;
  });

  const pendingOrders = orders.filter((order) => order.status === 'pending');

  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const orderBreakdown = {
    shopping: orders.filter((o) => o.type === 'shopping').length,
    ride: orders.filter((o) => o.type === 'ride').length,
    service: orders.filter((o) => o.type === 'service').length,
  };

  const recentOrders = orders.slice(0, 10);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Real-time overview of your business</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Today's Orders */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Today's Orders</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{todayOrders.length}</p>
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
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>Rs {todayRevenue.toLocaleString()}</p>
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
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '22px', height: '22px', color: '#d97706' }} />
            </div>
          </div>
          {pendingOrders.length > 0 && (
            <p style={{ fontSize: '12px', color: '#d97706', marginTop: '8px' }}>Needs attention!</p>
          )}
        </div>

        {/* Total Users */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Total Users</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{users.length}</p>
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#f3e8ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '22px', height: '22px', color: '#9333ea' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Type Breakdown - Responsive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag style={{ width: '24px', height: '24px', color: '#f97316' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.shopping}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Shopping</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.ride}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Rides</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench style={{ width: '24px', height: '24px', color: '#22c55e' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.service}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Services</p>
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

                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      {order.totalAmount > 0 && (
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: 0 }}>Rs {order.totalAmount}</p>
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
