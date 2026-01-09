'use client';

import { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
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
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.phone.includes(query) ||
      user.village?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted">Manage customer accounts</p>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search by name, phone, or village..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />
      </Card>

      {/* Users Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-border/30">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">User</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Phone</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Village</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Addresses</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Joined</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-border/20 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name || 'No Name'}</p>
                        <p className="text-xs text-muted">{user.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted" />
                      <span className="text-foreground">{user.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted" />
                      <span className="text-foreground">{user.village || '-'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-foreground">{user.addresses?.length || 0}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-foreground font-medium">No users found</p>
            <p className="text-sm text-muted mt-1">
              {searchQuery ? 'Try a different search' : 'Users will appear here'}
            </p>
          </div>
        )}
      </Card>

      <p className="text-sm text-muted text-center">
        Total: {filteredUsers.length} users
      </p>
    </div>
  );
}
