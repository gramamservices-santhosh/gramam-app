import { create } from 'zustand';
import { Order, LocationPoint, VehicleType, ServiceType } from '@/types';

interface OrderState {
  // Transport booking state
  vehicleType: VehicleType;
  pickup: LocationPoint | null;
  drop: LocationPoint | null;
  distance: number;
  fare: number;

  // Service booking state
  selectedServiceType: ServiceType | null;
  selectedServiceOption: string;
  serviceDescription: string;
  preferredDate: string;
  preferredTime: string;

  // Active orders
  activeOrders: Order[];

  // Actions
  setVehicleType: (type: VehicleType) => void;
  setPickup: (location: LocationPoint | null) => void;
  setDrop: (location: LocationPoint | null) => void;
  setDistance: (distance: number) => void;
  setFare: (fare: number) => void;
  clearRideBooking: () => void;

  setSelectedServiceType: (type: ServiceType | null) => void;
  setSelectedServiceOption: (option: string) => void;
  setServiceDescription: (desc: string) => void;
  setPreferredDate: (date: string) => void;
  setPreferredTime: (time: string) => void;
  clearServiceBooking: () => void;

  setActiveOrders: (orders: Order[]) => void;
  addActiveOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  // Transport defaults
  vehicleType: 'bike',
  pickup: null,
  drop: null,
  distance: 0,
  fare: 0,

  // Service defaults
  selectedServiceType: null,
  selectedServiceOption: '',
  serviceDescription: '',
  preferredDate: '',
  preferredTime: '',

  // Active orders
  activeOrders: [],

  // Transport actions
  setVehicleType: (vehicleType) => set({ vehicleType }),
  setPickup: (pickup) => set({ pickup }),
  setDrop: (drop) => set({ drop }),
  setDistance: (distance) => set({ distance }),
  setFare: (fare) => set({ fare }),

  clearRideBooking: () =>
    set({
      pickup: null,
      drop: null,
      distance: 0,
      fare: 0,
    }),

  // Service actions
  setSelectedServiceType: (selectedServiceType) => set({ selectedServiceType }),
  setSelectedServiceOption: (selectedServiceOption) => set({ selectedServiceOption }),
  setServiceDescription: (serviceDescription) => set({ serviceDescription }),
  setPreferredDate: (preferredDate) => set({ preferredDate }),
  setPreferredTime: (preferredTime) => set({ preferredTime }),

  clearServiceBooking: () =>
    set({
      selectedServiceType: null,
      selectedServiceOption: '',
      serviceDescription: '',
      preferredDate: '',
      preferredTime: '',
    }),

  // Order actions
  setActiveOrders: (activeOrders) => set({ activeOrders }),

  addActiveOrder: (order) =>
    set((state) => ({
      activeOrders: [order, ...state.activeOrders],
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),
}));
