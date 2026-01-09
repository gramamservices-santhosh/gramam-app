'use client';

import { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { User as UserType } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('type', '==', 'customer'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserType[];
      setUsers(usersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.village?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Users</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage customer accounts</p>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#94a3b8' }} />
          <input
            placeholder="Search by name, phone, or village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>User</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Village</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Addresses</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Joined</th>
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#059669', fontWeight: '700' }}>
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#1e293b', margin: 0 }}>{user.name || 'No Name'}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>{user.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      <span style={{ color: '#1e293b' }}>{user.phone}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      <span style={{ color: '#1e293b' }}>{user.village || '-'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#1e293b' }}>
                    {user.addresses?.length || 0}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                      color: user.isActive ? '#16a34a' : '#dc2626'
                    }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <User style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>No users found</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {searchQuery ? 'Try a different search' : 'Users will appear here'}
            </p>
          </div>
        )}
      </div>

      <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '16px' }}>
        Total: {filteredUsers.length} users
      </p>
    </div>
  );
}
