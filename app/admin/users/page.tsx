'use client';

import { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin, ShoppingBag, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { User as UserType, Order } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [userOrders, setUserOrders] = useState<Record<string, Order[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Fetch users
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

  // Fetch orders for a specific user
  const fetchUserOrders = async (userId: string) => {
    if (userOrders[userId]) return; // Already fetched

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setUserOrders((prev) => ({ ...prev, [userId]: orders }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const handleExpandUser = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      fetchUserOrders(userId);
    }
  };

  const handleViewUserDetails = (user: UserType) => {
    setSelectedUser(user);
    fetchUserOrders(user.id);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.village?.toLowerCase().includes(q)
    );
  });

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'shopping': return '🛒';
      case 'ride': return '🛵';
      case 'service': return '🔧';
      default: return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', color: '#d97706' };
      case 'confirmed': return { bg: '#dbeafe', color: '#2563eb' };
      case 'delivered': case 'completed': return { bg: '#dcfce7', color: '#16a34a' };
      case 'cancelled': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <div>
      {/* User Details Modal */}
      {selectedUser && (
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
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#059669', fontWeight: '700', fontSize: '18px' }}>
                    {selectedUser.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                    {selectedUser.name || 'No Name'}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0' }}>
                    {selectedUser.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '20px', height: '20px', color: '#64748b' }} />
              </button>
            </div>

            {/* User Info */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Village</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>
                    {selectedUser.village || 'Not set'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Joined</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Total Orders</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>
                    {userOrders[selectedUser.id]?.length || 0}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>Status</p>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: selectedUser.isActive ? '#dcfce7' : '#fee2e2',
                    color: selectedUser.isActive ? '#16a34a' : '#dc2626'
                  }}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Activities/Orders */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 12px' }}>
                Recent Activities
              </h3>
              {userOrders[selectedUser.id]?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userOrders[selectedUser.id].map((order) => {
                    const statusColors = getStatusColor(order.status);
                    return (
                      <div
                        key={order.id}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>{getOrderTypeIcon(order.type)}</span>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', textTransform: 'capitalize' }}>
                              {order.type}
                            </span>
                          </div>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '500',
                            backgroundColor: statusColors.bg,
                            color: statusColors.color,
                            textTransform: 'capitalize'
                          }}>
                            {order.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                          {order.id} • {formatDate(order.createdAt)}
                        </p>
                        {order.totalAmount > 0 && (
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669', margin: '4px 0 0' }}>
                            Rs {order.totalAmount}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  <ShoppingBag style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Users</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>View customers and their activities</p>
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

      {/* Users List */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div
                onClick={() => handleViewUserDetails(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  cursor: 'pointer',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#059669', fontWeight: '700', fontSize: '18px' }}>
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontWeight: '600', color: '#1e293b', margin: 0, fontSize: '15px' }}>
                      {user.name || 'No Name'}
                    </p>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '500',
                      backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                      color: user.isActive ? '#16a34a' : '#dc2626'
                    }}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone style={{ width: '14px', height: '14px', color: '#64748b' }} />
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{user.phone}</span>
                    </div>
                    {user.village && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '14px', height: '14px', color: '#64748b' }} />
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{user.village}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '14px', height: '14px', color: '#64748b' }} />
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>View</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>Details</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <User style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>No users found</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {searchQuery ? 'Try a different search' : 'Users will appear here when they sign up'}
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
