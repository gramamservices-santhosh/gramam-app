'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, ChevronRight, RotateCcw } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Order } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const typeFilters = [
  { id: 'all', label: 'All Types', icon: '📋' },
  { id: 'shopping', label: 'Shopping', icon: '🛒' },
  { id: 'ride', label: 'Ride', icon: '🛵' },
  { id: 'service', label: 'Services', icon: '🔧' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#dbeafe', text: '#2563eb' },
  assigned: { bg: '#e0e7ff', text: '#4f46e5' },
  picked: { bg: '#dbeafe', text: '#2563eb' },
  onway: { bg: '#dbeafe', text: '#2563eb' },
  delivered: { bg: '#dcfce7', text: '#16a34a' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

const typeIcons: Record<string, string> = {
  shopping: '🛒',
  transport: '🛵',
  ride: '🛵',
  service: '🔧',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userId, setUserId] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);
  const { addItem, clearCart } = useCartStore();

  const handleReorder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();

    if (order.type !== 'shopping' || !order.items || order.items.length === 0) {
      alert('This order type cannot be reordered');
      return;
    }

    // Clear existing cart and add items from this order
    clearCart();
    order.items.forEach(item => {
      addItem({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
        image: item.image,
        unit: item.unit,
      });
    });

    setReorderSuccess(order.id);
    setTimeout(() => {
      setReorderSuccess(null);
      router.push('/cart');
    }, 1000);
  };

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch orders from Firestore
  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

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

  const getOrderDescription = (order: Order) => {
    if (order.type === 'shopping') {
      return order.isCustomOrder
        ? order.customOrderDescription?.slice(0, 50) + '...'
        : `${order.items?.length || 0} items`;
    }
    if (order.type === 'transport' || order.type === 'ride') {
      return `${order.pickup?.name || 'Pickup'} → ${order.drop?.name || 'Drop'}`;
    }
    if (order.type === 'service') {
      return order.serviceOption || order.description || 'Service request';
    }
    return 'Order';
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>My Orders</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Track all your orders</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px' }}>
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: statusFilter === filter.id ? '#059669' : '#ffffff',
                color: statusFilter === filter.id ? '#ffffff' : '#374151',
                border: statusFilter === filter.id ? 'none' : '1px solid #e2e8f0',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Type Filters */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
          {typeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTypeFilter(filter.id)}
              style={{
                padding: '6px 12px',
                backgroundColor: typeFilter === filter.id ? '#fef3c7' : '#ffffff',
                color: typeFilter === filter.id ? '#d97706' : '#64748b',
                border: typeFilter === filter.id ? '1px solid #fcd34d' : '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map((order) => {
              const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };
              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {typeIcons[order.type] || '📦'}
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>#{order.id.slice(-6)}</p>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', textTransform: 'capitalize' }}>{order.type}</p>
                      </div>
                    </div>
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
                  </div>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 12px', lineHeight: '1.4' }}>
                    {getOrderDescription(order)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                        {order.totalAmount > 0 ? formatPrice(order.totalAmount) : 'TBD'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Reorder Button - Only for shopping orders */}
                      {order.type === 'shopping' && order.items && order.items.length > 0 && (
                        <button
                          onClick={(e) => handleReorder(order, e)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: reorderSuccess === order.id ? '#dcfce7' : '#fef3c7',
                            color: reorderSuccess === order.id ? '#16a34a' : '#d97706',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RotateCcw style={{ width: '14px', height: '14px' }} />
                          {reorderSuccess === order.id ? 'Added!' : 'Reorder'}
                        </button>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                        <span style={{ fontSize: '13px' }}>View</span>
                        <ChevronRight style={{ width: '16px', height: '16px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>No Orders Found</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>
              {statusFilter === 'all' && typeFilter === 'all'
                ? "You haven't placed any orders yet"
                : 'No orders match your filters'}
            </p>
            <Link href="/home" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Start Shopping
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '8px 0', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { href: '/home', label: 'Home', icon: '🏠', active: false },
            { href: '/shop', label: 'Shop', icon: '🛒', active: false },
            { href: '/ride', label: 'Ride', icon: '🛵', active: false },
            { href: '/services', label: 'Services', icon: '🔧', active: false },
            { href: '/orders', label: 'Orders', icon: '📋', active: true },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 12px' }}>
              <span style={{ fontSize: '20px', display: 'block' }}>{item.icon}</span>
              <span style={{ fontSize: '11px', color: item.active ? '#059669' : '#64748b', fontWeight: item.active ? '600' : '400' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
