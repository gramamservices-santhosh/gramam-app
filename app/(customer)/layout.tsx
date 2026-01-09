'use client';

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* App Container - Mobile First Design */}
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <Header />
        <main style={{ paddingBottom: '96px' }}>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
