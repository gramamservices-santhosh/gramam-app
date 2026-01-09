'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowUpDown, MapPin, Navigation } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import VehicleSelector from '@/components/ride/VehicleSelector';
import LocationInput from '@/components/ride/LocationInput';
import FareBreakdown from '@/components/ride/FareBreakdown';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { calculateDistance, calculateRideFare, generateOrderId, formatPrice } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

// Dynamic import for Map to avoid SSR issues
const RideMap = dynamic(() => import('@/components/ride/RideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-card rounded-2xl flex items-center justify-center">
      <span className="text-4xl animate-pulse">🗺️</span>
    </div>
  ),
});

export default function RidePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    vehicleType,
    pickup,
    drop,
    setVehicleType,
    setPickup,
    setDrop,
    clearRideBooking,
  } = useOrderStore();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  // Calculate distance and fare
  const distance = useMemo(() => {
    if (pickup && drop) {
      return calculateDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
    }
    return 0;
  }, [pickup, drop]);

  const fare = useMemo(() => {
    if (distance > 0) {
      return calculateRideFare(distance, vehicleType);
    }
    return 0;
  }, [distance, vehicleType]);

  // Swap pickup and drop
  const handleSwap = () => {
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
  };

  // Book ride
  const handleBookRide = async () => {
    if (!user) {
      showError('Please login to book a ride');
      router.push('/login');
      return;
    }

    if (!pickup || !drop) {
      showError('Please select pickup and drop locations');
      return;
    }

    setIsLoading(true);

    try {
      const orderId = generateOrderId();

      const order = {
        id: orderId,
        type: 'transport' as const,
        userId: user.id,
        userName: user.name || 'Customer',
        userPhone: user.phone,
        userVillage: user.village || '',

        transportType: vehicleType,
        pickup,
        drop,
        distance,
        fare,
        totalAmount: fare,

        status: 'pending' as const,
        paymentMethod: 'cod' as const,
        paymentStatus: 'pending' as const,

        timeline: [
          {
            status: 'pending' as const,
            time: Timestamp.now(),
            note: 'Ride booking requested',
          },
        ],

        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'orders', orderId), order);

      // Clear booking
      clearRideBooking();

      // Show success
      success('Ride booked successfully!');

      // Navigate to order details
      router.push(`/orders/${orderId}`);
    } catch (err) {
      console.error('Error booking ride:', err);
      showError('Failed to book ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 pb-40">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Book a Ride</h1>
          <p className="text-sm text-muted">Bike & Auto available 24/7</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Vehicle Selection */}
        <VehicleSelector selected={vehicleType} onSelect={setVehicleType} />

        {/* Location Inputs */}
        <Card>
          <div className="relative">
            {/* Pickup */}
            <LocationInput
              label="Pickup Location"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={setPickup}
              variant="pickup"
            />

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors z-10"
              style={{ marginTop: '12px' }}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="my-3 border-t border-dashed border-border" />

            {/* Drop */}
            <LocationInput
              label="Drop Location"
              placeholder="Enter drop location"
              value={drop}
              onChange={setDrop}
              variant="drop"
            />
          </div>
        </Card>

        {/* Map */}
        <div className="h-48">
          <RideMap pickup={pickup} drop={drop} />
        </div>

        {/* Distance & Fare Info */}
        {distance > 0 && (
          <>
            {/* Route Info */}
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  Distance: {distance.toFixed(1)} km
                </span>
              </div>
              <span className="text-muted text-sm">
                ~{Math.ceil(distance * 3)} mins
              </span>
            </Card>

            {/* Fare Breakdown */}
            <FareBreakdown vehicleType={vehicleType} distance={distance} />
          </>
        )}

        {/* Quick Locations */}
        {!pickup && !drop && (
          <Card>
            <h3 className="font-semibold text-foreground mb-3">Popular Locations</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Vaniyambadi Bus Stand',
                'Vaniyambadi Railway Station',
                'Government Hospital',
                'Jolarpet Junction',
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    // Set as pickup if empty, else as drop
                    const locations = require('@/constants/locations').LOCATIONS;
                    const found = locations.find((l: { name: string }) => l.name === loc);
                    if (found) {
                      const point = { name: found.name, lat: found.lat, lng: found.lng };
                      if (!pickup) {
                        setPickup(point);
                      } else {
                        setDrop(point);
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-border/50 rounded-full text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Book Button */}
      {pickup && drop && distance > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Card className="bg-card shadow-xl mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">
                    {vehicleType === 'bike' ? '🏍️ Bike' : '🛺 Auto'} • {distance.toFixed(1)} km
                  </p>
                  <p className="text-xl font-bold text-primary">{formatPrice(fare)}</p>
                </div>
                <div className="text-right text-sm text-muted">
                  <p>Cash Payment</p>
                  <p className="text-foreground">~{Math.ceil(distance * 3)} mins</p>
                </div>
              </div>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handleBookRide}
              isLoading={isLoading}
            >
              Book {vehicleType === 'bike' ? 'Bike' : 'Auto'} Ride
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
