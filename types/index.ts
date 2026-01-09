import { Timestamp } from 'firebase/firestore';

// User Types
export type UserType = 'customer' | 'admin' | 'team';

export interface Address {
  id: string;
  label: string;
  village: string;
  street: string;
  landmark: string;
  address?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  type: UserType;
  village: string;
  addresses: Address[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fcmToken?: string;
  isActive: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  nameLocal?: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  description?: string;
  inStock: boolean;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  nameLocal?: string;
  icon: string;
  order: number;
  isActive: boolean;
}

// Cart Types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  unit: string;
}

// Order Types
export type OrderType = 'shopping' | 'transport' | 'service';
export type OrderStatus = 'pending' | 'confirmed' | 'assigned' | 'picked' | 'onway' | 'delivered' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'pending' | 'paid';
export type VehicleType = 'bike' | 'auto';
export type ServiceType = 'plumbing' | 'electrical' | 'medical' | 'funeral' | 'festival' | 'decoration';

export interface OrderTimeline {
  status: OrderStatus;
  time: Timestamp;
  note: string;
}

export interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  type: OrderType;

  // Customer Info
  userId: string;
  userName: string;
  userPhone: string;
  userVillage: string;

  // Shopping Order Fields
  items?: CartItem[];
  itemsTotal?: number;
  deliveryCharge?: number;
  totalAmount: number;
  total?: number;
  subtotal?: number;
  deliveryAddress?: {
    village: string;
    street: string;
    landmark: string;
    label?: string;
    address?: string;
  };

  // Transport Order Fields
  transportType?: VehicleType;
  pickup?: LocationPoint;
  drop?: LocationPoint;
  distance?: number;
  fare?: number;

  // Service Order Fields
  serviceType?: ServiceType;
  serviceOption?: string;
  description?: string;
  preferredDate?: string;
  preferredTime?: string;
  // Compatibility fields
  rideDetails?: {
    pickup: string;
    dropoff: string;
    vehicleType: VehicleType;
    distance: number;
  };
  serviceDetails?: {
    serviceType: string;
    subService?: string;
    description?: string;
    scheduledDate?: string;
  };
  serviceAddress?: {
    village: string;
    street: string;
  };

  // Common Fields
  status: OrderStatus;
  assignedTo?: string;
  assignedName?: string;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  timeline: OrderTimeline[];

  rating?: number;
  review?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;

  // Custom orders
  isCustomOrder?: boolean;
  customOrderDescription?: string;
}

// Location Types
export type LocationType =
  | 'busstand' | 'railway' | 'hospital' | 'mahal'
  | 'school' | 'college' | 'temple' | 'mosque'
  | 'market' | 'petrol' | 'bank' | 'village'
  | 'town' | 'city' | 'landmark';

export interface Location {
  id: string;
  name: string;
  nameLocal?: string;
  type: LocationType;
  taluk: string;
  district: string;
  lat: number;
  lng: number;
  distanceFromVaniyambadi?: number;
  isActive: boolean;
}

// Team Member Types
export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  aadharNumber?: string;
  areas: string[];
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Timestamp;
  };
  totalDeliveries: number;
  rating: number;
  earnings: {
    today: number;
    week: number;
    month: number;
  };
  createdAt: Timestamp;
}

// Settings Types
export interface AppSettings {
  deliveryCharges: {
    [key: string]: number;
  };
  transportRates: {
    bike: { baseFare: number; perKm: number };
    auto: { baseFare: number; perKm: number };
  };
  serviceAreas: string[];
  workingHours: {
    start: string;
    end: string;
  };
  contactNumber: string;
  whatsappNumber: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

// Service Types
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  options: ServiceOption[];
}

export interface ServiceOption {
  id: string;
  name: string;
  description?: string;
}
