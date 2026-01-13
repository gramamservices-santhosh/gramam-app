'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Package, IndianRupee, MapPin, Clock, Phone,
  CheckCircle, Navigation, AlertCircle, TrendingUp, User
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { Order } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';

const statusColors: Record<string, { bg: string; text: string }> = {
  assigned: { bg: '#e0e7ff', text: '#4f46e5' },
  picked: { bg: '#dbeafe', text: '#2563eb' },
  onway: { bg: '#fef3c7', text: '#d97706' },
  delivered: { bg: '#dcfce7', text: '#16a34a' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
};

const typeIcons: Record<string, string> = {
  shopping: '🛒',
  transport: '🛵',
  ride: '🛵',
  service: '🔧',
};

interface Partner {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isActive: boolean;
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Stats
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);

  // Check authentication
  useEffect(() => {
    const partnerId = localStorage.getItem('partnerId');
    const partnerPhone = localStorage.getItem('partnerPhone');
    const partnerName = localStorage.getItem('partnerName');

    if (!partnerId || !partnerPhone) {
      router.push('/partner-login');
      return;
    }

    // Fetch partner details
    const fetchPartner = async () => {
      try {
        const partnerDoc = await getDoc(doc(db, 'partners', partnerId));
        if (partnerDoc.exists()) {
          const data = partnerDoc.data();
          setPartner({
            id: partnerDoc.id,
            name: data.name,
            phone: data.phone,
            vehicleType: data.vehicleType,
            vehicleNumber: data.vehicleNumber,
            isActive: data.isActive,
          });
        }
      } catch (err) {
        console.error('Error fetching partner:', err);
      }
    };

    fetchPartner();
  }, [router]);

  // Fetch assigned orders
  useEffect(() => {
    const partnerId = localStorage.getItem('partnerId');
    if (!partnerId) return;

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('assignedTo', '==', partnerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      setOrders(ordersData);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      let todayTotal = 0;
      let weekTotal = 0;
      let completed = 0;

      ordersData.forEach(order => {
        if (order.status === 'completed' || order.status === 'delivered') {
          completed++;

          const orderDate = order.completedAt?.toDate() || order.updatedAt?.toDate();
          if (orderDate) {
            const amount = order.totalAmount || 0;
            if (orderDate >= today) {
              todayTotal += amount;
            }
            if (orderDate >= weekAgo) {
              weekTotal += amount;
            }
          }
        }
      });

      setTodayEarnings(todayTotal);
      setWeeklyEarnings(weekTotal);
      setTotalDeliveries(completed);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('partnerId');
    localStorage.removeItem('partnerPhone');
    localStorage.removeItem('partnerName');
    router.push('/partner-login');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      const orderData = orderDoc.data();

      const timeline = orderData?.timeline || [];
      timeline.push({
        status: newStatus,
        time: Timestamp.now(),
        note: `Status updated by partner`
      });

      const updateData: any = {
        status: newStatus,
        timeline,
        updatedAt: Timestamp.now()
      };

      if (newStatus === 'completed' || newStatus === 'delivered') {
        updateData.completedAt = Timestamp.now();
      }

      await updateDoc(orderRef, updateData);
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getNextStatus = (currentStatus: string): { status: string; label: string } | null => {
    const statusFlow: Record<string, { status: string; label: string }> = {
      assigned: { status: 'picked', label: 'Mark as Picked' },
      picked: { status: 'onway', label: 'Start Delivery' },
      onway: { status: 'delivered', label: 'Mark Delivered' },
    };
    return statusFlow[currentStatus] || null;
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return !['completed', 'delivered', 'cancelled'].includes(order.status);
    }
    return ['completed', 'delivered'].includes(order.status);
  });

  const getOrderDescription = (order: Order) => {
    if (order.type === 'shopping') {
      return order.isCustomOrder
        ? order.customOrderDescription?.slice(0, 40) + '...'
        : `${order.items?.length || 0} items`;
    }
    if (order.type === 'transport' || order.type === 'ride') {
      return `${order.pickup?.name || 'Pickup'} → ${order.drop?.name || 'Drop'}`;
    }
    return order.serviceOption || 'Service';
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#059669',
        padding: '20px',
        paddingTop: '24px',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                {partner?.name || 'Partner'}
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>
                {partner?.vehicleType === 'bike' ? '🏍️' : '🛺'} {partner?.vehicleNumber}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <IndianRupee style={{ width: '20px', height: '20px', color: '#ffffff', marginBottom: '4px' }} />
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '4px 0' }}>
              {formatPrice(todayEarnings)}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Today</p>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <TrendingUp style={{ width: '20px', height: '20px', color: '#ffffff', marginBottom: '4px' }} />
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '4px 0' }}>
              {formatPrice(weeklyEarnings)}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>This Week</p>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <Package style={{ width: '20px', height: '20px', color: '#ffffff', marginBottom: '4px' }} />
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '4px 0' }}>
              {totalDeliveries}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Completed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '10px', padding: '4px' }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: activeTab === 'active' ? '#ffffff' : 'transparent',
              color: activeTab === 'active' ? '#059669' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Active Orders ({orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: activeTab === 'completed' ? '#ffffff' : 'transparent',
              color: activeTab === 'completed' ? '#059669' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Completed ({orders.filter(o => ['completed', 'delivered'].includes(o.status)).length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ padding: '0 16px 100px' }}>
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
              const nextStatus = getNextStatus(order.status);

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Order Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
                          <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                            #{order.id.slice(-6)}
                          </p>
                          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {order.status}
                        </span>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#059669', marginTop: '8px' }}>
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 12px' }}>
                      {getOrderDescription(order)}
                    </p>

                    {/* Customer Info */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      padding: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <User style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                          {order.userName}
                        </span>
                      </div>
                      <a
                        href={`tel:${order.userPhone}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#059669',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        <Phone style={{ width: '16px', height: '16px' }} />
                        {order.userPhone}
                      </a>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                        <MapPin style={{ width: '16px', height: '16px', color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                          {order.deliveryAddress.street}, {order.deliveryAddress.village}
                          {order.deliveryAddress.landmark && ` (${order.deliveryAddress.landmark})`}
                        </p>
                      </div>
                    )}

                    {/* Pickup/Drop for rides */}
                    {(order.type === 'ride' || order.type === 'transport') && order.pickup && order.drop && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%' }} />
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{order.pickup.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%' }} />
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{order.drop.name}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {nextStatus && activeTab === 'active' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress?.village || order.drop?.name || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Navigation style={{ width: '16px', height: '16px' }} />
                          Navigate
                        </a>
                        <button
                          onClick={() => updateOrderStatus(order.id, nextStatus.status)}
                          disabled={updatingOrder === order.id}
                          style={{
                            flex: 2,
                            padding: '12px',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: updatingOrder === order.id ? 'not-allowed' : 'pointer',
                            opacity: updatingOrder === order.id ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          {updatingOrder === order.id ? 'Updating...' : (
                            <>
                              <CheckCircle style={{ width: '16px', height: '16px' }} />
                              {nextStatus.label}
                            </>
                          )}
                        </button>
                      </div>
                    )}
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
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
              {activeTab === 'active' ? '📭' : '📋'}
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>
              {activeTab === 'active' ? 'No Active Orders' : 'No Completed Orders'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {activeTab === 'active'
                ? 'New orders will appear here when assigned'
                : 'Your completed deliveries will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Online/Offline Toggle */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px',
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          backgroundColor: partner?.isActive ? '#dcfce7' : '#fee2e2',
          borderRadius: '12px',
          padding: '12px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: partner?.isActive ? '#16a34a' : '#dc2626',
            borderRadius: '50%'
          }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: partner?.isActive ? '#16a34a' : '#dc2626'
          }}>
            {partner?.isActive ? 'You are Online - Ready for orders' : 'You are Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
