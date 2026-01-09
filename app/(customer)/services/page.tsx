'use client';

import Link from 'next/link';
import { Phone, ChevronRight } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/constants/services';

const iconMap: Record<string, string> = {
  plumbing: '🔧',
  electrical: '⚡',
  medical: '🏥',
  funeral: '🕯️',
  festival: '🎵',
  decoration: '🎊',
};

const colorMap: Record<string, { bg: string; border: string }> = {
  plumbing: { bg: '#eff6ff', border: '#3b82f6' },
  electrical: { bg: '#fefce8', border: '#eab308' },
  medical: { bg: '#fef2f2', border: '#ef4444' },
  funeral: { bg: '#f5f3ff', border: '#8b5cf6' },
  festival: { bg: '#fff7ed', border: '#f97316' },
  decoration: { bg: '#fdf2f8', border: '#ec4899' },
};

export default function ServicesPage() {
  const homeServices = SERVICE_CATEGORIES.filter((s) =>
    ['plumbing', 'electrical', 'medical'].includes(s.id)
  );
  const eventServices = SERVICE_CATEGORIES.filter((s) =>
    ['funeral', 'festival', 'decoration'].includes(s.id)
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Services</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Home services & event support</p>
      </div>

      {/* Emergency Card */}
      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Need Urgent Help?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Call us for emergency services</p>
          </div>
          <a
            href="tel:+919876543210"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#ef4444',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            <Phone style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          </a>
        </div>
      </div>

      {/* Home Services */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Home Services</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {homeServices.map((service) => {
            const colors = colorMap[service.id] || { bg: '#f1f5f9', border: '#059669' };
            return (
              <Link key={service.id} href={`/services/${service.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: colors.bg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    {iconMap[service.id] || '🔧'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{service.name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{service.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>{service.options.length} options</span>
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Event Services */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Event Services</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {eventServices.map((service) => {
            const colors = colorMap[service.id] || { bg: '#f1f5f9', border: '#059669' };
            return (
              <Link key={service.id} href={`/services/${service.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: colors.bg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    {iconMap[service.id] || '🎉'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{service.name}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{service.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>{service.options.length} options</span>
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>All services by verified local professionals.</p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Payment after service completion.</p>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '8px 0', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { href: '/home', label: 'Home', icon: '🏠', active: false },
            { href: '/shop', label: 'Shop', icon: '🛒', active: false },
            { href: '/ride', label: 'Ride', icon: '🛵', active: false },
            { href: '/services', label: 'Services', icon: '🔧', active: true },
            { href: '/orders', label: 'Orders', icon: '📋', active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 12px' }}>
              <span style={{ fontSize: '20px', display: 'block' }}>{item.icon}</span>
              <span style={{ fontSize: '11px', color: item.active ? '#059669' : '#64748b', fontWeight: item.active ? '600' : '400' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
