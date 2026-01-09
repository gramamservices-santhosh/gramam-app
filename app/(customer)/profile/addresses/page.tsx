'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Address } from '@/types';
import { cn } from '@/lib/utils';

export default function AddressesPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { success, error: showError } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      showError('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const addresses = [...(user.addresses || [])];

      if (editingAddress) {
        // Update existing
        const index = addresses.findIndex((a) => a.id === editingAddress.id);
        if (index !== -1) {
          addresses[index] = { ...editingAddress, ...formData };
        }
      } else {
        // Add new
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
      success(editingAddress ? 'Address updated!' : 'Address added!');
      setShowModal(false);
    } catch (err) {
      console.error('Error saving address:', err);
      showError('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user) return;

    try {
      const addresses = user.addresses.filter((a) => a.id !== addressId);

      // If deleted was default, make first one default
      if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
        addresses[0].isDefault = true;
      }

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        addresses,
        updatedAt: Timestamp.now(),
      });

      setUser({ ...user, addresses });
      success('Address deleted');
    } catch (err) {
      console.error('Error deleting address:', err);
      showError('Failed to delete address');
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
      success('Default address updated');
    } catch (err) {
      console.error('Error setting default:', err);
      showError('Failed to update default address');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Saved Addresses</h1>
          <p className="text-sm text-muted">
            {user.addresses?.length || 0} addresses
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Addresses List */}
      <div className="space-y-3">
        {user.addresses && user.addresses.length > 0 ? (
          user.addresses.map((address) => (
            <Card key={address.id}>
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    address.isDefault ? 'bg-primary/20' : 'bg-border/50'
                  )}
                >
                  <MapPin
                    className={cn(
                      'w-5 h-5',
                      address.isDefault ? 'text-primary' : 'text-muted'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{address.label}</p>
                    {address.isDefault && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-0.5">
                    {address.street}, {address.village}
                  </p>
                  {address.landmark && (
                    <p className="text-xs text-muted">Near {address.landmark}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-xs text-secondary font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(address)}
                      className="text-xs text-primary font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-xs text-danger font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-foreground font-medium">No Saved Addresses</p>
            <p className="text-sm text-muted mt-1">
              Add an address for faster checkout
            </p>
            <Button onClick={() => handleOpenModal()} className="mt-4">
              <Plus className="w-5 h-5" />
              Add Address
            </Button>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAddress ? 'Edit Address' : 'Add Address'}
      >
        <div className="space-y-4">
          <Input
            label="Address Label"
            placeholder="Home, Office, etc."
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          />
          <Input
            label="Village/Town"
            placeholder="Enter village or town"
            value={formData.village}
            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
          />
          <Input
            label="Street Address"
            placeholder="House no., Street name"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          />
          <Input
            label="Landmark (Optional)"
            placeholder="Near temple, school, etc."
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
          />
          <Button className="w-full" onClick={handleSave} isLoading={isLoading}>
            {editingAddress ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
