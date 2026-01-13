'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, User, CheckCircle, XCircle, Truck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

// Different status flows for different order types
const STATUS_FLOWS: Record<string, string[]> = {
  shopping: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'],
  ride: ['pending', 'confirmed', 'driver_on_way', 'arrived', 'in_progress', 'completed'],
  service: ['pending', 'confirmed', 'technician_assigned', 'in_progress', 'completed'],
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  driver_on_way: 'Driver On Way',
  arrived: 'Driver Arrived',
  in_progress: 'In Progress',
  completed: 'Completed',
  technician_assigned: 'Technician Assigned',
  cancelled: 'Cancelled',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#dbeafe', text: '#2563eb' },
  preparing: { bg: '#e0e7ff', text: '#4f46e5' },
  out_for_delivery: { bg: '#dbeafe', text: '#2563eb' },
  delivered: { bg: '#dcfce7', text: '#16a34a' },
  driver_on_way: { bg: '#fef3c7', text: '#d97706' },
  arrived: { bg: '#dbeafe', text: '#2563eb' },
  in_progress: { bg: '#e0e7ff', text: '#4f46e5' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  technician_assigned: { bg: '#dbeafe', text: '#2563eb' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const orderRef = doc(db, 'orders', id);
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as Order);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setSuccessMsg(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
    setIsUpdating(false);
  };

  const getStatusFlow = () => {
    if (!order) return STATUS_FLOWS.shopping;
    return STATUS_FLOWS[order.type] || STATUS_FLOWS.shopping;
  };

  const getNextStatus = () => {
    if (!order) return null;
    const statusFlow = getStatusFlow();
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '32px', height: '32px', border: '4px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>Order not found</p>
        <button onClick={() => router.back()} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Go Back
        </button>
      </div>
    );
  }

  const nextStatus = getNextStatus();
  const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };

  return (
    <div>
      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>{successMsg}</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Order #{order.id.slice(-6)}</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{formatDate(order.createdAt)}</p>
        </div>
        <span style={{ marginLeft: 'auto', padding: '6px 16px', backgroundColor: statusColor.bg, color: statusColor.text, borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Info */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Customer Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User style={{ width: '20px', height: '20px', color: '#64748b' }} />
                <span style={{ color: '#1e293b' }}>{order.userName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone style={{ width: '20px', height: '20px', color: '#64748b' }} />
                <span style={{ color: '#1e293b' }}>{order.userPhone}</span>
              </div>
              {order.deliveryAddress && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: '#64748b', marginTop: '2px' }} />
                  <div>
                    <p style={{ color: '#1e293b', margin: 0 }}>{order.deliveryAddress.street}</p>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>{order.deliveryAddress.village}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Order Items</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: index < (order.items?.length || 0) - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#1e293b', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>{formatPrice(item.price)} x {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: '500', color: '#1e293b' }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ride Details */}
          {order.type === 'transport' && order.pickup && order.drop && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Ride Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Pickup</p>
                    <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{order.pickup.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Dropoff</p>
                    <p style={{ color: '#1e293b', margin: '2px 0 0' }}>{order.drop.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Vehicle</span>
                  <span style={{ color: '#1e293b', textTransform: 'capitalize' }}>{order.transportType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Distance</span>
                  <span style={{ color: '#1e293b' }}>{order.distance?.toFixed(1)} km</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Details */}
          {order.type === 'service' && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Service Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Service Type</span>
                  <span style={{ color: '#1e293b', textTransform: 'capitalize' }}>{order.serviceType}</span>
                </div>
                {order.serviceOption && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Service</span>
                    <span style={{ color: '#1e293b' }}>{order.serviceOption}</span>
                  </div>
                )}
                {order.description && (
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ color: '#64748b', margin: '0 0 4px' }}>Description</p>
                    <p style={{ color: '#1e293b', margin: 0 }}>{order.description}</p>
                  </div>
                )}
                {order.preferredDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Scheduled</span>
                    <span style={{ color: '#1e293b' }}>{order.preferredDate} {order.preferredTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Summary */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ color: '#1e293b' }}>{formatPrice(order.itemsTotal || order.totalAmount)}</span>
              </div>
              {order.deliveryCharge !== undefined && order.deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Delivery</span>
                  <span style={{ color: '#1e293b' }}>{formatPrice(order.deliveryCharge)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus('confirmed')}
                    disabled={isUpdating}
                    style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isUpdating ? 0.7 : 1 }}
                  >
                    <CheckCircle style={{ width: '18px', height: '18px' }} />
                    Accept Order
                  </button>
                  <button
                    onClick={() => updateStatus('cancelled')}
                    disabled={isUpdating}
                    style={{ width: '100%', padding: '14px', backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isUpdating ? 0.7 : 1 }}
                  >
                    <XCircle style={{ width: '18px', height: '18px' }} />
                    Reject Order
                  </button>
                </>
              )}
              {nextStatus && order.status !== 'pending' && order.status !== 'cancelled' && (
                <button
                  onClick={() => updateStatus(nextStatus)}
                  disabled={isUpdating}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isUpdating ? 0.7 : 1 }}
                >
                  {(nextStatus === 'out_for_delivery' || nextStatus === 'driver_on_way') && <Truck style={{ width: '18px', height: '18px' }} />}
                  {(nextStatus === 'delivered' || nextStatus === 'completed') && <CheckCircle style={{ width: '18px', height: '18px' }} />}
                  Mark as {STATUS_LABELS[nextStatus] || nextStatus}
                </button>
              )}
              {(order.status === 'delivered' || order.status === 'completed') && (
                <p style={{ textAlign: 'center', color: '#16a34a', fontWeight: '500' }}>Order Completed</p>
              )}
              {order.status === 'cancelled' && (
                <p style={{ textAlign: 'center', color: '#dc2626', fontWeight: '500' }}>Order Cancelled</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Order Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getStatusFlow().map((status, index) => {
                const statusFlow = getStatusFlow();
                const currentIndex = statusFlow.indexOf(order.status);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#16a34a' : '#e2e8f0',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none'
                    }} />
                    <span style={{
                      color: isCompleted ? '#1e293b' : '#94a3b8',
                      fontWeight: isCurrent ? '600' : '400'
                    }}>
                      {STATUS_LABELS[status] || status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
