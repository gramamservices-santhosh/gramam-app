'use client';

import { useState } from 'react';
import { Plus, Phone, MapPin, Bike, Car, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';

// Mock team data
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted">Manage delivery team members</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-muted">Total Members</p>
          <p className="text-3xl font-bold text-foreground">{mockTeam.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Available Now</p>
          <p className="text-3xl font-bold text-success">
            {mockTeam.filter((m) => m.isAvailable).length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Total Deliveries Today</p>
          <p className="text-3xl font-bold text-primary">
            {mockTeam.reduce((sum, m) => sum + m.earnings.today / 30, 0).toFixed(0)}
          </p>
        </Card>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTeam.map((member) => (
          <Card key={member.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted">{member.phone}</p>
                </div>
              </div>
              <Badge variant={member.isAvailable ? 'success' : 'danger'}>
                {member.isAvailable ? 'Available' : 'Offline'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {member.vehicleType === 'bike' ? (
                  <Bike className="w-4 h-4 text-muted" />
                ) : (
                  <Car className="w-4 h-4 text-muted" />
                )}
                <span className="text-sm text-foreground capitalize">
                  {member.vehicleType} - {member.vehicleNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted" />
                <span className="text-sm text-foreground">
                  {member.areas.join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-sm text-foreground">
                  {member.rating} ({member.totalDeliveries} deliveries)
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted mb-2">Earnings</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted">Today</p>
                  <p className="font-medium text-foreground">
                    {formatPrice(member.earnings.today)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Week</p>
                  <p className="font-medium text-foreground">
                    {formatPrice(member.earnings.week)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Month</p>
                  <p className="font-medium text-foreground">
                    {formatPrice(member.earnings.month)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Team Member"
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter name" />
          <Input label="Phone Number" placeholder="+91 98765 43210" />
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Vehicle Type
            </label>
            <select className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground">
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <Input label="Vehicle Number" placeholder="TN 23 AB 1234" />
          <Input label="Aadhar Number" placeholder="1234 5678 9012" />
          <Button className="w-full">Add Member</Button>
        </div>
      </Modal>
    </div>
  );
}
