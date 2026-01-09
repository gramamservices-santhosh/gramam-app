'use client';

import Link from 'next/link';
import { Package, Navigation, Wrench, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Order } from '@/types';
import { formatRelativeTime, getStatusColor, getStatusBg } from '@/lib/utils';

interface ActiveOrdersProps {
  orders: Order[];
}

const orderIcons = {
  shopping: Package,
  transport: Navigation,
  service: Wrench,
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

export default function ActiveOrders({ orders }: ActiveOrdersProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Active Orders</h2>
        <Link
          href="/orders"
          className="text-sm text-primary flex items-center gap-1 hover:underline"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {orders.slice(0, 2).map((order) => {
          const Icon = orderIcons[order.type];

          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card
                hoverable
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {order.type === 'shopping'
                        ? `${order.items?.length || 0} items`
                        : order.type === 'transport'
                        ? `${order.pickup?.name} → ${order.drop?.name}`
                        : order.serviceOption}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {formatRelativeTime(order.createdAt)}
                  </p>
                </div>

                <Badge
                  variant={
                    order.status === 'completed' || order.status === 'delivered'
                      ? 'success'
                      : order.status === 'cancelled'
                      ? 'danger'
                      : order.status === 'onway' || order.status === 'picked'
                      ? 'primary'
                      : 'warning'
                  }
                  size="sm"
                >
                  {statusLabels[order.status]}
                </Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
