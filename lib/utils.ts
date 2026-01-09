import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in INR
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format phone number
export function formatPhone(phone: string): string {
  if (phone.startsWith('+91')) {
    return phone;
  }
  return `+91${phone.replace(/\D/g, '')}`;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate delivery charge based on distance
export function calculateDeliveryCharge(distanceKm: number): number {
  if (distanceKm <= 3) return 30;
  if (distanceKm <= 6) return 50;
  if (distanceKm <= 10) return 70;
  return 100;
}

// Calculate ride fare
export function calculateRideFare(
  distanceKm: number,
  vehicleType: 'bike' | 'auto'
): number {
  const baseFare = 20;
  const perKmRate = vehicleType === 'bike' ? 7 : 12;
  return baseFare + Math.ceil(distanceKm * perKmRate);
}

// Generate order ID
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${random}`;
}

// Format date
export function formatDate(date: Date | { toDate: () => Date }): string {
  const d = 'toDate' in date ? date.toDate() : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Format relative time
export function formatRelativeTime(date: Date | { toDate: () => Date }): string {
  const d = 'toDate' in date ? date.toDate() : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(d);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Validate Indian phone number
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91')) {
    return cleaned.length === 12 && /^91[6-9]\d{9}$/.test(cleaned);
  }
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-warning',
    confirmed: 'text-secondary',
    assigned: 'text-secondary',
    picked: 'text-primary',
    onway: 'text-primary',
    delivered: 'text-success',
    completed: 'text-success',
    cancelled: 'text-danger',
  };
  return colors[status] || 'text-muted';
}

// Get status background
export function getStatusBg(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-warning/20',
    confirmed: 'bg-secondary/20',
    assigned: 'bg-secondary/20',
    picked: 'bg-primary/20',
    onway: 'bg-primary/20',
    delivered: 'bg-success/20',
    completed: 'bg-success/20',
    cancelled: 'bg-danger/20',
  };
  return colors[status] || 'bg-muted/20';
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
