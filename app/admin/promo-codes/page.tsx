'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, Calendar, Copy, Check, X, IndianRupee } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableFor: 'all' | 'shopping' | 'ride' | 'service';
  createdAt: Timestamp;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [applicableFor, setApplicableFor] = useState<'all' | 'shopping' | 'ride' | 'service'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const promoRef = collection(db, 'promoCodes');
    const q = query(promoRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const codesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PromoCode[];
      setPromoCodes(codesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderValue('');
    setMaxDiscount('');
    setUsageLimit('');
    setValidFrom('');
    setValidUntil('');
    setApplicableFor('all');
    setEditingCode(null);
  };

  const openEditModal = (promo: PromoCode) => {
    setEditingCode(promo);
    setCode(promo.code);
    setDescription(promo.description);
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue.toString());
    setMinOrderValue(promo.minOrderValue.toString());
    setMaxDiscount(promo.maxDiscount?.toString() || '');
    setUsageLimit(promo.usageLimit.toString());
    setValidFrom(promo.validFrom);
    setValidUntil(promo.validUntil);
    setApplicableFor(promo.applicableFor);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!code.trim() || !discountValue || !validFrom || !validUntil) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const promoData = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: parseInt(usageLimit) || 999999,
        usedCount: editingCode?.usedCount || 0,
        validFrom,
        validUntil,
        applicableFor,
        isActive: true,
        updatedAt: Timestamp.now(),
      };

      if (editingCode) {
        await updateDoc(doc(db, 'promoCodes', editingCode.id), promoData);
      } else {
        await setDoc(doc(db, 'promoCodes', `promo_${Date.now()}`), {
          ...promoData,
          createdAt: Timestamp.now(),
        });
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving promo code:', err);
      alert('Failed to save promo code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    try {
      await updateDoc(doc(db, 'promoCodes', promo.id), {
        isActive: !promo.isActive,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error toggling promo:', err);
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      await deleteDoc(doc(db, 'promoCodes', promoId));
    } catch (err) {
      console.error('Error deleting promo:', err);
    }
  };

  const copyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Promo Codes</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Create and manage discount codes</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Promo Code
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag style={{ width: '22px', height: '22px', color: '#16a34a' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {promoCodes.filter(p => p.isActive && !isExpired(p.validUntil)).length}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Active Codes</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {promoCodes.reduce((sum, p) => sum + p.usedCount, 0)}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Total Uses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Codes List */}
      {isLoading ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Loading promo codes...</p>
        </div>
      ) : promoCodes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {promoCodes.map((promo) => {
            const expired = isExpired(promo.validUntil);
            return (
              <div
                key={promo.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  opacity: promo.isActive && !expired ? 1 : 0.7
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div
                        onClick={() => copyCode(promo.code)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1e293b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: 'monospace'
                        }}
                      >
                        {promo.code}
                        {copiedCode === promo.code ? (
                          <Check style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                        ) : (
                          <Copy style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        )}
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: promo.discountType === 'percentage' ? '#fef3c7' : '#dcfce7',
                        color: promo.discountType === 'percentage' ? '#d97706' : '#16a34a',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                      </span>
                      {expired && (
                        <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                          Expired
                        </span>
                      )}
                      {!promo.isActive && (
                        <span style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>{promo.description || 'No description'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                      <span>Min Order: ₹{promo.minOrderValue}</span>
                      {promo.maxDiscount && <span>Max Discount: ₹{promo.maxDiscount}</span>}
                      <span>Used: {promo.usedCount}/{promo.usageLimit === 999999 ? '∞' : promo.usageLimit}</span>
                      <span>Valid: {promo.validFrom} to {promo.validUntil}</span>
                      <span style={{ textTransform: 'capitalize' }}>For: {promo.applicableFor}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => toggleActive(promo)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: promo.isActive ? '#dcfce7' : '#f1f5f9',
                        color: promo.isActive ? '#16a34a' : '#64748b',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => openEditModal(promo)}
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#f1f5f9',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Edit2 style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#fef2f2',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🏷️</span>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>No Promo Codes</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Create your first promo code to offer discounts</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {editingCode ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '20px', height: '20px', color: '#64748b' }} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Code */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SAVE20"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    fontSize: '14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    boxSizing: 'border-box',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Get 20% off on first order"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    fontSize: '14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '20' : '100'}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="No limit"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Usage Limit & Applicable For */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Applicable For
                  </label>
                  <select
                    value={applicableFor}
                    onChange={(e) => setApplicableFor(e.target.value as any)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Orders</option>
                    <option value="shopping">Shopping Only</option>
                    <option value="ride">Rides Only</option>
                    <option value="service">Services Only</option>
                  </select>
                </div>
              </div>

              {/* Valid From & Until */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Valid From *
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Saving...' : (editingCode ? 'Update Promo Code' : 'Create Promo Code')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
