'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, User, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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

  const handleDemoLogin = async (e: React.FormEvent) => {
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

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create demo user (no Firebase required)
    const demoUser = {
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

    setUser(demoUser);
    success(`Welcome, ${name}!`);
    router.replace('/home');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary via-primary-dark to-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-bounce">🏘️</div>
          <h1 className="text-4xl font-bold text-white">Gramam</h1>
          <p className="text-white/80 mt-1">Your Village, Your Services</p>
          <div className="inline-block mt-3 px-4 py-1.5 bg-white/20 rounded-full text-sm text-white/90">
            <MapPin className="w-4 h-4 inline mr-1" />
            Thirupathur District
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-1">Get Started</h2>
            <p className="text-white/70 text-sm mb-6">
              Enter your details to continue
            </p>

            <form onSubmit={handleDemoLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Your Name
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl">
                  <User className="w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium">
                    +91
                  </div>
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl">
                    <Phone className="w-5 h-5 text-white/60" />
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={10}
                      inputMode="numeric"
                      className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Your Village/Town
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl">
                  <MapPin className="w-5 h-5 text-white/60" />
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="flex-1 bg-transparent text-white outline-none appearance-none cursor-pointer"
                  >
                    {VILLAGES.map((v) => (
                      <option key={v} value={v} className="bg-gray-800 text-white">
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-black font-bold"
                size="lg"
                isLoading={isLoading}
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-white/60 mt-4 px-4">
            Demo mode - No OTP verification required
          </p>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-sm text-white/50">
          Serving Vaniyambadi & Thirupathur District
        </p>
      </div>
    </div>
  );
}
