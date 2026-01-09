'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { verifyOTP, sendOTP, setupRecaptcha, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/Toast';
import { User } from '@/types';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { phoneNumber, setUser } = useAuthStore();
  const { success, error: showError } = useToast();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no phone number
  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/login');
    }
  }, [phoneNumber, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
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

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setupRecaptcha('recaptcha-container');
      await sendOTP(phoneNumber);
      setResendTimer(30);
      success('OTP sent successfully!');
    } catch (err) {
      console.error('Error resending OTP:', err);
      showError('Failed to resend OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP
      const firebaseUser = await verifyOTP(otpString);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      let user: User;

      if (userDoc.exists()) {
        // Existing user
        user = { id: userDoc.id, ...userDoc.data() } as User;
      } else {
        // New user - create profile
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

      // Update auth store
      setUser(user);
      success('Login successful!');

      // Navigate to home or profile setup
      if (!user.name || !user.village) {
        router.replace('/profile?setup=true');
      } else {
        router.replace('/home');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      showError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📱</div>
            <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
            <p className="text-muted mt-2">
              Enter the 6-digit code sent to{' '}
              <span className="text-foreground font-medium">+91 {phoneNumber}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-2">
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
                  className="w-12 h-14 text-center text-xl font-bold bg-card border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-muted text-sm">
                  Resend OTP in <span className="text-primary font-medium">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Verify & Continue
            </Button>
          </form>

          {/* reCAPTCHA container */}
          <div id="recaptcha-container" />
        </div>
      </div>
    </div>
  );
}
