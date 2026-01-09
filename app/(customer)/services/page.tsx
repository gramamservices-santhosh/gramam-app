'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone } from 'lucide-react';
import Card from '@/components/ui/Card';
import ServiceCard from '@/components/services/ServiceCard';
import { SERVICE_CATEGORIES } from '@/constants/services';

export default function ServicesPage() {
  const router = useRouter();

  // Group services
  const homeServices = SERVICE_CATEGORIES.filter((s) =>
    ['plumbing', 'electrical', 'medical'].includes(s.id)
  );
  const eventServices = SERVICE_CATEGORIES.filter((s) =>
    ['funeral', 'festival', 'decoration'].includes(s.id)
  );

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
        <div>
          <h1 className="text-xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted">Home services & event support</p>
        </div>
      </div>

      {/* Emergency Contact */}
      <Card className="bg-gradient-to-r from-danger/20 to-danger/10 border-danger/30 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Need Urgent Help?</h3>
            <p className="text-sm text-muted mt-1">Call us for emergency services</p>
          </div>
          <a
            href="tel:+919876543210"
            className="w-12 h-12 bg-danger rounded-full flex items-center justify-center text-white"
          >
            <Phone className="w-6 h-6" />
          </a>
        </div>
      </Card>

      {/* Home Services */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          🔧 Home Services
        </h2>
        <div className="grid gap-3">
          {homeServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Event Services */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          🎉 Event Services
        </h2>
        <div className="grid gap-3">
          {eventServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="mt-6 text-center">
        <p className="text-muted text-sm">
          All services are provided by verified local professionals.
        </p>
        <p className="text-muted text-sm mt-1">
          Payment after service completion.
        </p>
      </Card>
    </div>
  );
}
