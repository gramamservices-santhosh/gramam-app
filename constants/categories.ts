import { Category, Product } from '@/types';

export const CATEGORIES: Omit<Category, 'createdAt'>[] = [
  {
    id: 'groceries',
    name: 'Groceries',
    nameLocal: 'மளிகை சாமான்கள்',
    icon: '🛒',
    order: 1,
    isActive: true,
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    nameLocal: 'காய்கறிகள்',
    icon: '🥬',
    order: 2,
    isActive: true,
  },
  {
    id: 'fruits',
    name: 'Fruits',
    nameLocal: 'பழங்கள்',
    icon: '🍎',
    order: 3,
    isActive: true,
  },
  {
    id: 'dairy',
    name: 'Dairy',
    nameLocal: 'பால் பொருட்கள்',
    icon: '🥛',
    order: 4,
    isActive: true,
  },
  {
    id: 'medicines',
    name: 'Medicines',
    nameLocal: 'மருந்துகள்',
    icon: '💊',
    order: 5,
    isActive: true,
  },
  {
    id: 'snacks',
    name: 'Snacks',
    nameLocal: 'தின்பண்டங்கள்',
    icon: '🍪',
    order: 6,
    isActive: true,
  },
  {
    id: 'household',
    name: 'Household',
    nameLocal: 'வீட்டு பொருட்கள்',
    icon: '🧹',
    order: 7,
    isActive: true,
  },
  {
    id: 'meat',
    name: 'Meat & Fish',
    nameLocal: 'இறைச்சி & மீன்',
    icon: '🍖',
    order: 8,
    isActive: true,
  },
];

// Sample products for each category
export const SAMPLE_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  // Groceries
  { name: 'Rice - Ponni (1kg)', category: 'groceries', price: 55, unit: 'kg', inStock: true, isActive: true, description: 'Premium quality Ponni rice' },
  { name: 'Rice - Basmati (1kg)', category: 'groceries', price: 120, unit: 'kg', inStock: true, isActive: true, description: 'Long grain Basmati rice' },
  { name: 'Wheat Flour (1kg)', category: 'groceries', price: 45, unit: 'kg', inStock: true, isActive: true, description: 'Fresh chakki atta' },
  { name: 'Toor Dal (1kg)', category: 'groceries', price: 150, unit: 'kg', inStock: true, isActive: true, description: 'Yellow toor dal' },
  { name: 'Urad Dal (1kg)', category: 'groceries', price: 140, unit: 'kg', inStock: true, isActive: true, description: 'White urad dal' },
  { name: 'Moong Dal (1kg)', category: 'groceries', price: 130, unit: 'kg', inStock: true, isActive: true, description: 'Yellow moong dal' },
  { name: 'Cooking Oil (1L)', category: 'groceries', price: 160, unit: 'L', inStock: true, isActive: true, description: 'Refined sunflower oil' },
  { name: 'Groundnut Oil (1L)', category: 'groceries', price: 220, unit: 'L', inStock: true, isActive: true, description: 'Cold pressed groundnut oil' },
  { name: 'Sugar (1kg)', category: 'groceries', price: 45, unit: 'kg', inStock: true, isActive: true, description: 'White sugar' },
  { name: 'Salt (1kg)', category: 'groceries', price: 25, unit: 'kg', inStock: true, isActive: true, description: 'Iodized salt' },
  { name: 'Turmeric Powder (100g)', category: 'groceries', price: 35, unit: '100g', inStock: true, isActive: true, description: 'Pure turmeric powder' },
  { name: 'Red Chilli Powder (100g)', category: 'groceries', price: 40, unit: '100g', inStock: true, isActive: true, description: 'Spicy red chilli powder' },
  { name: 'Coriander Powder (100g)', category: 'groceries', price: 30, unit: '100g', inStock: true, isActive: true, description: 'Fresh coriander powder' },
  { name: 'Cumin Seeds (100g)', category: 'groceries', price: 50, unit: '100g', inStock: true, isActive: true, description: 'Whole cumin seeds' },
  { name: 'Mustard Seeds (100g)', category: 'groceries', price: 25, unit: '100g', inStock: true, isActive: true, description: 'Black mustard seeds' },

  // Vegetables
  { name: 'Tomato (1kg)', category: 'vegetables', price: 40, unit: 'kg', inStock: true, isActive: true, description: 'Fresh red tomatoes' },
  { name: 'Onion (1kg)', category: 'vegetables', price: 35, unit: 'kg', inStock: true, isActive: true, description: 'Fresh onions' },
  { name: 'Potato (1kg)', category: 'vegetables', price: 30, unit: 'kg', inStock: true, isActive: true, description: 'Fresh potatoes' },
  { name: 'Green Chilli (250g)', category: 'vegetables', price: 20, unit: '250g', inStock: true, isActive: true, description: 'Fresh green chillies' },
  { name: 'Carrot (500g)', category: 'vegetables', price: 25, unit: '500g', inStock: true, isActive: true, description: 'Fresh carrots' },
  { name: 'Beans (500g)', category: 'vegetables', price: 30, unit: '500g', inStock: true, isActive: true, description: 'Fresh green beans' },
  { name: 'Brinjal (500g)', category: 'vegetables', price: 25, unit: '500g', inStock: true, isActive: true, description: 'Fresh brinjal' },
  { name: 'Cabbage (1pc)', category: 'vegetables', price: 30, unit: 'pc', inStock: true, isActive: true, description: 'Fresh cabbage' },
  { name: 'Cauliflower (1pc)', category: 'vegetables', price: 35, unit: 'pc', inStock: true, isActive: true, description: 'Fresh cauliflower' },
  { name: 'Drumstick (250g)', category: 'vegetables', price: 30, unit: '250g', inStock: true, isActive: true, description: 'Fresh drumsticks' },
  { name: 'Coriander Leaves (1 bunch)', category: 'vegetables', price: 10, unit: 'bunch', inStock: true, isActive: true, description: 'Fresh coriander' },
  { name: 'Curry Leaves (1 bunch)', category: 'vegetables', price: 5, unit: 'bunch', inStock: true, isActive: true, description: 'Fresh curry leaves' },

  // Fruits
  { name: 'Banana (1 dozen)', category: 'fruits', price: 50, unit: 'dozen', inStock: true, isActive: true, description: 'Fresh bananas' },
  { name: 'Apple (1kg)', category: 'fruits', price: 180, unit: 'kg', inStock: true, isActive: true, description: 'Fresh apples' },
  { name: 'Orange (1kg)', category: 'fruits', price: 80, unit: 'kg', inStock: true, isActive: true, description: 'Fresh oranges' },
  { name: 'Grapes (500g)', category: 'fruits', price: 60, unit: '500g', inStock: true, isActive: true, description: 'Fresh grapes' },
  { name: 'Papaya (1pc)', category: 'fruits', price: 40, unit: 'pc', inStock: true, isActive: true, description: 'Fresh papaya' },
  { name: 'Pomegranate (1kg)', category: 'fruits', price: 150, unit: 'kg', inStock: true, isActive: true, description: 'Fresh pomegranate' },

  // Dairy
  { name: 'Milk (500ml)', category: 'dairy', price: 28, unit: '500ml', inStock: true, isActive: true, description: 'Fresh cow milk' },
  { name: 'Milk (1L)', category: 'dairy', price: 55, unit: '1L', inStock: true, isActive: true, description: 'Fresh cow milk' },
  { name: 'Curd (500g)', category: 'dairy', price: 35, unit: '500g', inStock: true, isActive: true, description: 'Fresh curd' },
  { name: 'Butter (100g)', category: 'dairy', price: 55, unit: '100g', inStock: true, isActive: true, description: 'Fresh butter' },
  { name: 'Paneer (200g)', category: 'dairy', price: 80, unit: '200g', inStock: true, isActive: true, description: 'Fresh paneer' },
  { name: 'Ghee (500ml)', category: 'dairy', price: 350, unit: '500ml', inStock: true, isActive: true, description: 'Pure cow ghee' },
  { name: 'Cheese (200g)', category: 'dairy', price: 120, unit: '200g', inStock: true, isActive: true, description: 'Amul cheese' },

  // Medicines
  { name: 'Paracetamol (10 tablets)', category: 'medicines', price: 15, unit: 'strip', inStock: true, isActive: true, description: 'For fever and pain' },
  { name: 'Crocin (10 tablets)', category: 'medicines', price: 25, unit: 'strip', inStock: true, isActive: true, description: 'Pain relief tablets' },
  { name: 'Digene (15 tablets)', category: 'medicines', price: 45, unit: 'strip', inStock: true, isActive: true, description: 'Antacid tablets' },
  { name: 'Vicks (10ml)', category: 'medicines', price: 30, unit: 'pc', inStock: true, isActive: true, description: 'Vicks vaporub' },
  { name: 'Dettol (100ml)', category: 'medicines', price: 55, unit: '100ml', inStock: true, isActive: true, description: 'Antiseptic liquid' },
  { name: 'Bandage (1 roll)', category: 'medicines', price: 20, unit: 'roll', inStock: true, isActive: true, description: 'Cotton bandage' },
  { name: 'Cotton (50g)', category: 'medicines', price: 25, unit: '50g', inStock: true, isActive: true, description: 'Surgical cotton' },

  // Snacks
  { name: 'Biscuits - Parle G', category: 'snacks', price: 10, unit: 'pack', inStock: true, isActive: true, description: 'Glucose biscuits' },
  { name: 'Biscuits - Good Day', category: 'snacks', price: 30, unit: 'pack', inStock: true, isActive: true, description: 'Butter cookies' },
  { name: 'Lays Chips', category: 'snacks', price: 20, unit: 'pack', inStock: true, isActive: true, description: 'Classic salted' },
  { name: 'Kurkure', category: 'snacks', price: 20, unit: 'pack', inStock: true, isActive: true, description: 'Masala munch' },
  { name: 'Mixture (200g)', category: 'snacks', price: 50, unit: '200g', inStock: true, isActive: true, description: 'South Indian mixture' },
  { name: 'Murukku (200g)', category: 'snacks', price: 60, unit: '200g', inStock: true, isActive: true, description: 'Crispy murukku' },
  { name: 'Chocolate - Dairy Milk', category: 'snacks', price: 40, unit: 'pc', inStock: true, isActive: true, description: 'Cadbury Dairy Milk' },
  { name: 'Chocolate - 5 Star', category: 'snacks', price: 20, unit: 'pc', inStock: true, isActive: true, description: 'Cadbury 5 Star' },

  // Household
  { name: 'Soap - Lux', category: 'household', price: 40, unit: 'pc', inStock: true, isActive: true, description: 'Bathing soap' },
  { name: 'Soap - Lifebuoy', category: 'household', price: 35, unit: 'pc', inStock: true, isActive: true, description: 'Antibacterial soap' },
  { name: 'Shampoo - Head & Shoulders', category: 'household', price: 120, unit: '180ml', inStock: true, isActive: true, description: 'Anti-dandruff shampoo' },
  { name: 'Detergent - Surf Excel (1kg)', category: 'household', price: 150, unit: 'kg', inStock: true, isActive: true, description: 'Washing powder' },
  { name: 'Dish Wash - Vim Bar', category: 'household', price: 25, unit: 'pc', inStock: true, isActive: true, description: 'Dish wash bar' },
  { name: 'Dish Wash - Vim Liquid (250ml)', category: 'household', price: 65, unit: '250ml', inStock: true, isActive: true, description: 'Dish wash liquid' },
  { name: 'Floor Cleaner (500ml)', category: 'household', price: 75, unit: '500ml', inStock: true, isActive: true, description: 'Lizol floor cleaner' },
  { name: 'Toilet Cleaner (500ml)', category: 'household', price: 80, unit: '500ml', inStock: true, isActive: true, description: 'Harpic toilet cleaner' },
  { name: 'Mosquito Coil (10pc)', category: 'household', price: 30, unit: 'pack', inStock: true, isActive: true, description: 'Good Knight coil' },
  { name: 'Broom', category: 'household', price: 50, unit: 'pc', inStock: true, isActive: true, description: 'Grass broom' },

  // Meat & Fish
  { name: 'Chicken (1kg)', category: 'meat', price: 200, unit: 'kg', inStock: true, isActive: true, description: 'Fresh chicken' },
  { name: 'Mutton (1kg)', category: 'meat', price: 700, unit: 'kg', inStock: true, isActive: true, description: 'Fresh mutton' },
  { name: 'Fish - Seer (1kg)', category: 'meat', price: 600, unit: 'kg', inStock: true, isActive: true, description: 'Fresh seer fish' },
  { name: 'Fish - Rohu (1kg)', category: 'meat', price: 250, unit: 'kg', inStock: true, isActive: true, description: 'Fresh rohu fish' },
  { name: 'Eggs (12pc)', category: 'meat', price: 80, unit: 'dozen', inStock: true, isActive: true, description: 'Fresh eggs' },
  { name: 'Prawns (500g)', category: 'meat', price: 350, unit: '500g', inStock: true, isActive: true, description: 'Fresh prawns' },
];

// Get products by category
export function getProductsByCategory(categoryId: string): Omit<Product, 'id' | 'createdAt'>[] {
  return SAMPLE_PRODUCTS.filter((p) => p.category === categoryId);
}
