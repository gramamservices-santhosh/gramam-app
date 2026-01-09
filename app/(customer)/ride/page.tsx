'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpDown, MapPin, Navigation, ChevronRight } from 'lucide-react';
import { LOCATIONS } from '@/constants/locations';

type LocationPoint = {
  name: string;
  lat: number;
  lng: number;
};

const popularLocations = [
  'Vaniyambadi Bus Stand',
  'Vaniyambadi Railway Station',
  'Government Hospital',
  'Jolarpet Junction',
];

export default function RidePage() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<'bike' | 'auto'>('bike');
  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [drop, setDrop] = useState<LocationPoint | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropSearch, setDropSearch] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Calculate distance using Haversine formula
  const distance = useMemo(() => {
    if (pickup && drop) {
      const R = 6371; // Earth's radius in km
      const dLat = ((drop.lat - pickup.lat) * Math.PI) / 180;
      const dLng = ((drop.lng - pickup.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickup.lat * Math.PI) / 180) *
          Math.cos((drop.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    return 0;
  }, [pickup, drop]);

  // Calculate fare
  const fare = useMemo(() => {
    if (distance > 0) {
      const rate = vehicleType === 'bike' ? 7 : 12;
      const baseFare = vehicleType === 'bike' ? 20 : 30;
      return Math.round(baseFare + distance * rate);
    }
    return 0;
  }, [distance, vehicleType]);

  // Filter locations based on search
  const filteredPickupLocations = useMemo(() => {
    if (!pickupSearch) return LOCATIONS.slice(0, 5);
    return LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(pickupSearch.toLowerCase())
    ).slice(0, 5);
  }, [pickupSearch]);

  const filteredDropLocations = useMemo(() => {
    if (!dropSearch) return LOCATIONS.slice(0, 5);
    return LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(dropSearch.toLowerCase())
    ).slice(0, 5);
  }, [dropSearch]);

  const handleSelectPickup = (loc: typeof LOCATIONS[0]) => {
    setPickup({ name: loc.name, lat: loc.lat, lng: loc.lng });
    setPickupSearch(loc.name);
    setShowPickupSuggestions(false);
  };

  const handleSelectDrop = (loc: typeof LOCATIONS[0]) => {
    setDrop({ name: loc.name, lat: loc.lat, lng: loc.lng });
    setDropSearch(loc.name);
    setShowDropSuggestions(false);
  };

  const handleSwap = () => {
    const tempPickup = pickup;
    const tempPickupSearch = pickupSearch;
    setPickup(drop);
    setPickupSearch(dropSearch);
    setDrop(tempPickup);
    setDropSearch(tempPickupSearch);
  };

  const handleQuickLocation = (locName: string) => {
    const found = LOCATIONS.find((l) => l.name === locName);
    if (found) {
      if (!pickup) {
        handleSelectPickup(found);
      } else if (!drop) {
        handleSelectDrop(found);
      }
    }
  };

  const handleBookRide = async () => {
    if (!pickup || !drop) return;
    setIsBooking(true);

    // Simulate booking
    await new Promise((resolve) => setTimeout(resolve, 1500));

    alert(`Ride booked! ${vehicleType === 'bike' ? 'Bike' : 'Auto'} from ${pickup.name} to ${drop.name}. Fare: Rs ${fare}`);
    setIsBooking(false);
    router.push('/orders');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', color: '#1e293b' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Book a Ride</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Bike & Auto available 24/7</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Vehicle Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>Select Vehicle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => setVehicleType('bike')}
              style={{
                padding: '16px',
                backgroundColor: vehicleType === 'bike' ? '#ecfdf5' : '#ffffff',
                border: vehicleType === 'bike' ? '2px solid #059669' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🏍️</span>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', display: 'block' }}>Bike</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Rs 7/km</span>
            </button>
            <button
              onClick={() => setVehicleType('auto')}
              style={{
                padding: '16px',
                backgroundColor: vehicleType === 'auto' ? '#ecfdf5' : '#ffffff',
                border: vehicleType === 'auto' ? '2px solid #059669' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🛺</span>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', display: 'block' }}>Auto</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Rs 12/km</span>
            </button>
          </div>
        </div>

        {/* Location Inputs */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', position: 'relative' }}>
          {/* Pickup */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Pickup Location</label>
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickupSearch}
                  onChange={(e) => {
                    setPickupSearch(e.target.value);
                    setShowPickupSuggestions(true);
                    if (!e.target.value) setPickup(null);
                  }}
                  onFocus={() => setShowPickupSuggestions(true)}
                  style={{
                    width: '100%',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#1e293b',
                    border: 'none',
                    outline: 'none',
                    padding: '4px 0',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            {showPickupSuggestions && filteredPickupLocations.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {filteredPickupLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleSelectPickup(loc)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      textAlign: 'left',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <MapPin style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>{loc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              backgroundColor: '#059669',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowUpDown style={{ width: '16px', height: '16px', color: '#ffffff' }} />
          </button>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #e2e8f0', marginBottom: '16px' }} />

          {/* Drop */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Drop Location</label>
                <input
                  type="text"
                  placeholder="Enter drop location"
                  value={dropSearch}
                  onChange={(e) => {
                    setDropSearch(e.target.value);
                    setShowDropSuggestions(true);
                    if (!e.target.value) setDrop(null);
                  }}
                  onFocus={() => setShowDropSuggestions(true)}
                  style={{
                    width: '100%',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#1e293b',
                    border: 'none',
                    outline: 'none',
                    padding: '4px 0',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            {showDropSuggestions && filteredDropLocations.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {filteredDropLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleSelectDrop(loc)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      textAlign: 'left',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <MapPin style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>{loc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Distance & Fare Info */}
        {distance > 0 && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation style={{ width: '20px', height: '20px', color: '#059669' }} />
                <span style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>Distance: {distance.toFixed(1)} km</span>
              </div>
              <span style={{ fontSize: '14px', color: '#64748b' }}>~{Math.ceil(distance * 3)} mins</span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Base Fare</span>
                <span style={{ fontSize: '14px', color: '#1e293b' }}>Rs {vehicleType === 'bike' ? 20 : 30}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Distance Charge ({distance.toFixed(1)} km x Rs {vehicleType === 'bike' ? 7 : 12})</span>
                <span style={{ fontSize: '14px', color: '#1e293b' }}>Rs {Math.round(distance * (vehicleType === 'bike' ? 7 : 12))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Total Fare</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>Rs {fare}</span>
              </div>
            </div>
          </div>
        )}

        {/* Popular Locations */}
        {!pickup && !drop && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Popular Locations</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleQuickLocation(loc)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Button */}
      {pickup && drop && distance > 0 && (
        <div style={{ position: 'fixed', bottom: '70px', left: '16px', right: '16px', zIndex: 40 }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  {vehicleType === 'bike' ? '🏍️ Bike' : '🛺 Auto'} • {distance.toFixed(1)} km
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#059669', margin: '4px 0 0' }}>Rs {fare}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Cash Payment</p>
                <p style={{ fontSize: '14px', color: '#1e293b', margin: '2px 0 0' }}>~{Math.ceil(distance * 3)} mins</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleBookRide}
            disabled={isBooking}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: isBooking ? '#94a3b8' : '#059669',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              cursor: isBooking ? 'not-allowed' : 'pointer'
            }}
          >
            {isBooking ? 'Booking...' : `Book ${vehicleType === 'bike' ? 'Bike' : 'Auto'} Ride`}
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '8px 0', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { href: '/home', label: 'Home', icon: '🏠', active: false },
            { href: '/shop', label: 'Shop', icon: '🛒', active: false },
            { href: '/ride', label: 'Ride', icon: '🛵', active: true },
            { href: '/services', label: 'Services', icon: '🔧', active: false },
            { href: '/orders', label: 'Orders', icon: '📋', active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 12px' }}>
              <span style={{ fontSize: '20px', display: 'block' }}>{item.icon}</span>
              <span style={{ fontSize: '11px', color: item.active ? '#059669' : '#64748b', fontWeight: item.active ? '600' : '400' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
