'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, MapPin, Star, Send } from 'lucide-react';
import OrderTimeline from '@/components/orders/OrderTimeline';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  assigned: 'Assigned',
  picked: 'Picked Up',
  onway: 'On the Way',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#e0e7ff', text: '#4f46e5' },
  assigned: { bg: '#e0e7ff', text: '#4f46e5' },
  picked: { bg: '#dbeafe', text: '#2563eb' },
  onway: { bg: '#dbeafe', text: '#2563eb' },
  delivered: { bg: '#dcfce7', text: '#16a34a' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

const orderEmojis: Record<string, string> = {
  shopping: '📦',
  transport: '🛵',
  service: '🔧',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Rating states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (doc) => {
        if (doc.exists()) {
          setOrder({ id: doc.id, ...doc.data() } as Order);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching order:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order || !user) return;

    if (!['pending', 'confirmed'].includes(order.status)) {
      setError('This order cannot be cancelled');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now(),
        timeline: [
          ...order.timeline,
          {
            status: 'cancelled',
            time: Timestamp.now(),
            note: 'Order cancelled by customer',
          },
        ],
      });
      setSuccessMsg('Order cancelled successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmitReview = async () => {
    if (!order || !rating) {
      setError('Please select a rating');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsSubmittingReview(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        rating,
        review: review.trim() || null,
        reviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setSuccessMsg('Thank you for your feedback!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', height: '80px' }} />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: '64px', display: 'block' }}>❓</span>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginTop: '16px' }}>
          Order Not Found
        </h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>This order doesn&apos;t exist or was deleted</p>
        <button
          onClick={() => router.push('/orders')}
          style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          View All Orders
        </button>
      </div>
    );
  }

  const statusColor = statusColors[order.status] || { bg: '#f1f5f9', text: '#64748b' };

  return (
    <div style={{ padding: '16px', paddingBottom: '160px' }}>
      {/* Error Toast */}
      {error && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Order Details</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>#{order.id.slice(-8)}</p>
        </div>
        <span style={{ padding: '4px 12px', backgroundColor: statusColor.bg, color: statusColor.text, borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
          {statusLabels[order.status]}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Order Type Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px' }}>{orderEmojis[order.type]}</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, textTransform: 'capitalize' }}>{order.type} Order</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '2px 0 0' }}>
                {order.type === 'shopping'
                  ? `${order.items?.length || 0} items`
                  : order.type === 'transport'
                  ? `${order.transportType === 'bike' ? 'Bike' : 'Auto'} Ride`
                  : order.serviceOption}
              </p>
            </div>
          </div>
        </div>

        {/* Shopping Order Items */}
        {order.type === 'shopping' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Order Items</h3>
            {order.items && order.items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>{item.name} x {item.quantity}</span>
                    <span style={{ color: '#1e293b' }}>{formatPrice(item.total)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>Items Total</span>
                    <span style={{ color: '#1e293b' }}>{formatPrice(order.itemsTotal || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '4px' }}>
                    <span style={{ color: '#64748b' }}>Delivery Charge</span>
                    <span style={{ color: '#1e293b' }}>{formatPrice(order.deliveryCharge || 0)}</span>
                  </div>
                </div>
              </div>
            ) : order.isCustomOrder ? (
              <p style={{ fontSize: '14px', color: '#64748b' }}>{order.customOrderDescription}</p>
            ) : null}

            {order.deliveryAddress && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: '#059669', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Delivery Address</p>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>
                      {order.deliveryAddress.street}, {order.deliveryAddress.village}
                    </p>
                    {order.deliveryAddress.landmark && (
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Near {order.deliveryAddress.landmark}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transport Order Details */}
        {order.type === 'transport' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Ride Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16a34a', marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Pickup</p>
                  <p style={{ fontSize: '14px', color: '#1e293b', margin: '2px 0 0' }}>{order.pickup?.name}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669', marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Drop</p>
                  <p style={{ fontSize: '14px', color: '#1e293b', margin: '2px 0 0' }}>{order.drop?.name}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Distance</span>
                <span style={{ color: '#1e293b' }}>{order.distance?.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        )}

        {/* Service Order Details */}
        {order.type === 'service' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Service Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Service Type</span>
                <span style={{ color: '#1e293b', textTransform: 'capitalize' }}>{order.serviceType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Service</span>
                <span style={{ color: '#1e293b' }}>{order.serviceOption}</span>
              </div>
              {order.preferredDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Preferred Date</span>
                  <span style={{ color: '#1e293b' }}>{order.preferredDate}</span>
                </div>
              )}
              {order.preferredTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Preferred Time</span>
                  <span style={{ color: '#1e293b' }}>{order.preferredTime}</span>
                </div>
              )}
              {order.description && (
                <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>Description:</p>
                  <p style={{ color: '#1e293b', marginTop: '4px' }}>{order.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Total Amount</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669', margin: '4px 0 0' }}>
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Payment</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '4px 0 0', textTransform: 'capitalize' }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Order Timeline</h3>
          <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
        </div>

        {/* Assigned Team Member */}
        {order.assignedTo && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Assigned To</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#2563eb', fontWeight: '700' }}>
                    {order.assignedName?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{order.assignedName || 'Team Member'}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Delivery Partner</p>
                </div>
              </div>
              <a
                href="tel:+919876543210"
                style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Phone style={{ width: '20px', height: '20px', color: '#16a34a' }} />
              </a>
            </div>
          </div>
        )}

        {/* Rating & Review Section - Show for completed orders */}
        {['delivered', 'completed'].includes(order.status) && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>
              {order.rating ? 'Your Review' : 'Rate Your Order'}
            </h3>

            {order.rating ? (
              // Show existing review
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      style={{
                        width: '24px',
                        height: '24px',
                        fill: star <= order.rating! ? '#f59e0b' : 'transparent',
                        color: star <= order.rating! ? '#f59e0b' : '#e2e8f0'
                      }}
                    />
                  ))}
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', marginLeft: '4px' }}>
                    {order.rating}/5
                  </span>
                </div>
                {order.review && (
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: 0,
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    fontStyle: 'italic'
                  }}>
                    &quot;{order.review}&quot;
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '12px 0 0' }}>
                  Thank you for your feedback!
                </p>
              </div>
            ) : (
              // Show review form
              <div>
                {/* Star Rating */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px' }}>How was your experience?</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Star
                          style={{
                            width: '32px',
                            height: '32px',
                            fill: star <= (hoverRating || rating) ? '#f59e0b' : 'transparent',
                            color: star <= (hoverRating || rating) ? '#f59e0b' : '#e2e8f0',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p style={{ fontSize: '13px', color: '#f59e0b', margin: '8px 0 0', fontWeight: '500' }}>
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent!'}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                    Write a review (optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitReview}
                  disabled={!rating || isSubmittingReview}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: rating ? '#059669' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: rating && !isSubmittingReview ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmittingReview ? 'Submitting...' : (
                    <>
                      <Send style={{ width: '16px', height: '16px' }} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ position: 'fixed', bottom: '70px', left: 0, right: 0, padding: '16px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', zIndex: 40 }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', gap: '12px' }}>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <button style={{ width: '100%', padding: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <MessageCircle style={{ width: '20px', height: '20px' }} />
              Contact Support
            </button>
          </a>

          {['pending', 'confirmed'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              style={{ padding: '14px 24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#dc2626', cursor: 'pointer' }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
