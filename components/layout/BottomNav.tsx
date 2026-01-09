'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Navigation, Wrench, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/ride', label: 'Ride', icon: Navigation },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-h-0 min-w-0',
                  isActive
                    ? 'text-primary'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.href === '/shop' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-accent rounded-full text-[10px] text-white font-semibold flex items-center justify-center px-1">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[11px]',
                  isActive ? 'font-semibold' : 'font-medium'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
