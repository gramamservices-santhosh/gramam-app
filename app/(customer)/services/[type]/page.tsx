'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { getServiceCategory, SERVICE_CATEGORIES } from '@/constants/services';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { generateOrderId } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { ServiceType } from '@/types';

export default function ServiceTypePage() {
  const params = useParams();
  const router = useRouter();
  const serviceType = params.type as string;

  const { user } = useAuthStore();
  const { success, error: showError } = useToast();

  const [selectedOption, setSelectedOption] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [address, setAddress] = useState({
    village: user?.village || '',
    street: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const service = getServiceCategory(serviceType);

  if (!service) {
    return (
      <div className="px-4 py-8 text-center">
        <span className="text-4xl">❓</span>
        <p className="text-muted mt-2">Service not found</p>
        <Button onClick={() => router.push('/services')} className="mt-4">
          Back to Services
        </Button>
      </div>
    );
  }

  const handleBookService = async () => {
    if (!user) {
      showError('Please login to book service');
      router.push('/login');
      return;
    }

    if (!selectedOption) {
      showError('Please select a service option');
      return;
    }

    if (!address.village || !address.street) {
      showError('Please enter your address');
      return;
    }

    setIsLoading(true);

    try {
      const orderId = generateOrderId();
      const option = service.options.find((o) => o.id === selectedOption);

      const order = {
        id: orderId,
        type: 'service' as const,
        userId: user.id,
        userName: user.name || 'Customer',
        userPhone: user.phone,
        userVillage: address.village,

        serviceType: serviceType as ServiceType,
        serviceOption: option?.name || selectedOption,
        description: description || undefined,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
        serviceAddress: address,
        totalAmount: 0, // Will be quoted by admin

        status: 'pending' as const,
        paymentMethod: 'cod' as const,
        paymentStatus: 'pending' as const,

        timeline: [
          {
            status: 'pending' as const,
            time: Timestamp.now(),
            note: 'Service request submitted',
          },
        ],

        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'orders', orderId), order);

      // Show success
      success('Service request submitted! We will contact you shortly.');

      // Navigate to order details
      router.push(`/orders/${orderId}`);
    } catch (err) {
      console.error('Error booking service:', err);
      showError('Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="px-4 py-4 pb-40">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {service.icon} {service.name}
          </h1>
          <p className="text-sm text-muted">{service.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Service Options */}
        <Card>
          <h3 className="font-semibold text-foreground mb-3">
            Select Service Type
          </h3>
          <div className="space-y-2">
            {service.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left',
                  selectedOption === option.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    selectedOption === option.id
                      ? 'border-primary bg-primary'
                      : 'border-muted'
                  )}
                >
                  {selectedOption === option.id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{option.name}</p>
                  {option.description && (
                    <p className="text-xs text-muted mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Problem Description */}
        <Card>
          <h3 className="font-semibold text-foreground mb-3">
            Describe Your Requirement
          </h3>
          <textarea
            placeholder="Describe the issue or what you need..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-border/30 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            rows={3}
          />
        </Card>

        {/* Preferred Date & Time */}
        <Card>
          <h3 className="font-semibold text-foreground mb-3">
            Preferred Date & Time
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={today}
            />
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Select time</option>
                <option value="07:00 AM">7:00 AM</option>
                <option value="08:00 AM">8:00 AM</option>
                <option value="09:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">2:00 PM</option>
                <option value="03:00 PM">3:00 PM</option>
                <option value="04:00 PM">4:00 PM</option>
                <option value="05:00 PM">5:00 PM</option>
                <option value="06:00 PM">6:00 PM</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card>
          <h3 className="font-semibold text-foreground mb-3">Service Address</h3>
          <div className="space-y-3">
            <Input
              label="Village/Town"
              placeholder="Enter village or town"
              value={address.village}
              onChange={(e) => setAddress({ ...address, village: e.target.value })}
            />
            <Input
              label="Street Address"
              placeholder="House no., Street name, Landmark"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
            />
          </div>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
        <div className="max-w-lg mx-auto">
          <Card className="mb-3">
            <p className="text-sm text-muted text-center">
              Our team will contact you to confirm the service and provide a quote.
            </p>
          </Card>
          <Button
            className="w-full"
            size="lg"
            onClick={handleBookService}
            isLoading={isLoading}
            disabled={!selectedOption}
          >
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  );
}
