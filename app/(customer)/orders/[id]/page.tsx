'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, MapPin, Package, Navigation, Wrench } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

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

const orderEmojis = {
  shopping: '📦',
  transport: '🛵',
  service: '🔧',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { user } = useAuthStore();
  const { success, error: showError } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      showError('This order cannot be cancelled');
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
      success('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      showError('Failed to cancel order');
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 py-8 text-center">
        <span className="text-6xl">❓</span>
        <h2 className="text-xl font-semibold text-foreground mt-4">
          Order Not Found
        </h2>
        <p className="text-muted mt-2">This order doesn&apos;t exist or was deleted</p>
        <Button onClick={() => router.push('/orders')} className="mt-4">
          View All Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Order Details</h1>
          <p className="text-sm text-muted">#{order.id.slice(-8)}</p>
        </div>
        <Badge variant={statusVariants[order.status]}>
          {statusLabels[order.status]}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Order Type Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl">{orderEmojis[order.type]}</span>
            </div>
            <div>
              <p className="text-sm text-muted capitalize">{order.type} Order</p>
              <p className="font-semibold text-foreground">
                {order.type === 'shopping'
                  ? `${order.items?.length || 0} items`
                  : order.type === 'transport'
                  ? `${order.transportType === 'bike' ? 'Bike' : 'Auto'} Ride`
                  : order.serviceOption}
              </p>
            </div>
          </div>
        </Card>

        {/* Order Details based on type */}
        {order.type === 'shopping' && (
          <Card>
            <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-foreground">{formatPrice(item.total)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Items Total</span>
                    <span className="text-foreground">{formatPrice(order.itemsTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery Charge</span>
                    <span className="text-foreground">{formatPrice(order.deliveryCharge || 0)}</span>
                  </div>
                </div>
              </div>
            ) : order.isCustomOrder ? (
              <p className="text-sm text-muted">{order.customOrderDescription}</p>
            ) : null}

            {order.deliveryAddress && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Delivery Address</p>
                    <p className="text-sm text-muted">
                      {order.deliveryAddress.street}, {order.deliveryAddress.village}
                    </p>
                    {order.deliveryAddress.landmark && (
                      <p className="text-xs text-muted">Near {order.deliveryAddress.landmark}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {order.type === 'transport' && (
          <Card>
            <h3 className="font-semibold text-foreground mb-3">Ride Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-success mt-1" />
                <div>
                  <p className="text-xs text-muted">Pickup</p>
                  <p className="text-sm text-foreground">{order.pickup?.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                <div>
                  <p className="text-xs text-muted">Drop</p>
                  <p className="text-sm text-foreground">{order.drop?.name}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted">Distance</span>
                <span className="text-foreground">{order.distance?.toFixed(1)} km</span>
              </div>
            </div>
          </Card>
        )}

        {order.type === 'service' && (
          <Card>
            <h3 className="font-semibold text-foreground mb-3">Service Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Service Type</span>
                <span className="text-foreground capitalize">{order.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Service</span>
                <span className="text-foreground">{order.serviceOption}</span>
              </div>
              {order.preferredDate && (
                <div className="flex justify-between">
                  <span className="text-muted">Preferred Date</span>
                  <span className="text-foreground">{order.preferredDate}</span>
                </div>
              )}
              {order.preferredTime && (
                <div className="flex justify-between">
                  <span className="text-muted">Preferred Time</span>
                  <span className="text-foreground">{order.preferredTime}</span>
                </div>
              )}
              {order.description && (
                <div className="pt-2 border-t border-border">
                  <p className="text-muted">Description:</p>
                  <p className="text-foreground mt-1">{order.description}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Payment Info */}
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Payment</p>
              <p className="text-foreground font-medium capitalize">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
              </p>
            </div>
          </div>
        </Card>

        {/* Order Timeline */}
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Order Timeline</h3>
          <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
        </Card>

        {/* Assigned Team Member */}
        {order.assignedTo && (
          <Card>
            <h3 className="font-semibold text-foreground mb-3">Assigned To</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <span className="text-secondary font-bold">
                    {order.assignedName?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{order.assignedName || 'Team Member'}</p>
                  <p className="text-xs text-muted">Delivery Partner</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:+919876543210"
                  className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          {/* Contact Support */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Button>
          </a>

          {/* Cancel Order - Only for pending/confirmed */}
          {['pending', 'confirmed'].includes(order.status) && (
            <Button variant="danger" onClick={handleCancelOrder}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
