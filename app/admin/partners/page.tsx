'use client';

import { useState, useEffect } from 'react';
import { Eye, Check, X, Phone, MapPin, Car, FileText, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';

interface Partner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  village: string;
  address: string;
  emergencyContact: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel?: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  documents: {
    aadharNumber?: string;
    panNumber?: string;
    licenseNumber?: string;
    rcNumber?: string;
    // Legacy fields for old data
    aadharFront?: string;
    aadharBack?: string;
    drivingLicense?: string;
    selfie?: string;
    panCard?: string;
    vehicleRC?: string;
    vehiclePhoto?: string;
  };
  createdAt: any;
  updatedAt: any;
}

export default function PartnersManagementPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const partnersRef = collection(db, 'partners');
    const q = query(partnersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partnersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Partner[];
      setPartners(partnersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (partnerId: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'partners', partnerId), {
        status: status,
        isActive: status === 'approved',
        updatedAt: Timestamp.now(),
      });
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error updating partner:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (partnerId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'partners', partnerId), {
        isActive: !currentStatus,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error toggling partner status:', error);
    }
  };

  const filteredPartners = partners.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return { bg: '#ecfdf5', text: '#059669' };
      case 'rejected': return { bg: '#fef2f2', text: '#dc2626' };
      default: return { bg: '#fef3c7', text: '#d97706' };
    }
  };

  const getVehicleIcon = (type: string) => {
    return type === 'auto' ? '🛺' : '🏍️';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Partner Management</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Review and manage rider/delivery partner registrations</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', count: partners.length, color: '#3b82f6' },
          { label: 'Pending', count: partners.filter(p => p.status === 'pending').length, color: '#d97706' },
          { label: 'Approved', count: partners.filter(p => p.status === 'approved').length, color: '#059669' },
          { label: 'Rejected', count: partners.filter(p => p.status === 'rejected').length, color: '#dc2626' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color, margin: 0 }}>{stat.count}</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 20px',
              backgroundColor: filter === f ? '#059669' : '#f1f5f9',
              color: filter === f ? '#ffffff' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Partners List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#64748b' }}>Loading partners...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <User style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>No Partners Found</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {filter === 'all' ? 'No partner registrations yet' : `No ${filter} partners`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Vehicle Icon */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    backgroundColor: partner.vehicleType === 'auto' ? '#fef3c7' : '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '28px' }}>{partner.vehicleType === 'auto' ? '🛺' : '🏍️'}</span>
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{partner.name}</h3>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: getStatusColor(partner.status).bg,
                        color: getStatusColor(partner.status).text,
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {partner.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        {partner.phone}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '14px', height: '14px' }} />
                        {partner.village}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {getVehicleIcon(partner.vehicleType)} {partner.vehicleNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {partner.status === 'approved' && (
                    <button
                      onClick={() => handleToggleActive(partner.id, partner.isActive)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: partner.isActive ? '#ecfdf5' : '#f1f5f9',
                        color: partner.isActive ? '#059669' : '#64748b',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {partner.isActive ? 'Active' : 'Inactive'}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPartner(partner)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye style={{ width: '16px', height: '16px' }} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Partner Details</h2>
              <button
                onClick={() => setSelectedPartner(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '18px', height: '18px', color: '#64748b' }} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Partner Info */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '12px',
                  backgroundColor: selectedPartner.vehicleType === 'auto' ? '#fef3c7' : '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '48px' }}>{selectedPartner.vehicleType === 'auto' ? '🛺' : '🏍️'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>{selectedPartner.name}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      <strong>Phone:</strong> {selectedPartner.phone}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      <strong>Village:</strong> {selectedPartner.village}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      <strong>Vehicle:</strong> {getVehicleIcon(selectedPartner.vehicleType)} {selectedPartner.vehicleNumber}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      <strong>Registered:</strong> {formatDate(selectedPartner.createdAt)}
                    </p>
                  </div>
                  {selectedPartner.email && (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 0' }}>
                      <strong>Email:</strong> {selectedPartner.email}
                    </p>
                  )}
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 0' }}>
                    <strong>Address:</strong> {selectedPartner.address}
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 0' }}>
                    <strong>Emergency Contact:</strong> {selectedPartner.emergencyContact}
                  </p>
                </div>
              </div>

              {/* Document Numbers */}
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>Document Details</h4>
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase' }}>Aadhar Number</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0, letterSpacing: '1px' }}>
                      {selectedPartner.documents?.aadharNumber || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase' }}>PAN Number</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>
                      {selectedPartner.documents?.panNumber || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase' }}>Driving License</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>
                      {selectedPartner.documents?.licenseNumber || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase' }}>Vehicle RC Number</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>
                      {selectedPartner.documents?.rcNumber || selectedPartner.vehicleNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                padding: '16px',
                backgroundColor: getStatusColor(selectedPartner.status).bg,
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: getStatusColor(selectedPartner.status).text, margin: 0, textTransform: 'capitalize' }}>
                  Status: {selectedPartner.status}
                </p>
              </div>

              {/* Action Buttons */}
              {selectedPartner.status === 'pending' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedPartner.id, 'approved')}
                    disabled={updating}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px',
                      backgroundColor: updating ? '#94a3b8' : '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: updating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Check style={{ width: '18px', height: '18px' }} />
                    Approve Partner
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPartner.id, 'rejected')}
                    disabled={updating}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px',
                      backgroundColor: updating ? '#94a3b8' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: updating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <X style={{ width: '18px', height: '18px' }} />
                    Reject Partner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
