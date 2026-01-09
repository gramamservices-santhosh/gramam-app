'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Package,
  LogOut,
  ChevronRight,
  Edit2,
  Save,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    village: user?.village || '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!formData.village.trim()) {
      alert('Please enter your village');
      return;
    }

    setIsLoading(true);

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (user) {
      setUser({
        ...user,
        name: formData.name.trim(),
        email: formData.email.trim(),
        village: formData.village.trim(),
      });
    }

    setIsLoading(false);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!user) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🔐</span>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>Login Required</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>Please login to view your profile</p>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '12px 32px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.back()}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Profile</h1>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Manage your account</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ecfdf5',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Edit2 style={{ width: '18px', height: '18px', color: '#059669' }} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        {/* Profile Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '40px', fontWeight: '700', color: '#ffffff' }}>
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'G'}
            </span>
          </div>
        </div>

        {/* Profile Form/Info */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name Input */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <User style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Email (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <Mail style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>

              {/* Village Input */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Village/Town</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Enter your village"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      village: user.village || '',
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: isLoading ? '#94a3b8' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Save style={{ width: '18px', height: '18px' }} />
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                <User style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Name</p>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b', margin: '2px 0 0' }}>{user.name || 'Not set'}</p>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                <Phone style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Phone</p>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b', margin: '2px 0 0' }}>{user.phone}</p>
                </div>
              </div>

              {/* Village */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                <MapPin style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Village</p>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b', margin: '2px 0 0' }}>{user.village || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        {!isEditing && (
          <>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <Link href="/profile/addresses" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin style={{ width: '20px', height: '20px', color: '#64748b' }} />
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b', margin: 0 }}>Saved Addresses</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>{user.addresses?.length || 0} addresses</p>
                    </div>
                  </div>
                  <ChevronRight style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                </div>
              </Link>

              <Link href="/orders" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Package style={{ width: '20px', height: '20px', color: '#64748b' }} />
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b', margin: 0 }}>My Orders</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>View order history</p>
                    </div>
                  </div>
                  <ChevronRight style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                </div>
              </Link>
            </div>

            {/* Admin Access */}
            {user.type === 'admin' && (
              <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Admin Dashboard</p>
                    <p style={{ fontSize: '13px', color: '#78716c', margin: '2px 0 0' }}>Manage orders & products</p>
                  </div>
                  <ChevronRight style={{ width: '20px', height: '20px', color: '#d97706' }} />
                </div>
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut style={{ width: '18px', height: '18px' }} />
              Logout
            </button>

            {/* App Info */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Gramam v1.0.0</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Serving Vaniyambadi & Thirupathur District</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
