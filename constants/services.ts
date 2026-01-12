import { ServiceCategory } from '@/types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    description: 'Fix all plumbing issues at your home',
    options: [
      { id: 'pipe-repair', name: 'Pipe Repair', description: 'Fix leaking or broken pipes' },
      { id: 'tap-installation', name: 'Tap Installation', description: 'Install new taps or replace old ones' },
      { id: 'tank-cleaning', name: 'Tank Cleaning', description: 'Clean overhead or underground tanks' },
      { id: 'drainage', name: 'Drainage Issue', description: 'Clear blocked drains' },
      { id: 'motor-repair', name: 'Motor Repair', description: 'Repair water pump motors' },
      { id: 'borewell', name: 'Borewell Service', description: 'Borewell maintenance and repair' },
    ],
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    description: 'All electrical repair and installation works',
    options: [
      { id: 'wiring', name: 'Wiring Work', description: 'New wiring or rewiring work' },
      { id: 'fan-installation', name: 'Fan Installation', description: 'Install ceiling or wall fans' },
      { id: 'light-fitting', name: 'Light Fitting', description: 'Install lights, bulbs, tubes' },
      { id: 'mcb-fuse', name: 'MCB/Fuse Issue', description: 'Fix MCB tripping or fuse problems' },
      { id: 'motor-winding', name: 'Motor Winding', description: 'Motor rewinding service' },
      { id: 'inverter-ups', name: 'Inverter/UPS Repair', description: 'Repair inverters and UPS systems' },
    ],
  },
  {
    id: 'medical',
    name: 'Medical Support',
    icon: '🏥',
    description: 'Medical assistance and support services',
    options: [
      { id: 'medicine-delivery', name: 'Medicine Delivery', description: 'Get medicines delivered to your home' },
      { id: 'ambulance', name: 'Ambulance Booking', description: 'Book ambulance for emergencies' },
      { id: 'first-aid', name: 'First Aid', description: 'Basic first aid assistance' },
      { id: 'doctor-visit', name: 'Doctor Visit Arrangement', description: 'Arrange doctor home visit' },
      { id: 'lab-test', name: 'Lab Test Sample Collection', description: 'Sample collection from home' },
      { id: 'oxygen', name: 'Oxygen Cylinder', description: 'Oxygen cylinder rental/refill' },
    ],
  },
  {
    id: 'funeral',
    name: 'Funeral Services',
    icon: '🕯️',
    description: 'Complete funeral arrangement services',
    options: [
      { id: 'freezer-box', name: 'Freezer Box Rental', description: 'Freezer box for body preservation' },
      { id: 'band', name: 'Drums/Band', description: 'Thavil, Nadaswaram arrangements' },
      { id: 'flowers', name: 'Flower Arrangements', description: 'Funeral flower arrangements' },
      { id: 'priest', name: 'Priest Booking', description: 'Book priest for rituals' },
      { id: 'vehicle', name: 'Vehicle Arrangement', description: 'Hearse van and other vehicles' },
      { id: 'cremation', name: 'Cremation Arrangement', description: 'Complete cremation service' },
    ],
  },
  {
    id: 'festival',
    name: 'Festival & Sound',
    icon: '🎵',
    description: 'Sound systems and equipment for events',
    options: [
      { id: 'dj', name: 'DJ Sound System', description: 'Complete DJ setup with lights' },
      { id: 'speaker', name: 'Speaker Rental', description: 'Speaker systems for events' },
      { id: 'lighting', name: 'Stage Lighting', description: 'Stage lights and effects' },
      { id: 'generator', name: 'Generator Rental', description: 'Power generator for events' },
      { id: 'tent', name: 'Tent/Pandal Setup', description: 'Tent and pandal arrangements' },
      { id: 'led-screen', name: 'LED Screen', description: 'LED display screens' },
    ],
  },
  {
    id: 'decoration',
    name: 'Decoration',
    icon: '🎊',
    description: 'Decoration services for all occasions',
    options: [
      { id: 'wedding', name: 'Wedding Decoration', description: 'Complete wedding decoration' },
      { id: 'birthday', name: 'Birthday Setup', description: 'Birthday party decoration' },
      { id: 'stage', name: 'Stage Decoration', description: 'Stage setup and decoration' },
      { id: 'balloon', name: 'Balloon Decoration', description: 'Balloon arch and decoration' },
      { id: 'flower-decor', name: 'Flower Decoration', description: 'Flower arrangements and decoration' },
      { id: 'car', name: 'Car Decoration', description: 'Wedding car decoration' },
    ],
  },
  {
    id: 'drivers',
    name: 'Drivers',
    icon: '🚗',
    description: 'Professional drivers for your needs',
    options: [
      { id: 'acting-driver', name: 'Acting Driver', description: 'Driver for your personal vehicle' },
      { id: 'outstation', name: 'Outstation Driver', description: 'Driver for long distance trips' },
      { id: 'wedding-driver', name: 'Wedding Car Driver', description: 'Driver for wedding functions' },
      { id: 'night-driver', name: 'Night Driver', description: 'Driver for night travel' },
      { id: 'commercial', name: 'Commercial Driver', description: 'Driver for goods transport' },
      { id: 'temporary', name: 'Temporary Driver', description: 'Driver for few days/weeks' },
    ],
  },
  {
    id: 'agricultural',
    name: 'Agricultural',
    icon: '🚜',
    description: 'Agricultural equipment and workers',
    options: [
      { id: 'tractor', name: 'Tractor', description: 'Tractor for ploughing and farming' },
      { id: 'jcb', name: 'JCB/Excavator', description: 'JCB for digging and earth work' },
      { id: 'harvester', name: 'Harvester', description: 'Combine harvester for crops' },
      { id: 'tiller', name: 'Power Tiller', description: 'Power tiller for small farms' },
      { id: 'farm-workers', name: 'Farm Workers', description: 'Daily wage farm laborers' },
      { id: 'sprayer', name: 'Sprayer Service', description: 'Pesticide and fertilizer spraying' },
    ],
  },
];

// Main service types for home page
export const MAIN_SERVICES = [
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛒',
    description: 'Order groceries, vegetables & more',
    color: 'from-orange-500 to-red-500',
    href: '/shop',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🛵',
    description: 'Book bike or auto rides',
    color: 'from-blue-500 to-cyan-500',
    href: '/ride',
  },
  {
    id: 'services',
    name: 'Services',
    icon: '🔧',
    description: 'Plumbing, electrical & more',
    color: 'from-green-500 to-emerald-500',
    href: '/services',
  },
  {
    id: 'events',
    name: 'Events',
    icon: '🎉',
    description: 'Funeral, festival & decoration',
    color: 'from-purple-500 to-pink-500',
    href: '/services?type=events',
  },
];

// Get service category by ID
export function getServiceCategory(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((cat) => cat.id === id);
}

// Get service option by category and option ID
export function getServiceOption(categoryId: string, optionId: string) {
  const category = getServiceCategory(categoryId);
  return category?.options.find((opt) => opt.id === optionId);
}
