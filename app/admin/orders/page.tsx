'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
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
  { value: 'transport', label: 'Transport' },
  { value: 'service', label: 'Service' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#dbeafe', text: '#2563eb' },
  preparing: { bg: '#e0e7ff', text: '#4f46e5' },
  out_for_delivery: { bg: '#dbeafe', text: '#2563eb' },
  delivered: { bg: '#dcfce7', text: '#16a34a' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

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
      const q = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.userName?.toLowerCase().includes(q) ||
        order.userPhone?.includes(q)
      );
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shopping': return '🛒';
      case 'transport': return '🏍️';
      case 'service': return '🔧';
      default: return '📦';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Orders</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage all customer orders</p>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#94a3b8' }} />
            <input
              placeholder="Search by order ID, customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', backgroundColor: '#ffffff' }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', backgroundColor: '#ffffff' }}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Order</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>#{order.id.slice(-6)}</p>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{order.userName || 'N/A'}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>{order.userPhone}</p>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '20px' }}>{getTypeIcon(order.type)}</span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500', color: '#059669' }}>
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 12px', backgroundColor: statusColor.bg, color: statusColor.text, borderRadius: '20px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/admin/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#1e293b', cursor: 'pointer' }}>
                          <Eye style={{ width: '16px', height: '16px' }} />
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Clock style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>No orders found</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your filters' : 'Orders will appear here'}
            </p>
          </div>
        )}
      </div>

      <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '16px' }}>
        Showing {filteredOrders.length} of {orders.length} orders
      </p>
    </div>
  );
}
