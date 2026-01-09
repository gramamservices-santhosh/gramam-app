'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { ServiceCategory } from '@/types';

interface ServiceCardProps {
  service: ServiceCategory;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`}>
      <Card hoverable className="h-full">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{service.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{service.name}</h3>
            <p className="text-sm text-muted mt-1 line-clamp-2">
              {service.description}
            </p>
            <p className="text-xs text-primary mt-2">
              {service.options.length} services available
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
