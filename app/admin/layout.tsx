'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UsersRound,
  Settings,
  LogOut,
  Home,
  Megaphone,
  Bike
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/partners', label: 'Partners', icon: Bike },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/ads', label: 'Advertisements', icon: Megaphone },
  { href: '/admin/team', label: 'Team', icon: UsersRound },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.type !== 'admin')) {
      router.replace('/home');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Show loading or redirect for non-admin users
  if (isLoading || !isAuthenticated || user?.type !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔐</span>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🏘️</span>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Gramam</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Admin Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#059669' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                <Icon style={{ width: '20px', height: '20px' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
          <Link
            href="/home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#64748b',
              fontWeight: '500',
              fontSize: '14px',
              marginBottom: '8px'
            }}
          >
            <Home style={{ width: '20px', height: '20px' }} />
            <span>Customer App</span>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: 'none',
              color: '#dc2626',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <LogOut style={{ width: '20px', height: '20px' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '260px', padding: '24px', flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
