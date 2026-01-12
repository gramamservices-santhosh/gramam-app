'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Image, Video, Upload } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

interface Ad {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  duration: number;
  isActive: boolean;
  createdAt: any;
}

export default function AdsManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'image' as 'image' | 'video',
    url: '',
    duration: 5,
  });
  const [saving, setSaving] = useState(false);

  // Fetch ads
  useEffect(() => {
    const adsRef = collection(db, 'advertisements');
    const q = query(adsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ad[];
      setAds(adsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddAd = async () => {
    if (!formData.title || !formData.url) return;

    setSaving(true);
    try {
      const adId = `ad_${Date.now()}`;
      await setDoc(doc(db, 'advertisements', adId), {
        title: formData.title,
        type: formData.type,
        url: formData.url,
        duration: formData.duration,
        isActive: true,
        createdAt: Timestamp.now(),
      });

      setFormData({ title: '', type: 'image', url: '', duration: 5 });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding ad:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      await updateDoc(doc(db, 'advertisements', ad.id), {
        isActive: !ad.isActive,
      });
    } catch (error) {
      console.error('Error updating ad:', error);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      await deleteDoc(doc(db, 'advertisements', adId));
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Advertisement Management</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Upload and manage ads shown to users</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Add New Ad
        </button>
      </div>

      {/* Add Ad Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' }}>Add New Advertisement</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Title *
              </label>
              <input
                type="text"
                placeholder="Ad title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'image' | 'video' })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Media URL * (Direct link to image/video)
              </label>
              <input
                type="url"
                placeholder="https://example.com/ad-image.jpg"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                Upload your image/video to Firebase Storage or any hosting and paste the URL here
              </p>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Display Duration (seconds)
              </label>
              <input
                type="number"
                min="3"
                max="30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 5 })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Preview */}
          {formData.url && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Preview
              </label>
              <div style={{
                width: '200px',
                height: '120px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {formData.type === 'video' ? (
                  <video src={formData.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  <img src={formData.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleAddAd}
              disabled={saving || !formData.title || !formData.url}
              style={{
                padding: '12px 24px',
                backgroundColor: saving || !formData.title || !formData.url ? '#94a3b8' : '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving || !formData.title || !formData.url ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save Ad'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ title: '', type: 'image', url: '', duration: 5 });
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ads List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#64748b' }}>Loading ads...</p>
        </div>
      ) : ads.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <Upload style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px' }}>No Advertisements</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Add your first ad to show to users before booking</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {ads.map((ad) => (
            <div
              key={ad.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {/* Media Preview */}
              <div style={{
                height: '160px',
                backgroundColor: '#f1f5f9',
                position: 'relative'
              }}>
                {ad.type === 'video' ? (
                  <video src={ad.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  <img src={ad.url} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}

                {/* Type Badge */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {ad.type === 'video' ? <Video style={{ width: '12px', height: '12px' }} /> : <Image style={{ width: '12px', height: '12px' }} />}
                  {ad.type}
                </div>

                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: ad.isActive ? '#059669' : '#94a3b8',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {ad.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' }}>{ad.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Duration: {ad.duration}s</p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleToggleActive(ad)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: ad.isActive ? '#fef3c7' : '#ecfdf5',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: ad.isActive ? '#d97706' : '#059669',
                      cursor: 'pointer'
                    }}
                  >
                    {ad.isActive ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                    {ad.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fef2f2',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '24px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '0 0 8px' }}>How Ads Work</h4>
        <ul style={{ fontSize: '13px', color: '#374151', margin: 0, paddingLeft: '20px' }}>
          <li>Users must watch the ad for the set duration before they can book</li>
          <li>Only active ads are shown to users</li>
          <li>If multiple ads are active, the most recent one is shown</li>
          <li>Upload images/videos to Firebase Storage and paste the URL</li>
        </ul>
      </div>
    </div>
  );
}
