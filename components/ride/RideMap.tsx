'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { LocationPoint } from '@/types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const pickupIcon = new Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const dropIcon = new Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to fit bounds when locations change
function MapBounds({ pickup, drop }: { pickup: LocationPoint | null; drop: LocationPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (pickup && drop) {
      const bounds = new LatLngBounds(
        [pickup.lat, pickup.lng],
        [drop.lat, drop.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14);
    } else if (drop) {
      map.setView([drop.lat, drop.lng], 14);
    }
  }, [pickup, drop, map]);

  return null;
}

interface RideMapProps {
  pickup: LocationPoint | null;
  drop: LocationPoint | null;
}

export default function RideMap({ pickup, drop }: RideMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl">🗺️</span>
          <p className="text-muted text-sm mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  // Default center (Vaniyambadi)
  const defaultCenter: [number, number] = [12.6819, 78.6208];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
        )}

        {drop && (
          <Marker position={[drop.lat, drop.lng]} icon={dropIcon} />
        )}

        {pickup && drop && (
          <Polyline
            positions={[
              [pickup.lat, pickup.lng],
              [drop.lat, drop.lng],
            ]}
            color="#FF6B35"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        <MapBounds pickup={pickup} drop={drop} />
      </MapContainer>
    </div>
  );
}
