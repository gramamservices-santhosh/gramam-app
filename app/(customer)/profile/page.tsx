'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const isSetup = false;

  const { user, setUser, logout } = useAuthStore();
  const { success, error: showError } = useToast();

  const [isEditing, setIsEditing] = useState(isSetup);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    village: user?.village || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        village: user.village || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!formData.name.trim()) {
      showError('Please enter your name');
      return;
    }

    if (!formData.village.trim()) {
      showError('Please enter your village');
      return;
    }

    setIsLoading(true);

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        village: formData.village.trim(),
        updatedAt: Timestamp.now(),
      });

      setUser({
        ...user,
        name: formData.name.trim(),
        email: formData.email.trim(),
        village: formData.village.trim(),
      });

      success('Profile updated successfully!');
      setIsEditing(false);

      if (isSetup) {
        router.replace('/home');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      router.replace('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      showError('Failed to logout');
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-8 text-center">
        <span className="text-6xl">🔐</span>
        <h2 className="text-xl font-semibold text-foreground mt-4">
          Login Required
        </h2>
        <p className="text-muted mt-2">Please login to view your profile</p>
        <Button onClick={() => router.push('/login')} className="mt-4">
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            {isSetup ? 'Complete Profile' : 'Profile'}
          </h1>
          <p className="text-sm text-muted">
            {isSetup ? 'Tell us about yourself' : 'Manage your account'}
          </p>
        </div>
        {!isSetup && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Profile Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-4xl text-white font-bold">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'G'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <Card>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  leftIcon={<User className="w-5 h-5" />}
                />
                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Village/Town"
                  placeholder="Enter your village"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  leftIcon={<MapPin className="w-5 h-5" />}
                />

                <div className="flex gap-3 pt-2">
                  {!isSetup && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          village: user.village || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    isLoading={isLoading}
                  >
                    <Save className="w-5 h-5" />
                    {isSetup ? 'Continue' : 'Save'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 py-2">
                  <User className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-xs text-muted">Name</p>
                    <p className="text-foreground font-medium">{user.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-t border-border">
                  <Phone className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-xs text-muted">Phone</p>
                    <p className="text-foreground font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-t border-border">
                  <MapPin className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-xs text-muted">Village</p>
                    <p className="text-foreground font-medium">{user.village || 'Not set'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Menu Items */}
        {!isEditing && (
          <>
            <Card padding="none">
              <Link
                href="/profile/addresses"
                className="flex items-center justify-between p-4 hover:bg-border/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted" />
                  <div>
                    <p className="font-medium text-foreground">Saved Addresses</p>
                    <p className="text-xs text-muted">
                      {user.addresses?.length || 0} addresses
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted" />
              </Link>

              <Link
                href="/orders"
                className="flex items-center justify-between p-4 border-t border-border hover:bg-border/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted" />
                  <div>
                    <p className="font-medium text-foreground">My Orders</p>
                    <p className="text-xs text-muted">View order history</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted" />
              </Link>
            </Card>

            {/* Admin Access */}
            {user.type === 'admin' && (
              <Link href="/admin/dashboard">
                <Card className="bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Admin Dashboard</p>
                      <p className="text-sm text-muted">Manage orders & products</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-secondary" />
                  </div>
                </Card>
              </Link>
            )}

            {/* Logout */}
            <Button
              variant="danger"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </>
        )}

        {/* App Info */}
        {!isEditing && (
          <div className="text-center pt-4">
            <p className="text-muted text-sm">Gramam v1.0.0</p>
            <p className="text-xs text-muted mt-1">
              Serving Vaniyambadi & Thirupathur District
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
