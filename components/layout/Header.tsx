'use client';

import { useAuthStore } from '@/store/authStore';
import { Bell, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { user, isAuthenticated } = useAuthStore();

  const firstName = user?.name?.split(' ')[0] || 'Guest';
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Profile & Location */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            >
              <span className="text-white font-semibold text-sm">
                {initial}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center"
            >
              <span className="text-lg">🏘️</span>
            </Link>
          )}
          <button className="flex flex-col items-start min-h-0 min-w-0">
            <span className="text-xs text-muted">Deliver to</span>
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              <span className="truncate max-w-[120px]">
                {user?.village || 'Select location'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
            </span>
          </button>
        </div>

        {/* Center: Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <span className="text-xl">🏘️</span>
          <span className="text-lg font-bold text-foreground">
            Gramam
          </span>
        </Link>

        {/* Right: Notifications */}
        <button className="relative w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-elevated transition-colors min-h-0 min-w-0">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
        </button>
      </div>
    </header>
  );
}
