


export const mockUsers = [
  {
    id: '1',
    name: 'Thabo Mthembu',
    email: 'thabo@example.com',
    phone: '+27123456789',
    role: 'donor',
    location: {
      latitude: -26.2041,
      longitude: 28.0473,
      address: 'Johannesburg, South Africa'
    },
    profileImage: null,
    householdSize: null,
    createdAt: new Date('2024-01-15'),
    isVerified: true,
  },
  {
    id: '2',
    name: 'Nomsa Dlamini',
    email: 'nomsa@example.com',
    phone: '+27987654321',
    role: 'recipient',
    location: {
      latitude: -26.2041,
      longitude: 28.0473,
      address: 'Soweto, Johannesburg'
    },
    profileImage: null,
    householdSize: 4,
    createdAt: new Date('2024-01-20'),
    isVerified: true,
  },
  {
    id: '3',
    name: 'Pieter van der Merwe',
    email: 'pieter@example.com',
    phone: '+27555666777',
    role: 'volunteer',
    location: {
      latitude: -33.9249,
      longitude: 18.4241,
      address: 'Cape Town, South Africa'
    },
    profileImage: null,
    householdSize: null,
    createdAt: new Date('2024-01-25'),
    isVerified: true,
  }
];

export const mockDonations = [
  {
    id: '1',
    donorId: '1',
    donorName: 'Thabo Mthembu',
    itemName: 'Fresh Vegetables',
    description: 'Mixed vegetables from my garden - carrots, spinach, and tomatoes. All fresh and organic.',
    quantity: '5 kg',
    expiryDate: new Date('2024-02-15'),
    location: {
      latitude: -26.2041,
      longitude: 28.0473,
      address: 'Johannesburg, South Africa'
    },
    pickupTime: {
      start: '09:00',
      end: '17:00'
    },
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    category: 'vegetables',
    status: 'available',
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date('2024-01-30'),
    isVerified: true,
  },
  {
    id: '2',
    donorId: '1',
    donorName: 'Thabo Mthembu',
    itemName: 'Bread and Pastries',
    description: 'Fresh bread and pastries from local bakery. Still warm and delicious.',
    quantity: '12 pieces',
    expiryDate: new Date('2024-02-01'),
    location: {
      latitude: -26.2150,
      longitude: 28.0380,
      address: 'Soweto, Johannesburg'
    },
    pickupTime: {
      start: '08:00',
      end: '18:00'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    category: 'bakery',
    status: 'available',
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date('2024-01-30'),
    isVerified: true,
  },
  {
    id: '3',
    donorId: '3',
    donorName: 'Pieter van der Merwe',
    itemName: 'Fruit Basket',
    description: 'Mixed fruit basket with apples, oranges, and bananas. Perfect for a family.',
    quantity: '3 kg',
    expiryDate: new Date('2024-02-10'),
    location: {
      latitude: -33.9249,
      longitude: 18.4241,
      address: 'Cape Town, South Africa'
    },
    pickupTime: {
      start: '10:00',
      end: '16:00'
    },
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
    category: 'fruits',
    status: 'claimed',
    claimedBy: '2',
    claimedAt: new Date('2024-01-29'),
    createdAt: new Date('2024-01-28'),
    isVerified: true,
  },
  {
    id: '4',
    donorId: '1',
    donorName: 'Thabo Mthembu',
    itemName: 'Rice and Beans',
    description: 'Cooked rice and beans from community kitchen. Ready to eat.',
    quantity: '8 portions',
    expiryDate: new Date('2024-02-02'),
    location: {
      latitude: -26.1930,
      longitude: 28.0560,
      address: 'Sandton, Johannesburg'
    },
    pickupTime: {
      start: '12:00',
      end: '20:00'
    },
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    category: 'cooked',
    status: 'available',
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date('2024-01-30'),
    isVerified: true,
  },
  {
    id: '5',
    donorId: '2',
    donorName: 'Nomsa Dlamini',
    itemName: 'Dairy Products',
    description: 'Fresh milk, cheese, and yogurt from local dairy farm.',
    quantity: '6 items',
    expiryDate: new Date('2024-02-05'),
    location: {
      latitude: -26.1800,
      longitude: 28.0200,
      address: 'Midrand, Johannesburg'
    },
    pickupTime: {
      start: '07:00',
      end: '19:00'
    },
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    category: 'dairy',
    status: 'available',
    claimedBy: null,
    claimedAt: null,
    createdAt: new Date('2024-01-30'),
    isVerified: true,
  }
];

export const mockNotifications = [
  {
    id: '1',
    userId: '2',
    type: 'new_donation',
    title: 'New donation nearby',
    message: 'Fresh vegetables available 2km away',
    donationId: '1',
    isRead: false,
    createdAt: new Date('2024-01-30T10:00:00'),
  },
  {
    id: '2',
    userId: '2',
    type: 'pickup_reminder',
    title: 'Pickup reminder',
    message: 'Your claimed fruit basket pickup is in 2 hours',
    donationId: '3',
    isRead: false,
    createdAt: new Date('2024-01-30T08:00:00'),
  },
  {
    id: '3',
    userId: '1',
    type: 'donation_claimed',
    title: 'Donation claimed',
    message: 'Your fruit basket has been claimed by Nomsa Dlamini',
    donationId: '3',
    isRead: true,
    createdAt: new Date('2024-01-29T15:30:00'),
  }
];

export const mockCategories = [
  { id: 'vegetables', name: 'Vegetables', icon: '🥕' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'meat', name: 'Meat', icon: '🥩' },
  { id: 'cooked', name: 'Cooked Food', icon: '🍲' },
  { id: 'canned', name: 'Canned Goods', icon: '🥫' },
  { id: 'other', name: 'Other', icon: '📦' },
];

export const mockNutritionalTips = [
  {
    id: '1',
    title: 'Balanced Nutrition',
    content: 'Aim for a variety of colors on your plate - green vegetables, orange fruits, and whole grains provide essential vitamins and minerals.',
    category: 'general',
  },
  {
    id: '2',
    title: 'Food Safety',
    content: 'Always check expiry dates and store perishable items in the refrigerator. When in doubt, throw it out.',
    category: 'safety',
  },
  {
    id: '3',
    title: 'Portion Control',
    content: 'Use your hand as a guide - a palm-sized portion of protein, a fist-sized portion of vegetables, and a cupped hand of grains.',
    category: 'portion',
  },
  {
    id: '4',
    title: 'Hydration',
    content: 'Drink at least 8 glasses of water daily. Add lemon or cucumber for flavor and extra nutrients.',
    category: 'hydration',
  }
];


export const mockCurrentUser = mockUsers[0];
