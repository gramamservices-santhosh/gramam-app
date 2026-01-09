'use client';

import Card from '@/components/ui/Card';
import { VehicleType } from '@/types';
import { formatPrice, calculateRideFare } from '@/lib/utils';

interface FareBreakdownProps {
  vehicleType: VehicleType;
  distance: number;
}

export default function FareBreakdown({ vehicleType, distance }: FareBreakdownProps) {
  const baseFare = 20;
  const perKmRate = vehicleType === 'bike' ? 7 : 12;
  const distanceFare = Math.ceil(distance * perKmRate);
  const totalFare = calculateRideFare(distance, vehicleType);

  return (
    <Card>
      <h3 className="font-semibold text-foreground mb-3">Fare Breakdown</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Base Fare</span>
          <span className="text-foreground">{formatPrice(baseFare)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">
            Distance ({distance.toFixed(1)} km × ₹{perKmRate}/km)
          </span>
          <span className="text-foreground">{formatPrice(distanceFare)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-semibold">
          <span className="text-foreground">Total Fare</span>
          <span className="text-primary text-lg">{formatPrice(totalFare)}</span>
        </div>
      </div>
    </Card>
  );
}
