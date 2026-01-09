'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import ServiceGrid from '@/components/home/ServiceGrid';
import QuickActions from '@/components/home/QuickActions';
import ActiveOrders from '@/components/home/ActiveOrders';
import Card from '@/components/ui/Card';
import { CATEGORIES } from '@/constants/categories';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types';

export default function HomePage() {
  const { user } = useAuthStore();
  const [activeOrders] = useState<Order[]>([]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="px-5 py-6 space-y-8">
      {/* Greeting Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-muted">What do you need today?</p>
      </div>

      {/* Search Bar */}
      <Link href="/shop" className="block">
        <div className="flex items-center gap-3 px-4 py-4 bg-card/60 border border-border rounded-2xl hover:border-primary/40 transition-all hover:bg-card">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <span className="text-muted flex-1">Search for products, services...</span>
        </div>
      </Link>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Services */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Our Services</h2>
        <ServiceGrid />
      </section>

      {/* Active Orders */}
      <ActiveOrders orders={activeOrders} />

      {/* Categories Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Shop by Category</h2>
          <Link
            href="/shop"
            className="text-sm text-primary flex items-center gap-1 font-medium hover:underline"
          >
            See All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
          {CATEGORIES.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.id}`}
              className="flex-shrink-0"
            >
              <div className="w-[85px] flex flex-col items-center gap-2 p-3 rounded-2xl bg-card/60 border border-border hover:border-primary/40 hover:bg-card transition-all">
                <span className="text-3xl">{category.icon}</span>
                <span className="text-xs text-center text-foreground font-medium leading-tight">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-6 shadow-xl shadow-primary/20">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-white font-bold text-xl">Free Delivery!</h3>
            <p className="text-white/80 text-sm">
              On orders above Rs. 500 within 5km
            </p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-5 py-2 bg-white text-primary rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Order Now
            </Link>
          </div>
          <div className="text-6xl opacity-90">🛵</div>
        </div>
        {/* Background decoration */}
        <div className="absolute -right-8 -bottom-8 text-[120px] opacity-10">🛵</div>
      </div>

      {/* Contact Info */}
      <Card className="text-center py-6">
        <p className="text-muted text-sm mb-2">Need help with your order?</p>
        <a
          href="tel:+919876543210"
          className="text-primary font-bold text-xl block hover:underline"
        >
          +91 98765 43210
        </a>
        <p className="text-xs text-muted mt-2">Available 7 AM - 9 PM</p>
      </Card>
    </div>
  );
}
