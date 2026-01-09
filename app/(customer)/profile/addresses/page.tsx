'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Address } from '@/types';

export default function AddressesPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    village: '',
    street: '',
    landmark: '',
  });

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        village: address.village,
        street: address.street,
        landmark: address.landmark,
      });
    } else {
      setEditingAddress(null);
      setFormData({ label: '', village: '', street: '', landmark: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.label.trim() || !formData.village.trim() || !formData.street.trim()) {
      setError('Please fill all required fields');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);

    try {
      const addresses = [...(user.addresses || [])];

      if (editingAddress) {
        const index = addresses.findIndex((a) => a.id === editingAddress.id);
        if (index !== -1) {
          addresses[index] = { ...editingAddress, ...formData };
        }
      } else {
        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          ...formData,
          isDefault: addresses.length === 0,
        };
        addresses.push(newAddress);
      }

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        addresses,
        updatedAt: Timestamp.now(),
      });

      setUser({ ...user, addresses });
      setSuccessMsg(editingAddress ? 'Address updated!' : 'Address added!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user) return;

    try {
      const addresses = user.addresses.filter((a) => a.id !== addressId);

      if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
        addresses[0].isDefault = true;
      }

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        addresses,
        updatedAt: Timestamp.now(),
      });

      setUser({ ...user, addresses });
      setSuccessMsg('Address deleted');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      const addresses = user.addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        addresses,
        updatedAt: Timestamp.now(),
      });

      setUser({ ...user, addresses });
      setSuccessMsg('Default address updated');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error setting default:', err);
      setError('Failed to update default address');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '96px' }}>
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
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Saved Addresses</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>
            {user.addresses?.length || 0} addresses
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#059669', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus style={{ width: '20px', height: '20px', color: '#ffffff' }} />
        </button>
      </div>

      {/* Addresses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {user.addresses && user.addresses.length > 0 ? (
          user.addresses.map((address) => (
            <div key={address.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: address.isDefault ? '#ecfdf5' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin style={{ width: '20px', height: '20px', color: address.isDefault ? '#059669' : '#64748b' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{address.label}</p>
                    {address.isDefault && (
                      <span style={{ fontSize: '11px', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '20px' }}>
                        Default
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    {address.street}, {address.village}
                  </p>
                  {address.landmark && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Near {address.landmark}</p>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Check style={{ width: '12px', height: '12px' }} />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(address)}
                      style={{ fontSize: '12px', color: '#059669', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Edit2 style={{ width: '12px', height: '12px' }} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 style={{ width: '12px', height: '12px' }} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px 16px', textAlign: 'center' }}>
            <MapPin style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b', margin: 0 }}>No Saved Addresses</p>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              Add an address for faster checkout
            </p>
            <button
              onClick={() => handleOpenModal()}
              style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              Add Address
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '24px', height: '24px', color: '#64748b' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Address Label</label>
                <input
                  type="text"
                  placeholder="Home, Office, etc."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Village/Town</label>
                <input
                  type="text"
                  placeholder="Enter village or town"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Street Address</label>
                <input
                  type="text"
                  placeholder="House no., Street name"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near temple, school, etc."
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: isLoading ? '#94a3b8' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
