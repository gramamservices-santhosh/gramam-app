'use client';

import Link from 'next/link';
import { ShoppingCart, Clock, Phone, MessageCircle } from 'lucide-react';

const actions = [
  {
    id: 'shop',
    label: 'Shop',
    icon: ShoppingCart,
    href: '/shop',
    bgColor: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  {
    id: 'recent',
    label: 'Orders',
    icon: Clock,
    href: '/orders',
    bgColor: 'bg-secondary/15',
    iconColor: 'text-secondary',
  },
  {
    id: 'call',
    label: 'Call Us',
    icon: Phone,
    href: 'tel:+919876543210',
    bgColor: 'bg-success/15',
    iconColor: 'text-success',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    href: 'https://wa.me/919876543210',
    bgColor: 'bg-accent/15',
    iconColor: 'text-accent',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const isExternal = action.href.startsWith('http') || action.href.startsWith('tel:');

        const content = (
          <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/30 hover:bg-card transition-all">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bgColor}`}
            >
              <Icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <span className="text-xs text-foreground font-medium">{action.label}</span>
          </div>
        );

        if (isExternal) {
          return (
            <a
              key={action.id}
              href={action.href}
              target={action.href.startsWith('http') ? '_blank' : undefined}
              rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {content}
            </a>
          );
        }

        return (
          <Link key={action.id} href={action.href}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
