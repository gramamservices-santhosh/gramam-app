'use client';

import Link from 'next/link';
import { Package, Navigation, Wrench, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Order } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
}

const orderIcons = {
  shopping: Package,
  transport: Navigation,
  ride: Navigation,
  service: Wrench,
};

const orderEmojis: Record<string, string> = {
  shopping: '🛒',
  transport: '🛵',
  ride: '🛵',
  service: '🔧',
};

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

export default function OrderCard({ order }: OrderCardProps) {
  const Icon = orderIcons[order.type];

  const getOrderTitle = () => {
    switch (order.type) {
      case 'shopping':
        return order.isCustomOrder
          ? 'Custom Order'
          : `${order.items?.length || 0} items`;
      case 'transport':
      case 'ride':
        return `${(order as any).vehicleType === 'bike' ? 'Bike' : 'Auto'} Ride`;
      case 'service':
        return order.serviceOption || 'Service Request';
      default:
        return 'Order';
    }
  };

  const getOrderDescription = () => {
    switch (order.type) {
      case 'shopping':
        return order.isCustomOrder
          ? order.customOrderDescription?.slice(0, 50) + '...'
          : order.items?.map((i) => i.name).join(', ').slice(0, 50) + '...';
      case 'transport':
      case 'ride':
        return `${order.pickup?.name} → ${order.drop?.name}`;
      case 'service':
        return order.description?.slice(0, 50) || order.serviceAddress?.village;
      default:
        return '';
    }
  };

  return (
    <Link href={`/orders/${order.id}`}>
      <Card hoverable>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{orderEmojis[order.type]}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{getOrderTitle()}</h3>
                <p className="text-sm text-muted mt-0.5 line-clamp-1">
                  {getOrderDescription()}
                </p>
              </div>
              <Badge variant={statusVariants[order.status]} size="sm">
                {statusLabels[order.status]}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-primary font-bold">
                  {formatPrice(order.totalAmount)}
                </span>
                <span className="text-muted">•</span>
                <span className="text-muted">
                  {formatRelativeTime(order.createdAt)}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
