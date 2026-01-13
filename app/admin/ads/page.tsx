'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Eye, EyeOff, Image, Video, Upload, X } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-detect type
    if (file.type.startsWith('video/')) {
      setFormData({ ...formData, type: 'video' });
    } else {
      setFormData({ ...formData, type: 'image' });
    }
  };

  const handleUploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `ads/${timestamp}_${selectedFile.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddAd = async () => {
    if (!formData.title || (!formData.url && !selectedFile)) return;

    setSaving(true);
    try {
      let finalUrl = formData.url;

      // Upload file if selected
      if (selectedFile) {
        const uploadedUrl = await handleUploadFile();
        if (uploadedUrl) {
          finalUrl = uploadedUrl;
        } else {
          alert('Failed to upload file. Please try again.');
          setSaving(false);
          return;
        }
      }

      const adId = `ad_${Date.now()}`;
      await setDoc(doc(db, 'advertisements', adId), {
        title: formData.title,
        type: formData.type,
        url: finalUrl,
        duration: formData.duration,
        isActive: true,
        createdAt: Timestamp.now(),
      });

      // Reset form
      setFormData({ title: '', type: 'image', url: '', duration: 5 });
      setSelectedFile(null);
      setPreviewUrl('');
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

            {/* File Upload Section */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Upload Media *
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {!selectedFile && !formData.url ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #e2e8f0',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <Upload style={{ width: '40px', height: '40px', color: '#94a3b8', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '0 0 4px' }}>
                    Click to upload image or video
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    Supports JPG, PNG, GIF, MP4, WebM
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  {selectedFile ? (
                    <>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#e2e8f0'
                      }}>
                        {formData.type === 'video' ? (
                          <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                        ) : (
                          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{selectedFile.name}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          padding: '8px',
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <X style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                      </button>
                    </>
                  ) : (
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Using URL: {formData.url}</p>
                  )}
                </div>
              )}

              {/* OR divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>OR paste URL</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>

              <input
                type="url"
                placeholder="https://example.com/ad-image.jpg"
                value={formData.url}
                onChange={(e) => {
                  setFormData({ ...formData, url: e.target.value });
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleAddAd}
              disabled={saving || uploading || !formData.title || (!formData.url && !selectedFile)}
              style={{
                padding: '12px 24px',
                backgroundColor: saving || uploading || !formData.title || (!formData.url && !selectedFile) ? '#94a3b8' : '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving || uploading || !formData.title || (!formData.url && !selectedFile) ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Ad'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ title: '', type: 'image', url: '', duration: 5 });
                setSelectedFile(null);
                setPreviewUrl('');
                if (fileInputRef.current) fileInputRef.current.value = '';
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
          <li>Upload images/videos directly or paste an external URL</li>
        </ul>
      </div>
    </div>
  );
}
