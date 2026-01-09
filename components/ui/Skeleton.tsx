'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Preset skeleton components
export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <Skeleton height={120} className="w-full" />
      <Skeleton height={20} className="w-3/4" />
      <Skeleton height={16} className="w-1/2" />
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
      <Skeleton height={100} className="w-full" />
      <Skeleton height={16} className="w-full" />
      <Skeleton height={14} className="w-1/2" />
      <div className="flex justify-between items-center">
        <Skeleton height={20} width={60} />
        <Skeleton height={32} width={32} variant="circular" />
      </div>
    </div>
  );
}

export function SkeletonOrderCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton height={20} width={120} />
        <Skeleton height={24} width={80} />
      </div>
      <Skeleton height={16} className="w-full" />
      <Skeleton height={16} className="w-3/4" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton height={14} width={100} />
        <Skeleton height={36} width={100} />
      </div>
    </div>
  );
}

export function SkeletonLocationItem() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton height={40} width={40} variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton height={16} className="w-3/4" />
        <Skeleton height={12} className="w-1/2" />
      </div>
    </div>
  );
}
