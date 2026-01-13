'use client';

import Link from 'next/link';
import { Search, ChevronRight, Phone, ShoppingCart, Bike, Wrench, PartyPopper } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const services = [
  { id: 'shopping', name: 'Shopping', description: 'Write what you need', href: '/shop', icon: ShoppingCart, color: '#3b82f6', bg: '#eff6ff' },
  { id: 'transport', name: 'Ride', description: 'Bike or auto rides', href: '/ride', icon: Bike, color: '#f97316', bg: '#fff7ed' },
  { id: 'services', name: 'Services', description: 'Plumbing, electrical & more', href: '/services', icon: Wrench, color: '#059669', bg: '#ecfdf5' },
  { id: 'events', name: 'Events', description: 'Festivals & ceremonies', href: '/services?type=events', icon: PartyPopper, color: '#8b5cf6', bg: '#f5f3ff' },
];

export default function HomePage() {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>{firstName.charAt(0) || 'G'}</span>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Deliver to</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{user?.village || 'Vaniyambadi'} ▾</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏘️</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Gramam</span>
          </div>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ padding: '24px 16px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          {getGreeting()}{firstName && `, ${firstName}`}
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>What do you need today?</p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <Link href="/shop" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            height: '48px',
            padding: '0 16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Search style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>Tell us what you need...</span>
          </div>
        </Link>
      </div>

      {/* Services Grid */}
      <div style={{ padding: '0 16px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Our Services</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.id} href={service.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: service.bg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <Icon style={{ width: '22px', height: '22px', color: service.color }} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{service.name}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{service.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '0 16px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>How It Works</h2>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '14px' }}>1</span>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Tell Us What You Need</h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Write a list of items or describe your service need</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '14px' }}>2</span>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>We Call You</h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Our team will call to confirm details and pricing</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '14px' }}>3</span>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Delivered to Your Door</h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Get your items or service delivered at your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Card */}
      <div style={{ padding: '0 16px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: '#059669',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>Delivery Charge</h3>
            <p style={{ fontSize: '14px', color: '#a7f3d0', marginTop: '4px' }}>Only Rs. 50-100 per order</p>
            <Link href="/shop" style={{
              display: 'inline-block',
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              color: '#059669',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Order Now
            </Link>
          </div>
          <span style={{ fontSize: '48px' }}>🛵</span>
        </div>
      </div>

      {/* Contact */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, marginBottom: '8px' }}>Need help?</p>
          <a href="tel:+919876543210" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: '600', fontSize: '16px', textDecoration: 'none' }}>
            <Phone style={{ width: '18px', height: '18px' }} />
            +91 98765 43210
          </a>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>7 AM - 9 PM</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '8px 0',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { href: '/home', label: 'Home', icon: '🏠', active: true },
            { href: '/shop', label: 'Shop', icon: '🛒', active: false },
            { href: '/ride', label: 'Ride', icon: '🛵', active: false },
            { href: '/services', label: 'Services', icon: '🔧', active: false },
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
