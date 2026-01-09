'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// Sample data for demo
const sampleOrders = [
  { id: 'ORD001', type: 'shopping', customer: 'Ravi Kumar', village: 'Vaniyambadi', amount: 450, status: 'pending', time: '5 mins ago' },
  { id: 'ORD002', type: 'transport', customer: 'Priya S', village: 'Ambur', amount: 85, status: 'confirmed', time: '15 mins ago' },
  { id: 'ORD003', type: 'service', customer: 'Mohan R', village: 'Jolarpet', amount: 500, status: 'in_progress', time: '30 mins ago' },
  { id: 'ORD004', type: 'shopping', customer: 'Lakshmi', village: 'Tirupattur', amount: 320, status: 'delivered', time: '1 hour ago' },
  { id: 'ORD005', type: 'transport', customer: 'Anand K', village: 'Vaniyambadi', amount: 120, status: 'completed', time: '2 hours ago' },
];

const typeIcons: Record<string, string> = {
  shopping: '📦',
  transport: '🛵',
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
  const stats = {
    todayOrders: 24,
    todayRevenue: 12500,
    pendingOrders: 8,
    totalUsers: 156,
  };

  const orderBreakdown = {
    shopping: 12,
    transport: 8,
    service: 4,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Today's Orders */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Today's Orders</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{stats.todayOrders}</p>
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>+12% from yesterday</p>
        </div>

        {/* Today's Revenue */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Today's Revenue</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>Rs {stats.todayRevenue.toLocaleString()}</p>
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee style={{ width: '22px', height: '22px', color: '#16a34a' }} />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>+8% from yesterday</p>
        </div>

        {/* Pending Orders */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Pending Orders</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{stats.pendingOrders}</p>
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: '22px', height: '22px', color: '#d97706' }} />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#d97706', marginTop: '8px' }}>Needs attention</p>
        </div>

        {/* Total Users */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Total Users</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{stats.totalUsers}</p>
            </div>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#f3e8ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '22px', height: '22px', color: '#9333ea' }} />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>+5 new this week</p>
        </div>
      </div>

      {/* Order Type Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
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
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.transport}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Transport Orders</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench style={{ width: '24px', height: '24px', color: '#22c55e' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{orderBreakdown.service}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Service Orders</p>
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {sampleOrders.map((order) => {
                const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>#{order.id}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{typeIcons[order.type]}</span>
                        <span style={{ fontSize: '14px', color: '#1e293b', textTransform: 'capitalize' }}>{order.type}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div>
                        <p style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{order.customer}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{order.village}</p>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>Rs {order.amount}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>{order.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sampleOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <ClipboardList style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#64748b' }}>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
