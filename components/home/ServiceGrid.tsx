'use client';

import Link from 'next/link';
import { MAIN_SERVICES } from '@/constants/services';
import { cn } from '@/lib/utils';

export default function ServiceGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {MAIN_SERVICES.map((service) => (
        <Link
          key={service.id}
          href={service.href}
          className={cn(
            'relative overflow-hidden rounded-3xl p-5 h-36',
            'bg-gradient-to-br',
            service.color,
            'hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
            'shadow-xl'
          )}
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl">{service.icon}</span>
            </div>
            <div className="mt-auto">
              <h3 className="text-white font-bold text-base">{service.name}</h3>
              <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
                {service.description}
              </p>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute -right-6 -bottom-6 text-[100px] opacity-10 pointer-events-none">
            {service.icon}
          </div>
        </Link>
      ))}
    </div>
  );
}
