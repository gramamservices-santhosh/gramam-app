'use client';

import { Bike, Car } from 'lucide-react';
import Card from '@/components/ui/Card';
import { VehicleType } from '@/types';
import { cn } from '@/lib/utils';

interface VehicleSelectorProps {
  selected: VehicleType;
  onSelect: (type: VehicleType) => void;
}

const vehicles = [
  {
    type: 'bike' as VehicleType,
    name: 'Bike',
    icon: Bike,
    capacity: '1 Person',
    rate: '₹7/km',
    baseFare: '₹20',
    emoji: '🏍️',
  },
  {
    type: 'auto' as VehicleType,
    name: 'Auto',
    icon: Car,
    capacity: 'Up to 3 Persons',
    rate: '₹12/km',
    baseFare: '₹20',
    emoji: '🛺',
  },
];

export default function VehicleSelector({ selected, onSelect }: VehicleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {vehicles.map((vehicle) => {
        const Icon = vehicle.icon;
        const isSelected = selected === vehicle.type;

        return (
          <button
            key={vehicle.type}
            onClick={() => onSelect(vehicle.type)}
            className="text-left"
          >
            <Card
              className={cn(
                'transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{vehicle.emoji}</span>
                <span className="font-semibold text-foreground">{vehicle.name}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted">{vehicle.capacity}</p>
                <p className="text-foreground">
                  <span className="text-primary font-medium">{vehicle.rate}</span>
                  <span className="text-muted"> + {vehicle.baseFare} base</span>
                </p>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
