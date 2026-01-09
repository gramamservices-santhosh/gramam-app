'use client';

import Link from 'next/link';
import { Phone, ChevronRight, Wrench, Zap, Stethoscope, Music, Palette, Heart } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/constants/services';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plumbing: Wrench,
  electrical: Zap,
  medical: Stethoscope,
  funeral: Heart,
  festival: Music,
  decoration: Palette,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  plumbing: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  electrical: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
  medical: { bg: 'bg-red-500/10', text: 'text-red-500' },
  funeral: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  festival: { bg: 'bg-accent/10', text: 'text-accent' },
  decoration: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
};

export default function ServicesPage() {
  const homeServices = SERVICE_CATEGORIES.filter((s) =>
    ['plumbing', 'electrical', 'medical'].includes(s.id)
  );
  const eventServices = SERVICE_CATEGORIES.filter((s) =>
    ['funeral', 'festival', 'decoration'].includes(s.id)
  );

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Services</h1>
        <p className="text-sm text-muted mt-1">Home services & event support</p>
      </div>

      {/* Emergency Contact */}
      <div className="px-4 mb-6">
        <div className="bg-card border border-danger/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Need Urgent Help?</h3>
              <p className="text-xs text-muted mt-0.5">Call us for emergency services</p>
            </div>
            <a
              href="tel:+919876543210"
              className="w-11 h-11 bg-danger rounded-xl flex items-center justify-center text-white"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Home Services */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-foreground px-4 mb-3">
          Home Services
        </h2>
        <div className="px-4 space-y-3">
          {homeServices.map((service) => {
            const Icon = iconMap[service.id] || Wrench;
            const colors = colorMap[service.id] || { bg: 'bg-primary/10', text: 'text-primary' };
            return (
              <Link key={service.id} href={`/services/${service.id}`}>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{service.name}</h3>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-medium">
                        {service.options.length} options
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Event Services */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-foreground px-4 mb-3">
          Event Services
        </h2>
        <div className="px-4 space-y-3">
          {eventServices.map((service) => {
            const Icon = iconMap[service.id] || Wrench;
            const colors = colorMap[service.id] || { bg: 'bg-primary/10', text: 'text-primary' };
            return (
              <Link key={service.id} href={`/services/${service.id}`}>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{service.name}</h3>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-medium">
                        {service.options.length} options
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Info Card */}
      <div className="px-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-muted text-xs">
            All services are provided by verified local professionals.
          </p>
          <p className="text-muted text-xs mt-1">
            Payment after service completion.
          </p>
        </div>
      </div>
    </div>
  );
}
