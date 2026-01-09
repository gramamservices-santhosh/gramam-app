'use client';

import Link from 'next/link';
import { ShoppingCart, Bike, Wrench, PartyPopper } from 'lucide-react';

const services = [
  {
    id: 'shopping',
    name: 'Shopping',
    description: 'Groceries, vegetables & more',
    href: '/shop',
    icon: ShoppingCart,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Book bike or auto rides',
    href: '/ride',
    icon: Bike,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Plumbing, electrical & more',
    href: '/services',
    icon: Wrench,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Festivals & celebrations',
    href: '/services?type=events',
    icon: PartyPopper,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
];

export default function ServiceGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <Link
            key={service.id}
            href={service.href}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
          >
            <div className={`w-11 h-11 rounded-xl ${service.iconBg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${service.iconColor}`} />
            </div>
            <h3 className="text-foreground font-semibold text-sm">{service.name}</h3>
            <p className="text-muted text-xs mt-0.5 line-clamp-1">
              {service.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
