'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Timestamp } from 'firebase/firestore';

const VILLAGES = [
  'Vaniyambadi',
  'Alangayam',
  'Jolarpet',
  'Tirupathur',
  'Ambur',
  'Natrampalli',
  'Odugathur',
  'Pallalakuppam',
  'Vellakuttai',
  'Pernambut',
  'Yelagiri',
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { success, error: showError } = useToast();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('Vaniyambadi');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length !== 10) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!name.trim()) {
      showError('Please enter your name');
      return;
    }

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Admin login with special phone number
    const isAdmin = phone === '1234567890';

    const user = {
      id: `demo_${phone}`,
      phone: `+91${phone}`,
      name: name.trim(),
      type: isAdmin ? 'admin' as const : 'customer' as const,
      village: village,
      addresses: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };

    setUser(user);

    if (isAdmin) {
      success(`Welcome Admin, ${name}!`);
      router.replace('/admin/dashboard');
    } else {
      success(`Welcome, ${name}!`);
      router.replace('/home');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#d1fae5',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '40px' }}>🏘️</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0' }}>Gramam</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Your Village, Your Services</p>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        }}>

          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Log in</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Enter your details to continue</p>

          <form onSubmit={handleLogin}>

            {/* Name Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Phone Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '64px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#475569',
                  flexShrink: 0
                }}>
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={10}
                  inputMode="numeric"
                  style={{
                    flex: 1,
                    height: '48px',
                    padding: '0 16px',
                    fontSize: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Village Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Village / Town
              </label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                {VILLAGES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link href="/forgot-password" style={{ fontSize: '14px', color: '#059669', textDecoration: 'none', fontWeight: '500' }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Please wait...' : (
                <>
                  Continue
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Sign Up Link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', margin: 0 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '24px' }}>
          Serving Vaniyambadi & Thirupathur District
        </p>
      </div>
    </div>
  );
}
