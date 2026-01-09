'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, Clock, User, CheckCircle, XCircle, Truck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
    setIsUpdating(false);
  };

  const getNextStatus = () => {
    if (!order) return null;
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'primary' | 'secondary' | 'success' | 'danger'> = {
      pending: 'warning',
      confirmed: 'primary',
      preparing: 'secondary',
      out_for_delivery: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'warning'}>{status.replace('_', ' ')}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground font-medium">Order not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const nextStatus = getNextStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order #{order.id.slice(-6)}</h1>
          <p className="text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">{getStatusBadge(order.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted" />
                <span className="text-foreground">{order.userName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted" />
                <span className="text-foreground">{order.userPhone}</span>
              </div>
              {order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted mt-0.5" />
                  <div>
                    <p className="text-foreground">{order.deliveryAddress.label}</p>
                    <p className="text-sm text-muted">{order.deliveryAddress.address}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Ride Details */}
          {order.type === 'transport' && order.rideDetails && (
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">Ride Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <div>
                    <p className="text-sm text-muted">Pickup</p>
                    <p className="text-foreground">{order.rideDetails.pickup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div>
                    <p className="text-sm text-muted">Dropoff</p>
                    <p className="text-foreground">{order.rideDetails.dropoff}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Vehicle</span>
                  <span className="text-foreground capitalize">{order.rideDetails.vehicleType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Distance</span>
                  <span className="text-foreground">{order.rideDetails.distance} km</span>
                </div>
              </div>
            </Card>
          )}

          {/* Service Details */}
          {order.type === 'service' && order.serviceDetails && (
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">Service Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Service Type</span>
                  <span className="text-foreground capitalize">{order.serviceDetails.serviceType}</span>
                </div>
                {order.serviceDetails.subService && (
                  <div className="flex justify-between">
                    <span className="text-muted">Sub-service</span>
                    <span className="text-foreground">{order.serviceDetails.subService}</span>
                  </div>
                )}
                {order.serviceDetails.description && (
                  <div>
                    <p className="text-muted mb-1">Description</p>
                    <p className="text-foreground">{order.serviceDetails.description}</p>
                  </div>
                )}
                {order.serviceDetails.scheduledDate && (
                  <div className="flex justify-between">
                    <span className="text-muted">Scheduled</span>
                    <span className="text-foreground">{order.serviceDetails.scheduledDate}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-foreground">{formatPrice(order.itemsTotal || order.totalAmount)}</span>
              </div>
              {order.deliveryCharge !== undefined && order.deliveryCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Delivery</span>
                  <span className="text-foreground">{formatPrice(order.deliveryCharge)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary text-xl">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-3">
              {order.status === 'pending' && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => updateStatus('confirmed')}
                    isLoading={isUpdating}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Order
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-danger border-danger"
                    onClick={() => updateStatus('cancelled')}
                    isLoading={isUpdating}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Order
                  </Button>
                </>
              )}
              {nextStatus && order.status !== 'pending' && order.status !== 'cancelled' && (
                <Button
                  className="w-full"
                  onClick={() => updateStatus(nextStatus)}
                  isLoading={isUpdating}
                >
                  {nextStatus === 'out_for_delivery' && <Truck className="w-4 h-4" />}
                  {nextStatus === 'delivered' && <CheckCircle className="w-4 h-4" />}
                  Mark as {nextStatus.replace('_', ' ')}
                </Button>
              )}
              {order.status === 'delivered' && (
                <p className="text-center text-success font-medium">Order Completed</p>
              )}
              {order.status === 'cancelled' && (
                <p className="text-center text-danger font-medium">Order Cancelled</p>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {STATUS_FLOW.map((status, index) => {
                const currentIndex = STATUS_FLOW.indexOf(order.status);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={status} className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCompleted ? 'bg-success' : 'bg-border'
                      } ${isCurrent ? 'ring-2 ring-success ring-offset-2 ring-offset-card' : ''}`}
                    />
                    <span
                      className={`capitalize ${
                        isCompleted ? 'text-foreground' : 'text-muted'
                      } ${isCurrent ? 'font-medium' : ''}`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
