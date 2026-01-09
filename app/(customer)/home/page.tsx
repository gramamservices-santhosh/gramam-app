'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Phone } from 'lucide-react';
import ServiceGrid from '@/components/home/ServiceGrid';
import ActiveOrders from '@/components/home/ActiveOrders';
import { CATEGORIES } from '@/constants/categories';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types';

export default function HomePage() {
  const { user } = useAuthStore();
  const [activeOrders] = useState<Order[]>([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}{firstName && `, ${firstName}`}
        </h1>
        <p className="text-muted mt-1">What do you need today?</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-8">
        <Link href="/shop" className="block">
          <div className="flex items-center gap-3 h-14 px-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
            <Search className="w-5 h-5 text-muted" />
            <span className="text-muted text-sm">Search products, services...</span>
          </div>
        </Link>
      </div>

      {/* Services Section */}
      <section className="px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Services</h2>
        </div>
        <ServiceGrid />
      </section>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <section className="px-4 mb-10">
          <ActiveOrders orders={activeOrders} />
        </section>
      )}

      {/* Categories */}
      <section className="mb-10">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Shop by Category</h2>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-sm text-primary font-medium"
          >
            See All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {CATEGORIES.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.id}`}
              className="flex-shrink-0"
            >
              <div className="w-20 flex flex-col items-center gap-2 p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
                <span className="text-2xl">{category.icon}</span>
                <span className="text-xs text-center text-foreground font-medium line-clamp-1">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Card */}
      <section className="px-4 mb-10">
        <div className="bg-primary rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">Free Delivery</h3>
              <p className="text-white/80 text-sm mt-1">
                On orders above Rs. 500
              </p>
              <Link
                href="/shop"
                className="inline-block mt-4 px-4 py-2 bg-white text-primary rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Order Now
              </Link>
            </div>
            <span className="text-5xl">🛵</span>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4">
        <div className="bg-card border border-border rounded-xl p-5 text-center">
          <p className="text-sm text-muted mb-2">Need help?</p>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            <Phone className="w-4 h-4" />
            +91 98765 43210
          </a>
          <p className="text-xs text-muted mt-2">7 AM - 9 PM</p>
        </div>
      </section>
    </div>
  );
}
