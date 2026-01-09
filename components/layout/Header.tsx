'use client';

import { useAuthStore } from '@/store/authStore';
import { MapPin, Bell, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="px-5 py-4 flex items-center justify-between">
        {/* User Profile & Location */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <span className="text-white font-bold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <span className="text-2xl">🏘️</span>
            </Link>
          )}
          <div>
            <p className="text-xs text-muted font-medium">Deliver to</p>
            <button className="flex items-center gap-1 text-foreground font-semibold">
              <span className="truncate max-w-[140px]">
                {user?.village || 'Select Location'}
              </span>
              <ChevronDown className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Logo */}
        <Link href="/home" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <span className="text-2xl">🏘️</span>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gramam
          </span>
        </Link>

        {/* Notifications */}
        <button className="relative w-11 h-11 rounded-full bg-card/80 border border-border flex items-center justify-center hover:border-primary/50 hover:bg-card transition-all">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background" />
        </button>
      </div>
    </header>
  );
}
