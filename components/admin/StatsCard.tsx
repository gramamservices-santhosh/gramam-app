'use client';

import Card from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isCurrency?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const colorClasses = {
  primary: 'bg-primary/20 text-primary',
  secondary: 'bg-secondary/20 text-secondary',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/20 text-danger',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  isCurrency = false,
  color = 'primary',
}: StatsCardProps) {
  const displayValue = isCurrency
    ? formatPrice(typeof value === 'number' ? value : parseFloat(value as string))
    : value;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{displayValue}</p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-2 font-medium',
                trend.isPositive ? 'text-success' : 'text-danger'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from yesterday
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
