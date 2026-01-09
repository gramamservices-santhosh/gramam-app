'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { verifyOTP, sendOTP, setupRecaptcha, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { User } from '@/types';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { phoneNumber, setUser } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/login');
    }
  }, [phoneNumber, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setupRecaptcha('recaptcha-container');
      await sendOTP(phoneNumber);
      setResendTimer(30);
      setSuccessMsg('OTP sent successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);

    try {
      const firebaseUser = await verifyOTP(otpString);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      let user: User;

      if (userDoc.exists()) {
        user = { id: userDoc.id, ...userDoc.data() } as User;
      } else {
        user = {
          id: firebaseUser.uid,
          phone: `+91${phoneNumber}`,
          name: '',
          type: 'customer',
          village: '',
          addresses: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isActive: true,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), user);
      }

      setUser(user);
      setSuccessMsg('Login successful!');

      if (!user.name || !user.village) {
        router.replace('/profile?setup=true');
      } else {
        router.replace('/home');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Invalid OTP. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '32px 24px', backgroundColor: '#f8fafc' }}>
      {/* Error Toast */}
      {error && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>{successMsg}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
      >
        <ArrowLeft style={{ width: '20px', height: '20px' }} />
        <span>Back</span>
      </button>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '384px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Verify OTP</h1>
            <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
              Enter the 6-digit code sent to{' '}
              <span style={{ color: '#1e293b', fontWeight: '500' }}>+91 {phoneNumber}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: '700',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#1e293b',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {resendTimer > 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  Resend OTP in <span style={{ color: '#059669', fontWeight: '500' }}>{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  style={{ color: '#059669', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: isLoading ? '#94a3b8' : '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
              {!isLoading && <ArrowRight style={{ width: '20px', height: '20px' }} />}
            </button>
          </form>

          {/* reCAPTCHA container */}
          <div id="recaptcha-container" />
        </div>
      </div>
    </div>
  );
}
