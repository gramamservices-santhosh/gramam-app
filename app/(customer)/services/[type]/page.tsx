'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { getServiceCategory } from '@/constants/services';
import { useAuthStore } from '@/store/authStore';
import { generateOrderId } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ServiceType } from '@/types';
import AdModal from '@/components/ads/AdModal';

export default function ServiceTypePage() {
  const params = useParams();
  const router = useRouter();
  const serviceType = params.type as string;

  const { user } = useAuthStore();

  const [selectedOption, setSelectedOption] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [address, setAddress] = useState({
    village: user?.village || '',
    street: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [showAd, setShowAd] = useState(false);

  // Wait for Firebase Auth to initialize
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthReady(true);
      if (!firebaseUser && !user) {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [user, router]);

  const service = getServiceCategory(serviceType);

  if (!service) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>❓</span>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Service not found</p>
        <button
          onClick={() => router.push('/services')}
          style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          Back to Services
        </button>
      </div>
    );
  }

  // Validate and show ad
  const handleShowAd = () => {
    // Wait for auth to be ready
    if (!authReady) {
      setError('Please wait, loading...');
      setTimeout(() => setError(''), 2000);
      return;
    }

    // Check if Firebase Auth session is still active
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Please login to book service.');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    if (!selectedOption) {
      setError('Please select a service option');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!address.village || !address.street) {
      setError('Please enter your address');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Show ad before booking
    setShowAd(true);
  };

  // Actually book after ad is watched
  const handleBookService = async () => {
    setShowAd(false);
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('Please login to book service.');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      const orderId = generateOrderId();
      const option = service.options.find((o) => o.id === selectedOption);

      const order: Record<string, any> = {
        id: orderId,
        type: 'service',
        userId: currentUser.uid,
        userName: user?.name || currentUser.displayName || 'Customer',
        userPhone: user?.phone || currentUser.phoneNumber || '',
        userVillage: address.village,
        serviceType: serviceType,
        serviceOption: option?.name || selectedOption,
        serviceAddress: address,
        totalAmount: 0,
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        timeline: [
          {
            status: 'pending',
            time: Timestamp.now(),
            note: 'Service request submitted',
          },
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Only add optional fields if they have values (Firestore rejects undefined)
      if (description) order.description = description;
      if (preferredDate) order.preferredDate = preferredDate;
      if (preferredTime) order.preferredTime = preferredTime;

      await setDoc(doc(db, 'orders', orderId), order);

      setSuccessMsg('Service request submitted! We will contact you shortly.');
      router.push(`/orders/${orderId}`);
    } catch (err) {
      console.error('Error booking service:', err);
      setError('Failed to submit request. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '16px', paddingBottom: '180px' }}>
      {/* Ad Modal */}
      {showAd && (
        <AdModal onComplete={handleBookService} />
      )}

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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            {service.icon} {service.name}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>{service.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Service Options */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>
            Select Service Type
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {service.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: selectedOption === option.id ? '2px solid #059669' : '1px solid #e2e8f0',
                  backgroundColor: selectedOption === option.id ? '#ecfdf5' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: selectedOption === option.id ? '2px solid #059669' : '2px solid #94a3b8',
                  backgroundColor: selectedOption === option.id ? '#059669' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedOption === option.id && (
                    <Check style={{ width: '12px', height: '12px', color: '#ffffff' }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{option.name}</p>
                  {option.description && (
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Problem Description */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>
            Describe Your Requirement
          </h3>
          <textarea
            placeholder="Describe the issue or what you need..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#1e293b',
              resize: 'none',
              boxSizing: 'border-box',
              outline: 'none'
            }}
            rows={3}
          />
        </div>

        {/* Preferred Date & Time */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>
            Preferred Date & Time
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={today}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Time</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
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
        </div>

        {/* Address */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Service Address</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Village/Town</label>
              <input
                type="text"
                placeholder="Enter village or town"
                value={address.village}
                onChange={(e) => setAddress({ ...address, village: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Street Address</label>
              <input
                type="text"
                placeholder="House no., Street name, Landmark"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ position: 'fixed', bottom: '80px', left: 0, right: 0, padding: '16px', zIndex: 40 }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: 0 }}>
              Our team will contact you to confirm the service and provide a quote.
            </p>
          </div>
          <button
            onClick={handleShowAd}
            disabled={isLoading || !selectedOption}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isLoading || !selectedOption ? '#94a3b8' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || !selectedOption ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
