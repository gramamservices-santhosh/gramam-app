'use client';

import { useState } from 'react';
import { Save, Truck, Clock, Phone, MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const { success } = useToast();

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
    success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted">Configure app settings</p>
      </div>

      {/* Delivery Charges */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Delivery Charges</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-muted">0-3 km</label>
            <Input
              type="number"
              value={settings.deliveryCharges['0-3']}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  deliveryCharges: { ...settings.deliveryCharges, '0-3': parseInt(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm text-muted">3-6 km</label>
            <Input
              type="number"
              value={settings.deliveryCharges['3-6']}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  deliveryCharges: { ...settings.deliveryCharges, '3-6': parseInt(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm text-muted">6-10 km</label>
            <Input
              type="number"
              value={settings.deliveryCharges['6-10']}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  deliveryCharges: { ...settings.deliveryCharges, '6-10': parseInt(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm text-muted">10+ km</label>
            <Input
              type="number"
              value={settings.deliveryCharges['10+']}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  deliveryCharges: { ...settings.deliveryCharges, '10+': parseInt(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Transport Rates */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-semibold text-foreground">Transport Rates</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">Bike</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted">Base Fare (₹)</label>
                <Input
                  type="number"
                  value={settings.transportRates.bike.baseFare}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transportRates: {
                        ...settings.transportRates,
                        bike: { ...settings.transportRates.bike, baseFare: parseInt(e.target.value) },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-muted">Per KM (₹)</label>
                <Input
                  type="number"
                  value={settings.transportRates.bike.perKm}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transportRates: {
                        ...settings.transportRates,
                        bike: { ...settings.transportRates.bike, perKm: parseInt(e.target.value) },
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">Auto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted">Base Fare (₹)</label>
                <Input
                  type="number"
                  value={settings.transportRates.auto.baseFare}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transportRates: {
                        ...settings.transportRates,
                        auto: { ...settings.transportRates.auto, baseFare: parseInt(e.target.value) },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-muted">Per KM (₹)</label>
                <Input
                  type="number"
                  value={settings.transportRates.auto.perKm}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      transportRates: {
                        ...settings.transportRates,
                        auto: { ...settings.transportRates.auto, perKm: parseInt(e.target.value) },
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Working Hours */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold text-foreground">Working Hours</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted">Start Time</label>
            <Input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, start: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm text-muted">End Time</label>
            <Input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, end: e.target.value },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Contact Numbers */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-success" />
          <h2 className="text-lg font-semibold text-foreground">Contact Numbers</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            value={settings.contactNumber}
            onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
          />
          <Input
            label="WhatsApp Number"
            value={settings.whatsappNumber}
            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
          />
        </div>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Maintenance Mode</h3>
            <p className="text-sm text-muted">
              Temporarily disable the app for maintenance
            </p>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
            }
            className={`relative w-14 h-7 rounded-full transition-colors ${
              settings.maintenanceMode ? 'bg-danger' : 'bg-border'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                settings.maintenanceMode ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Save Button */}
      <Button className="w-full" size="lg" onClick={handleSave}>
        <Save className="w-5 h-5" />
        Save Settings
      </Button>
    </div>
  );
}
