'use client';

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* App Container - Mobile First Design */}
      <div className="max-w-[480px] mx-auto min-h-screen bg-background relative shadow-2xl shadow-black/50">
        <Header />
        <main className="pb-24">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
