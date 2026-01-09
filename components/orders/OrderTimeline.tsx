'use client';

import { Check, Clock, X } from 'lucide-react';
import { OrderTimeline as TimelineItem, OrderStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  timeline: TimelineItem[];
  currentStatus: OrderStatus;
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <Check className="w-4 h-4" />,
  assigned: <Check className="w-4 h-4" />,
  picked: <Check className="w-4 h-4" />,
  onway: <Check className="w-4 h-4" />,
  delivered: <Check className="w-4 h-4" />,
  completed: <Check className="w-4 h-4" />,
  cancelled: <X className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning',
  confirmed: 'bg-secondary text-secondary',
  assigned: 'bg-secondary text-secondary',
  picked: 'bg-primary text-primary',
  onway: 'bg-primary text-primary',
  delivered: 'bg-success text-success',
  completed: 'bg-success text-success',
  cancelled: 'bg-danger text-danger',
};

export default function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  return (
    <div className="space-y-4">
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1;
        const isCancelled = item.status === 'cancelled';

        return (
          <div key={index} className="relative flex gap-4">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 w-8 h-8 rounded-full flex items-center justify-center',
                isCancelled ? 'bg-danger/20' : `${statusColors[item.status].split(' ')[0]}/20`
              )}
            >
              <span className={isCancelled ? 'text-danger' : statusColors[item.status].split(' ')[1]}>
                {statusIcons[item.status]}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="font-medium text-foreground capitalize">
                {item.status.replace('_', ' ')}
              </p>
              {item.note && (
                <p className="text-sm text-muted mt-0.5">{item.note}</p>
              )}
              <p className="text-xs text-muted mt-1">
                {formatDate(item.time)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
