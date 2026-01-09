'use client';

import { useState } from 'react';
import { Plus, MapPin, Bike, Car, Star, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const mockTeam = [
  {
    id: '1',
    name: 'Rajan Kumar',
    phone: '+91 98765 43210',
    vehicleType: 'bike',
    vehicleNumber: 'TN 23 AB 1234',
    areas: ['Vaniyambadi', 'Pallalakuppam', 'Jaffrabad'],
    isAvailable: true,
    totalDeliveries: 150,
    rating: 4.8,
    earnings: { today: 450, week: 3200, month: 12500 },
  },
  {
    id: '2',
    name: 'Suresh M',
    phone: '+91 98765 43211',
    vehicleType: 'auto',
    vehicleNumber: 'TN 23 CD 5678',
    areas: ['Vaniyambadi', 'Alangayam', 'Jolarpet'],
    isAvailable: true,
    totalDeliveries: 89,
    rating: 4.5,
    earnings: { today: 380, week: 2800, month: 11000 },
  },
  {
    id: '3',
    name: 'Karthik S',
    phone: '+91 98765 43212',
    vehicleType: 'bike',
    vehicleNumber: 'TN 23 EF 9012',
    areas: ['Vaniyambadi', 'Tirupathur'],
    isAvailable: false,
    totalDeliveries: 45,
    rating: 4.2,
    earnings: { today: 0, week: 1500, month: 6000 },
  },
];

export default function AdminTeamPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Team</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage delivery team members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 20px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Total Members</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0' }}>{mockTeam.length}</p>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Available Now</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a', margin: '8px 0 0' }}>
            {mockTeam.filter((m) => m.isAvailable).length}
          </p>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Total Deliveries Today</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#059669', margin: '8px 0 0' }}>
            {mockTeam.reduce((sum, m) => sum + Math.round(m.earnings.today / 30), 0)}
          </p>
        </div>
      </div>

      {/* Team Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {mockTeam.map((member) => (
          <div key={member.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#059669', fontWeight: '700', fontSize: '18px' }}>
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{member.name}</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>{member.phone}</p>
                </div>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: member.isAvailable ? '#dcfce7' : '#fee2e2',
                color: member.isAvailable ? '#16a34a' : '#dc2626'
              }}>
                {member.isAvailable ? 'Available' : 'Offline'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {member.vehicleType === 'bike' ? (
                  <Bike style={{ width: '16px', height: '16px', color: '#64748b' }} />
                ) : (
                  <Car style={{ width: '16px', height: '16px', color: '#64748b' }} />
                )}
                <span style={{ fontSize: '14px', color: '#1e293b', textTransform: 'capitalize' }}>
                  {member.vehicleType} - {member.vehicleNumber}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span style={{ fontSize: '14px', color: '#1e293b' }}>
                  {member.areas.join(', ')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star style={{ width: '16px', height: '16px', color: '#f59e0b', fill: '#f59e0b' }} />
                <span style={{ fontSize: '14px', color: '#1e293b' }}>
                  {member.rating} ({member.totalDeliveries} deliveries)
                </span>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Earnings</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Today</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '4px 0 0' }}>
                    {formatPrice(member.earnings.today)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Week</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '4px 0 0' }}>
                    {formatPrice(member.earnings.week)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Month</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '4px 0 0' }}>
                    {formatPrice(member.earnings.month)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Add Team Member</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '24px', height: '24px', color: '#64748b' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input type="text" placeholder="Enter name" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                <input type="text" placeholder="+91 98765 43210" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Vehicle Type</label>
                <select style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                  <option value="bike">Bike</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Vehicle Number</label>
                <input type="text" placeholder="TN 23 AB 1234" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>Aadhar Number</label>
                <input type="text" placeholder="1234 5678 9012" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <button style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
