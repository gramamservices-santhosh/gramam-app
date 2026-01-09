'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Navigation, Wrench, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

const navItems = [
  {
    href: '/home',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/shop',
    label: 'Shop',
    icon: ShoppingBag,
  },
  {
    href: '/ride',
    label: 'Ride',
    icon: Navigation,
  },
  {
    href: '/services',
    label: 'Services',
    icon: Wrench,
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: ClipboardList,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[480px] safe-area-bottom">
      <div className="mx-4 mb-4">
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/30 px-2 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  <div className="relative">
                    {isActive && (
                      <div className="absolute inset-0 -m-2 bg-primary/15 rounded-xl" />
                    )}
                    <Icon
                      className={cn(
                        'relative w-5 h-5 transition-all duration-200',
                        isActive && 'scale-110'
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.href === '/shop' && cartCount > 0 && (
                      <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] bg-primary rounded-full text-[10px] text-white font-bold flex items-center justify-center px-1 shadow-lg">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] transition-all duration-200',
                      isActive ? 'font-bold' : 'font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
