'use client';

import { useState } from 'react';
import { Save, Truck, Clock, Phone, MapPin } from 'lucide-react';

export default function AdminSettingsPage() {
  const [successMsg, setSuccessMsg] = useState('');

  const [settings, setSettings] = useState({
    deliveryCharges: {
      '0-3': 30,
      '3-6': 50,
      '6-10': 70,
      '10+': 100,
    },
    transportRates: {
      bike: { baseFare: 20, perKm: 7 },
      auto: { baseFare: 20, perKm: 12 },
    },
    workingHours: {
      start: '07:00',
      end: '21:00',
    },
    contactNumber: '+919876543210',
    whatsappNumber: '+919876543210',
    maintenanceMode: false,
  });

  const handleSave = () => {
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: '768px' }}>
      {/* Success Toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', zIndex: 100 }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Configure app settings</p>
      </div>

      {/* Delivery Charges */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Truck style={{ width: '20px', height: '20px', color: '#059669' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Delivery Charges</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {['0-3', '3-6', '6-10', '10+'].map((key) => (
            <div key={key}>
              <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>{key} km</label>
              <input
                type="number"
                value={settings.deliveryCharges[key as keyof typeof settings.deliveryCharges]}
                onChange={(e) => setSettings({
                  ...settings,
                  deliveryCharges: { ...settings.deliveryCharges, [key]: parseInt(e.target.value) || 0 },
                })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Transport Rates */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MapPin style={{ width: '20px', height: '20px', color: '#2563eb' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Transport Rates</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '12px' }}>Bike</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Base Fare (Rs)</label>
                <input
                  type="number"
                  value={settings.transportRates.bike.baseFare}
                  onChange={(e) => setSettings({
                    ...settings,
                    transportRates: {
                      ...settings.transportRates,
                      bike: { ...settings.transportRates.bike, baseFare: parseInt(e.target.value) || 0 },
                    },
                  })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Per KM (Rs)</label>
                <input
                  type="number"
                  value={settings.transportRates.bike.perKm}
                  onChange={(e) => setSettings({
                    ...settings,
                    transportRates: {
                      ...settings.transportRates,
                      bike: { ...settings.transportRates.bike, perKm: parseInt(e.target.value) || 0 },
                    },
                  })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '12px' }}>Auto</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Base Fare (Rs)</label>
                <input
                  type="number"
                  value={settings.transportRates.auto.baseFare}
                  onChange={(e) => setSettings({
                    ...settings,
                    transportRates: {
                      ...settings.transportRates,
                      auto: { ...settings.transportRates.auto, baseFare: parseInt(e.target.value) || 0 },
                    },
                  })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Per KM (Rs)</label>
                <input
                  type="number"
                  value={settings.transportRates.auto.perKm}
                  onChange={(e) => setSettings({
                    ...settings,
                    transportRates: {
                      ...settings.transportRates,
                      auto: { ...settings.transportRates.auto, perKm: parseInt(e.target.value) || 0 },
                    },
                  })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Working Hours</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Start Time</label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => setSettings({
                ...settings,
                workingHours: { ...settings.workingHours, start: e.target.value },
              })}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>End Time</label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => setSettings({
                ...settings,
                workingHours: { ...settings.workingHours, end: e.target.value },
              })}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Contact Numbers */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Phone style={{ width: '20px', height: '20px', color: '#16a34a' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Contact Numbers</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Phone Number</label>
            <input
              type="text"
              value={settings.contactNumber}
              onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>WhatsApp Number</label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Maintenance Mode</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              Temporarily disable the app for maintenance
            </p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
            style={{
              position: 'relative',
              width: '56px',
              height: '28px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: settings.maintenanceMode ? '#dc2626' : '#e2e8f0',
              transition: 'background-color 0.2s'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                transition: 'left 0.2s, right 0.2s',
                left: settings.maintenanceMode ? 'auto' : '4px',
                right: settings.maintenanceMode ? '4px' : 'auto'
              }}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{ width: '100%', padding: '16px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Save style={{ width: '20px', height: '20px' }} />
        Save Settings
      </button>
    </div>
  );
}
