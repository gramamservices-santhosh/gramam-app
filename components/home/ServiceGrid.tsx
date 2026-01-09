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
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Book bike or auto rides',
    href: '/ride',
    icon: Bike,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Plumbing, electrical & more',
    href: '/services',
    icon: Wrench,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Festivals & celebrations',
    href: '/services?type=events',
    icon: PartyPopper,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
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
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-500/50 hover:shadow-md transition-all shadow-sm"
          >
            <div className={`w-11 h-11 rounded-xl ${service.iconBg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${service.iconColor}`} />
            </div>
            <h3 className="text-slate-800 font-semibold text-sm">{service.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
              {service.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
