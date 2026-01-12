'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Send, Package, Truck, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { generateOrderId } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AdModal from '@/components/ads/AdModal';

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [orderList, setOrderList] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState({
    village: user?.village || '',
    street: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  // Validate before showing ad
  const handleShowAd = () => {
    // Wait for auth to be ready
    if (!authReady) {
      setError('Please wait, loading...');
      setTimeout(() => setError(''), 2000);
      return;
    }

    // Check auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Please login to place order');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    if (!orderList.trim()) {
      setError('Please enter what items you need');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!address.village || !address.street) {
      setError('Please enter your delivery address');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Show ad before booking
    setShowAd(true);
  };

  // Actually submit after ad is watched
  const handleSubmitOrder = async () => {
    setShowAd(false);
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('Please login to place order');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      const orderId = generateOrderId();

      const order: Record<string, any> = {
        id: orderId,
        type: 'shopping',
        userId: currentUser.uid,
        userName: user?.name || currentUser.displayName || 'Customer',
        userPhone: user?.phone || currentUser.phoneNumber || '',
        userVillage: address.village,
        isCustomOrder: true,
        customOrderDescription: orderList.trim(),
        deliveryAddress: {
          village: address.village,
          street: address.street,
        },
        itemsTotal: 0,
        deliveryCharge: 0,
        totalAmount: 0,
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        timeline: [
          {
            status: 'pending',
            time: Timestamp.now(),
            note: 'Shopping request submitted',
          },
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (notes.trim()) {
        order.notes = notes.trim();
      }

      await setDoc(doc(db, 'orders', orderId), order);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 2000);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to submit order. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <Package style={{ width: '40px', height: '40px', color: '#059669' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px', textAlign: 'center' }}>Order Submitted!</h1>
        <p style={{ fontSize: '16px', color: '#64748b', textAlign: 'center', margin: 0 }}>Our team will call you shortly to confirm your order.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Ad Modal */}
      {showAd && (
        <AdModal onComplete={handleSubmitOrder} />
      )}

      {/* Error Toast */}
      {error && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.back()} style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Shopping Request</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>Tell us what you need</p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div style={{ padding: '16px' }}>
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#059669', margin: '0 0 12px' }}>How it works</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>1</span>
              </div>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>Write what items you need (groceries, vegetables, medicines, etc.)</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone style={{ width: '14px', height: '14px', color: '#ffffff' }} />
              </div>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>Our team will call you to confirm items and price</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck style={{ width: '14px', height: '14px', color: '#ffffff' }} />
              </div>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>We buy and deliver to your door. Delivery: ₹50-100 based on distance</p>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Items List */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag style={{ width: '18px', height: '18px', color: '#059669' }} />
              What do you need?
            </h3>
            <textarea
              placeholder="Example:
- 1 kg Rice
- 500g Tomatoes
- 1 packet Milk
- Paracetamol tablets
- 2 kg Sugar"
              value={orderList}
              onChange={(e) => setOrderList(e.target.value)}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#1e293b',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Additional Notes */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Additional Notes (Optional)</h3>
            <input
              type="text"
              placeholder="Any specific brand preferences or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Delivery Address */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Delivery Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Village/Town *</label>
                <input
                  type="text"
                  placeholder="Enter your village or town"
                  value={address.village}
                  onChange={(e) => setAddress({ ...address, village: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#1e293b',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Street Address *</label>
                <input
                  type="text"
                  placeholder="House no., Street name, Landmark"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#1e293b',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ position: 'fixed', bottom: '70px', left: 0, right: 0, padding: '16px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button
            onClick={handleShowAd}
            disabled={isLoading || !orderList.trim()}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isLoading || !orderList.trim() ? '#94a3b8' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || !orderList.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? 'Submitting...' : (
              <>
                <Send style={{ width: '20px', height: '20px' }} />
                Submit Shopping Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '8px 0', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { href: '/home', label: 'Home', icon: '🏠', active: false },
            { href: '/shop', label: 'Shop', icon: '🛒', active: true },
            { href: '/ride', label: 'Ride', icon: '🛵', active: false },
            { href: '/services', label: 'Services', icon: '🔧', active: false },
            { href: '/orders', label: 'Orders', icon: '📋', active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 12px' }}>
              <span style={{ fontSize: '20px', display: 'block' }}>{item.icon}</span>
              <span style={{ fontSize: '11px', color: item.active ? '#059669' : '#64748b', fontWeight: item.active ? '600' : '400' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
