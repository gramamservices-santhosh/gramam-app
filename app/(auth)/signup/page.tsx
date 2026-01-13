'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

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

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { success, error: showError } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('Vaniyambadi');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please enter your name');
      return;
    }

    if (!phone || phone.length !== 10) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists
      const existingUser = await getDoc(doc(db, 'users', `user_${phone}`));

      if (existingUser.exists()) {
        showError('Account already exists. Please login instead.');
        setIsLoading(false);
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      // Create new user
      const userId = `user_${phone}`;
      const now = Timestamp.now();

      const userData: Record<string, any> = {
        id: userId,
        phone: `+91${phone}`,
        name: name.trim(),
        type: 'customer',
        village: village,
        addresses: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      // Only add email if provided
      if (email.trim()) {
        userData.email = email.trim();
      }

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), userData);

      // Set user in Zustand store
      const user = {
        id: userId,
        phone: `+91${phone}`,
        name: name.trim(),
        email: email.trim() || undefined,
        type: 'customer' as const,
        village: village,
        addresses: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      setUser(user);
      success(`Welcome to Gramam, ${name}!`);
      router.replace('/home');

    } catch (err) {
      console.error('Signup error:', err);
      showError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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

          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Sign up to get started with Gramam services</p>

          <form onSubmit={handleSignup}>

            {/* Name Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Full Name *
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Phone Number *
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

            {/* Email Field (Optional) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Email <span style={{ color: '#94a3b8' }}>(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {/* Village Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Village / Town *
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

            {/* Terms */}
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>

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
              {isLoading ? 'Creating account...' : (
                <>
                  Create Account
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

          {/* Login Link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>
              Log in
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
