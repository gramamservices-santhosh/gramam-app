'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function PartnerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const handleLogin = async () => {
    setError('');

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Check if partner exists and is approved
      const partnersRef = collection(db, 'partners');
      const q = query(partnersRef, where('phone', '==', `+91${phone}`));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('No partner account found with this phone number');
        setIsLoading(false);
        return;
      }

      const partnerData = snapshot.docs[0].data();

      if (partnerData.status === 'pending') {
        setError('Your account is still pending approval. Please wait for verification.');
        setIsLoading(false);
        return;
      }

      if (partnerData.status === 'rejected') {
        setError('Your registration was rejected. Please contact support.');
        setIsLoading(false);
        return;
      }

      if (!partnerData.isActive) {
        setError('Your account is currently inactive. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Store partner info in localStorage and redirect
      localStorage.setItem('partnerId', snapshot.docs[0].id);
      localStorage.setItem('partnerPhone', `+91${phone}`);
      localStorage.setItem('partnerName', partnerData.name);

      router.push('/partner-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '48px' }}>🏍️</span>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '16px 0 8px' }}>Partner Login</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Login to access your dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Login Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Phone Number
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '60px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#475569',
                flexShrink: 0
              }}>
                +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                style={{
                  flex: 1,
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || phone.length !== 10}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: phone.length === 10 ? '#059669' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: phone.length === 10 && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? 'Logging in...' : (
              <>
                Login
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </>
            )}
          </button>
        </div>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Not registered yet?{' '}
            <Link href="/partner-register" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>
              Register as Partner
            </Link>
          </p>
        </div>

        {/* Customer Login */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none' }}>
            Login as Customer
          </Link>
        </div>
      </div>
    </div>
  );
}
