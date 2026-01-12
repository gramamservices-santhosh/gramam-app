'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface Ad {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  duration: number; // seconds
  isActive: boolean;
}

interface AdModalProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function AdModal({ onComplete, onSkip }: AdModalProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch active ad from Firestore
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const adsRef = collection(db, 'advertisements');
        const q = query(
          adsRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const adDoc = snapshot.docs[0];
          setAd({ id: adDoc.id, ...adDoc.data() } as Ad);
        } else {
          // No ad available, complete immediately
          onComplete();
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        // If error, skip ad
        onComplete();
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [onComplete]);

  // Countdown timer
  useEffect(() => {
    if (!ad || loading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ad, loading]);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #374151',
            borderTopColor: '#059669',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af', backgroundColor: '#374151', padding: '4px 8px', borderRadius: '4px' }}>
            AD
          </span>
          <span style={{ fontSize: '14px', color: '#ffffff' }}>{ad.title}</span>
        </div>

        {canSkip ? (
          <button
            onClick={onComplete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Continue
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#374151',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>Skip in</span>
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#ffffff',
              backgroundColor: '#059669',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Ad Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        {ad.type === 'video' ? (
          <video
            src={ad.url}
            autoPlay
            muted
            playsInline
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              borderRadius: '12px'
            }}
          />
        ) : (
          <img
            src={ad.url}
            alt={ad.title}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              borderRadius: '12px',
              objectFit: 'contain'
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
          Sponsored content from local businesses
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
