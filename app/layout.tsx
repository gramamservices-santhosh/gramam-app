import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Gramam - Village Super App',
  description: 'Your Village, Your Services - Thirupathur District. Order groceries, book rides, and access services from Vaniyambadi.',
  keywords: ['Gramam', 'Vaniyambadi', 'Thirupathur', 'delivery', 'transport', 'village app'],
  authors: [{ name: 'Gramam Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A1A2E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ToastProvider>
          <main className="min-h-screen">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
