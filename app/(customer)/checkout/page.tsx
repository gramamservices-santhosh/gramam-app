'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, CreditCard, Banknote, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, calculateDeliveryCharge, generateOrderId } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, customOrderDescription, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses?.find((a) => a.isDefault)?.id || user?.addresses?.[0]?.id || ''
  );
  const [error, setError] = useState('');
  const [newAddress, setNewAddress] = useState({ village: '', street: '', landmark: '' });

  const selectedAddress = user?.addresses?.find((a) => a.id === selectedAddressId);
  const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
  const deliveryCharge = calculateDeliveryCharge(5);
  const grandTotal = itemsTotal + deliveryCharge;

  const handleAddAddress = () => {
    setError('Please add address in profile settings');
    setTimeout(() => setError(''), 3000);
    setShowAddressModal(false);
  };

  const handlePlaceOrder = async () => {
    // Check if Firebase Auth session is still active
    const currentUser = auth.currentUser;
    if (!currentUser || !user) {
      setError('Session expired. Please login again.');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    if (!selectedAddress && items.length > 0) {
      setError('Please select a delivery address');
      return;
    }
    if (items.length === 0 && !customOrderDescription) {
      setError('Your cart is empty');
      return;
    }
    setIsLoading(true);
    try {
      const orderId = generateOrderId();
      const order = {
        id: orderId, type: 'shopping' as const, userId: user.id,
        userName: user.name || 'Customer', userPhone: user.phone,
        userVillage: selectedAddress?.village || user.village || '',
        items: items.map((item) => ({ productId: item.productId, name: item.name, price: item.price, quantity: item.quantity, total: item.total })),
        itemsTotal, deliveryCharge, totalAmount: grandTotal,
        deliveryAddress: selectedAddress ? { village: selectedAddress.village, street: selectedAddress.street, landmark: selectedAddress.landmark } : undefined,
        isCustomOrder: !!customOrderDescription, customOrderDescription: customOrderDescription || undefined,
        status: 'pending' as const, paymentMethod, paymentStatus: 'pending' as const,
        timeline: [{ status: 'pending' as const, time: Timestamp.now(), note: 'Order placed' }],
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
      };
      await setDoc(doc(db, 'orders', orderId), order);
      clearCart();
      alert('Order placed successfully!');
      router.push(`/orders/${orderId}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '220px' }}>
      {error && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '18px', height: '18px', color: '#dc2626' }} /></button>
        </div>
      )}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.back()} style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Checkout</h1>
        </div>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ width: '18px', height: '18px', color: '#059669' }} />Delivery Address
            </h3>
            <button onClick={() => setShowAddressModal(true)} style={{ fontSize: '14px', color: '#059669', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>{selectedAddress ? 'Change' : 'Add'}</button>
          </div>
          {selectedAddress ? (
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{selectedAddress.label}</p>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{selectedAddress.street}, {selectedAddress.village}</p>
              {selectedAddress.landmark && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Near {selectedAddress.landmark}</p>}
            </div>
          ) : user?.addresses && user.addresses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {user.addresses.map((addr) => (
                <button key={addr.id} onClick={() => setSelectedAddressId(addr.id)} style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '10px', border: selectedAddressId === addr.id ? '2px solid #059669' : '1px solid #e2e8f0', backgroundColor: selectedAddressId === addr.id ? '#ecfdf5' : '#ffffff', cursor: 'pointer' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{addr.label}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{addr.street}, {addr.village}</p>
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setShowAddressModal(true)} style={{ width: '100%', border: '2px dashed #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Plus style={{ width: '20px', height: '20px', color: '#64748b' }} />
              <span style={{ fontSize: '14px', color: '#64748b' }}>Add Delivery Address</span>
            </button>
          )}
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Order Items ({items.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>{item.name} x {item.quantity}</span>
                <span style={{ color: '#1e293b' }}>{formatPrice(item.total)}</span>
              </div>
            ))}
            {customOrderDescription && (
              <div style={{ fontSize: '13px', color: '#64748b', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '500', color: '#f97316' }}>Custom Request:</span> {customOrderDescription}
              </div>
            )}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Payment Method</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setPaymentMethod('cod')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', border: paymentMethod === 'cod' ? '2px solid #059669' : '1px solid #e2e8f0', backgroundColor: paymentMethod === 'cod' ? '#ecfdf5' : '#ffffff', cursor: 'pointer', textAlign: 'left' }}>
              <Banknote style={{ width: '20px', height: '20px', color: '#22c55e' }} />
              <div><p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Cash on Delivery</p><p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Pay when you receive</p></div>
            </button>
            <button onClick={() => setPaymentMethod('online')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', border: paymentMethod === 'online' ? '2px solid #059669' : '1px solid #e2e8f0', backgroundColor: paymentMethod === 'online' ? '#ecfdf5' : '#ffffff', cursor: 'pointer', textAlign: 'left' }}>
              <CreditCard style={{ width: '20px', height: '20px', color: '#f97316' }} />
              <div><p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Online Payment</p><p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>UPI, Cards, Net Banking</p></div>
            </button>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: '70px', left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '16px', zIndex: 40 }}>
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '14px', color: '#64748b' }}>Items Total</span><span style={{ fontSize: '14px', color: '#1e293b' }}>{formatPrice(itemsTotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '14px', color: '#64748b' }}>Delivery Charge</span><span style={{ fontSize: '14px', color: '#1e293b' }}>{formatPrice(deliveryCharge)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}><span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Total</span><span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{formatPrice(grandTotal)}</span></div>
        </div>
        <button onClick={handlePlaceOrder} disabled={isLoading} style={{ width: '100%', padding: '16px', backgroundColor: isLoading ? '#94a3b8' : '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer' }}>{isLoading ? 'Placing Order...' : 'Place Order'}</button>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '8px 0', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[{ href: '/home', label: 'Home', icon: '🏠', active: false },{ href: '/shop', label: 'Shop', icon: '🛒', active: true },{ href: '/ride', label: 'Ride', icon: '🛵', active: false },{ href: '/services', label: 'Services', icon: '🔧', active: false },{ href: '/orders', label: 'Orders', icon: '📋', active: false }].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 12px' }}><span style={{ fontSize: '20px', display: 'block' }}>{item.icon}</span><span style={{ fontSize: '11px', color: item.active ? '#059669' : '#64748b', fontWeight: item.active ? '600' : '400' }}>{item.label}</span></Link>
          ))}
        </div>
      </div>
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Add Address</h2>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: '24px', height: '24px', color: '#64748b' }} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Village/Town</label><input type="text" placeholder="Enter village or town name" value={newAddress.village} onChange={(e) => setNewAddress({ ...newAddress, village: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Street Address</label><input type="text" placeholder="House no., Street name" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Landmark</label><input type="text" placeholder="Near temple, school, etc." value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }} /></div>
              <button onClick={handleAddAddress} style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Save Address</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
