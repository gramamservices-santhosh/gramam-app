'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, User, MapPin, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
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

    const user = {
      id: `demo_${phone}`,
      phone: `+91${phone}`,
      name: name.trim(),
      type: 'customer' as const,
      village: village,
      addresses: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };

    setUser(user);
    success(`Welcome, ${name}!`);
    router.replace('/home');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        {/* Logo & Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <span className="text-4xl">🏘️</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Gramam
          </h1>
          <p className="text-muted mt-2 text-base">
            Your village, your services
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              Get Started
            </h2>
            <p className="text-muted text-sm mt-1">
              Enter your details to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground-secondary">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder-muted focus:border-primary focus:ring-0 transition-colors"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground-secondary">
                Phone Number
              </label>
              <div className="flex gap-3">
                <div className="flex items-center justify-center w-16 h-14 bg-card border border-border rounded-xl text-foreground font-medium">
                  +91
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    inputMode="numeric"
                    className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder-muted focus:border-primary focus:ring-0 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Village Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground-secondary">
                Your Village/Town
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full h-14 pl-12 pr-10 bg-card border border-border rounded-xl text-foreground appearance-none cursor-pointer focus:border-primary focus:ring-0 transition-colors"
                >
                  {VILLAGES.map((v) => (
                    <option key={v} value={v} className="bg-card text-foreground">
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
              isLoading={isLoading}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 px-6">
        <p className="text-sm text-muted">
          Serving Vaniyambadi & Thirupathur District
        </p>
      </div>
    </div>
  );
}
