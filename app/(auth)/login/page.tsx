'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Admin credentials (hardcoded)
const ADMIN_PHONE = '8667510724';
const ADMIN_PASSWORD = 'AGM635701';
const ADMIN_NAME = 'admin';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { success, error: showError } = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    setIsLoading(true);

    try {
      // Check if admin login
      if (phone === ADMIN_PHONE) {
        if (!password) {
          showError('Please enter admin password');
          setIsLoading(false);
          return;
        }

        if (password !== ADMIN_PASSWORD) {
          showError('Invalid admin password');
          setIsLoading(false);
          return;
        }

        // Admin login successful
        const adminUser = {
          id: 'admin_8667510724',
          phone: '+918667510724',
          name: ADMIN_NAME,
          type: 'admin' as const,
          village: 'Vaniyambadi',
          addresses: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isActive: true,
        };

        setUser(adminUser);
        success('Welcome Admin!');
        router.replace('/admin/dashboard');
        return;
      }

      // Customer login - check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', `user_${phone}`));

      if (!userDoc.exists()) {
        showError('Account not found. Please sign up first.');
        setIsLoading(false);
        setTimeout(() => router.push('/signup'), 1500);
        return;
      }

      const userData = userDoc.data();
      const user = {
        id: userData.id || `user_${phone}`,
        phone: userData.phone || `+91${phone}`,
        name: userData.name || 'Customer',
        email: userData.email,
        type: 'customer' as const,
        village: userData.village || 'Vaniyambadi',
        addresses: userData.addresses || [],
        createdAt: userData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
      };

      setUser(user);
      success(`Welcome back, ${user.name}!`);
      router.replace('/home');

    } catch (err) {
      console.error('Login error:', err);
      showError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminPhone = phone === ADMIN_PHONE;

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
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
            {isAdminPhone ? 'Enter admin password to continue' : 'Enter your phone number to continue'}
          </p>

          <form onSubmit={handleLogin}>

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

            {/* Password Field (only for admin) */}
            {isAdminPhone && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Admin Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 48px 0 16px',
                      fontSize: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '20px', height: '20px', color: '#64748b' }} />
                    ) : (
                      <Eye style={{ width: '20px', height: '20px', color: '#64748b' }} />
                    )}
                  </button>
                </div>
              </div>
            )}

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
                  {isAdminPhone ? 'Login as Admin' : 'Continue'}
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
            New to Gramam?{' '}
            <Link href="/signup" style={{ color: '#059669', fontWeight: '600', textDecoration: 'none' }}>
              Create account
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
