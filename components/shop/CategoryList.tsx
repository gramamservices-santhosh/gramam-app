'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/constants/categories';
import { cn } from '@/lib/utils';

export default function CategoryList() {
  const pathname = usePathname();
  const currentCategory = pathname.split('/').pop();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/shop"
        className={cn(
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          currentCategory === 'shop' || pathname === '/shop'
            ? 'bg-primary text-white'
            : 'bg-card border border-border text-foreground hover:border-primary/50'
        )}
      >
        All
      </Link>
      {CATEGORIES.map((category) => (
        <Link
          key={category.id}
          href={`/shop/${category.id}`}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            currentCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-card border border-border text-foreground hover:border-primary/50'
          )}
        >
          {category.icon} {category.name}
        </Link>
      ))}
    </div>
  );
}
