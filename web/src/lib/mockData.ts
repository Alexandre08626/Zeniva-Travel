// Mock data for Partner Portal demo mode
export const mockListings = [
  {
    id: 'listing-1',
    title: 'Luxury Yacht Mediterranean Explorer',
    type: 'yacht',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    location: 'Monaco, French Riviera',
    price: 5000,
    currency: 'EUR',
    capacity: 12,
    bedrooms: 5,
    bathrooms: 4,
    description: 'Experience ultimate luxury aboard this stunning 85-foot yacht. Perfect for Mediterranean adventures with professional crew included.',
    amenities: ['WiFi', 'Air Conditioning', 'Professional Crew', 'Water Sports Equipment', 'Tender Boat', 'BBQ Grill'],
    views: 1847,
    bookings: 23,
    revenue: 115000,
    rating: 4.9,
    reviews: 18,
    createdAt: '2025-09-15',
    updatedAt: '2026-01-15'
  },
  {
    id: 'listing-2',
    title: 'Cozy Mountain Chalet with Spectacular Views',
    type: 'home',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
    location: 'Chamonix, France',
    price: 450,
    currency: 'EUR',
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    description: 'Stunning alpine chalet with breathtaking mountain views. Perfect for ski season or summer hiking adventures.',
    amenities: ['WiFi', 'Fireplace', 'Ski Storage', 'Hot Tub', 'Mountain Views', 'Parking'],
    views: 3241,
    bookings: 45,
    revenue: 20250,
    rating: 4.8,
    reviews: 32,
    createdAt: '2025-08-10',
    updatedAt: '2026-01-12'
  },
  {
    id: 'listing-3',
    title: 'Boutique Beach Resort - Premium Suite',
    type: 'hotel',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    location: 'Santorini, Greece',
    price: 380,
    currency: 'EUR',
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    description: 'Elegant suite with private balcony overlooking the Aegean Sea. Includes breakfast and access to infinity pool.',
    amenities: ['WiFi', 'Ocean View', 'Infinity Pool', 'Breakfast Included', 'Spa Access', 'Concierge'],
    views: 5892,
    bookings: 67,
    revenue: 25460,
    rating: 5.0,
    reviews: 54,
    createdAt: '2025-07-01',
    updatedAt: '2026-01-18'
  },
  {
    id: 'listing-4',
    title: 'Modern Downtown Loft - City Center',
    type: 'home',
    status: 'draft',
    thumbnail: 'https://images.unsplash.com/photo-1502672260066-6bc2617a1938?w=800&q=80',
    location: 'Barcelona, Spain',
    price: 220,
    currency: 'EUR',
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    description: 'Stylish loft apartment in the heart of Barcelona. Walking distance to Las Ramblas and Gothic Quarter.',
    amenities: ['WiFi', 'Air Conditioning', 'Elevator', 'City Views', 'Full Kitchen', 'Washer'],
    views: 0,
    bookings: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    createdAt: '2026-01-18',
    updatedAt: '2026-01-18'
  }
];

export const mockBookings = [
  {
    id: 'booking-1',
    listingId: 'listing-1',
    listingTitle: 'Luxury Yacht Mediterranean Explorer',
    guestName: 'James Richardson',
    guestEmail: 'james.r@example.com',
    guestPhone: '+44 20 7946 0958',
    guestAvatar: 'https://i.pravatar.cc/150?img=12',
    checkIn: '2026-02-15',
    checkOut: '2026-02-22',
    guests: 8,
    totalPrice: 35000,
    currency: 'EUR',
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-01-10T14:30:00Z',
    confirmedAt: '2026-01-10T15:45:00Z',
    specialRequests: 'Anniversary celebration - please arrange champagne and flowers',
    timeline: [
      { date: '2026-01-10T14:30:00Z', action: 'Booking requested', actor: 'James Richardson' },
      { date: '2026-01-10T15:45:00Z', action: 'Booking confirmed', actor: 'You' },
      { date: '2026-01-11T09:15:00Z', action: 'Payment received', actor: 'System' }
    ]
  },
  {
    id: 'booking-2',
    listingId: 'listing-2',
    listingTitle: 'Cozy Mountain Chalet',
    guestName: 'Sophie Martin',
    guestEmail: 'sophie.m@example.com',
    guestPhone: '+33 6 12 34 56 78',
    guestAvatar: 'https://i.pravatar.cc/150?img=45',
    checkIn: '2026-03-01',
    checkOut: '2026-03-08',
    guests: 6,
    totalPrice: 3150,
    currency: 'EUR',
    status: 'requested',
    paymentStatus: 'pending',
    createdAt: '2026-01-18T10:20:00Z',
    specialRequests: 'Arriving late, around 10 PM. Can we arrange late check-in?',
    timeline: [
      { date: '2026-01-18T10:20:00Z', action: 'Booking requested', actor: 'Sophie Martin' }
    ]
  },
  {
    id: 'booking-3',
    listingId: 'listing-3',
    listingTitle: 'Boutique Beach Resort',
    guestName: 'Michael Chen',
    guestEmail: 'michael.chen@example.com',
    guestPhone: '+1 415 555 0123',
    guestAvatar: 'https://i.pravatar.cc/150?img=33',
    checkIn: '2026-02-20',
    checkOut: '2026-02-27',
    guests: 2,
    totalPrice: 2660,
    currency: 'EUR',
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-01-05T08:15:00Z',
    confirmedAt: '2026-01-05T09:30:00Z',
    specialRequests: 'Honeymoon trip - room upgrade if available',
    timeline: [
      { date: '2026-01-05T08:15:00Z', action: 'Booking requested', actor: 'Michael Chen' },
      { date: '2026-01-05T09:30:00Z', action: 'Booking confirmed', actor: 'You' },
      { date: '2026-01-05T12:00:00Z', action: 'Payment received', actor: 'System' },
      { date: '2026-01-06T14:20:00Z', action: 'Upgraded to Deluxe Suite', actor: 'You' }
    ]
  },
  {
    id: 'booking-4',
    listingId: 'listing-1',
    listingTitle: 'Luxury Yacht Mediterranean Explorer',
    guestName: 'Emma Thompson',
    guestEmail: 'emma.t@example.com',
    guestPhone: '+44 20 7123 4567',
    guestAvatar: 'https://i.pravatar.cc/150?img=47',
    checkIn: '2026-04-10',
    checkOut: '2026-04-17',
    guests: 10,
    totalPrice: 35000,
    currency: 'EUR',
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2025-12-20T16:45:00Z',
    confirmedAt: '2025-12-21T10:00:00Z',
    cancelledAt: '2026-01-15T11:30:00Z',
    cancellationReason: 'Guest changed travel plans',
    timeline: [
      { date: '2025-12-20T16:45:00Z', action: 'Booking requested', actor: 'Emma Thompson' },
      { date: '2025-12-21T10:00:00Z', action: 'Booking confirmed', actor: 'You' },
      { date: '2025-12-21T14:30:00Z', action: 'Payment received', actor: 'System' },
      { date: '2026-01-15T11:30:00Z', action: 'Booking cancelled', actor: 'Emma Thompson' },
      { date: '2026-01-15T12:00:00Z', action: 'Refund processed', actor: 'System' }
    ]
  }
];

export const mockThreads = [
  {
    id: 'thread-1',
    guestName: 'James Richardson',
    guestAvatar: 'https://i.pravatar.cc/150?img=12',
    listingTitle: 'Luxury Yacht Mediterranean Explorer',
    bookingId: 'booking-1',
    lastMessage: 'Thank you! Looking forward to our trip.',
    lastMessageAt: '2026-01-11T10:30:00Z',
    unread: 0,
    messages: [
      { id: 'msg-1', sender: 'guest', text: 'Hi, I have a booking for February. Can you arrange champagne for our anniversary?', timestamp: '2026-01-11T09:00:00Z' },
      { id: 'msg-2', sender: 'host', text: 'Absolutely! We\'d be delighted to help celebrate your anniversary. I\'ll arrange a bottle of premium champagne and flowers in your cabin.', timestamp: '2026-01-11T09:15:00Z' },
      { id: 'msg-3', sender: 'guest', text: 'That sounds perfect! Also, what time can we board?', timestamp: '2026-01-11T10:00:00Z' },
      { id: 'msg-4', sender: 'host', text: 'Check-in is from 2 PM. Our crew will be ready to welcome you aboard. Let me know if you need earlier boarding.', timestamp: '2026-01-11T10:15:00Z' },
      { id: 'msg-5', sender: 'guest', text: 'Thank you! Looking forward to our trip.', timestamp: '2026-01-11T10:30:00Z' }
    ]
  },
  {
    id: 'thread-2',
    guestName: 'Sophie Martin',
    guestAvatar: 'https://i.pravatar.cc/150?img=45',
    listingTitle: 'Cozy Mountain Chalet',
    bookingId: 'booking-2',
    lastMessage: 'Will you be able to accommodate late check-in around 10 PM?',
    lastMessageAt: '2026-01-18T11:45:00Z',
    unread: 1,
    messages: [
      { id: 'msg-6', sender: 'guest', text: 'Hello! I just made a booking for March. We\'re arriving quite late - around 10 PM.', timestamp: '2026-01-18T11:30:00Z' },
      { id: 'msg-7', sender: 'guest', text: 'Will you be able to accommodate late check-in around 10 PM?', timestamp: '2026-01-18T11:45:00Z' }
    ]
  },
  {
    id: 'thread-3',
    guestName: 'Michael Chen',
    guestAvatar: 'https://i.pravatar.cc/150?img=33',
    listingTitle: 'Boutique Beach Resort',
    bookingId: 'booking-3',
    lastMessage: 'The upgrade is wonderful, thank you so much!',
    lastMessageAt: '2026-01-06T15:00:00Z',
    unread: 0,
    messages: [
      { id: 'msg-8', sender: 'guest', text: 'Hi, this is our honeymoon trip. Is there any possibility of a room upgrade?', timestamp: '2026-01-05T14:00:00Z' },
      { id: 'msg-9', sender: 'host', text: 'Congratulations on your wedding! I\'ve upgraded you to our Deluxe Suite with panoramic ocean views - complimentary for your honeymoon.', timestamp: '2026-01-06T14:20:00Z' },
      { id: 'msg-10', sender: 'guest', text: 'The upgrade is wonderful, thank you so much!', timestamp: '2026-01-06T15:00:00Z' }
    ]
  }
];

export const mockPayouts = [
  {
    id: 'payout-1',
    amount: 15750,
    currency: 'EUR',
    status: 'completed',
    date: '2026-01-15',
    bookingsCount: 8,
    method: 'Bank Transfer',
    bookings: ['booking-1', 'booking-3']
  },
  {
    id: 'payout-2',
    amount: 8400,
    currency: 'EUR',
    status: 'pending',
    date: '2026-02-01',
    bookingsCount: 4,
    method: 'Bank Transfer',
    bookings: []
  },
  {
    id: 'payout-3',
    amount: 22100,
    currency: 'EUR',
    status: 'completed',
    date: '2025-12-15',
    bookingsCount: 12,
    method: 'Bank Transfer',
    bookings: []
  }
];

export const mockCalendarData = {
  'listing-1': [
    { date: '2026-02-15', available: false, reason: 'Booked by James Richardson' },
    { date: '2026-02-16', available: false, reason: 'Booked by James Richardson' },
    { date: '2026-02-17', available: false, reason: 'Booked by James Richardson' },
    { date: '2026-02-18', available: false, reason: 'Booked by James Richardson' },
    { date: '2026-02-19', available: false, reason: 'Booked by James Richardson' },
    { date: '2026-02-20', available: false, reason: 'Booked by James Richardson' },
    { date: '2026-02-21', available: false, reason: 'Booked by James Richardson' },
    { date: '2026-02-22', available: true, price: 5000 },
    { date: '2026-03-01', available: false, reason: 'Maintenance' },
    { date: '2026-03-15', available: true, price: 6000, priceOverride: true },
  ],
  'listing-2': [
    { date: '2026-02-28', available: true, price: 450 },
    { date: '2026-03-01', available: false, reason: 'Booked by Sophie Martin' },
    { date: '2026-03-02', available: false, reason: 'Booked by Sophie Martin' },
    { date: '2026-03-15', available: true, price: 550, priceOverride: true },
  ],
  'listing-3': [
    { date: '2026-02-20', available: false, reason: 'Booked by Michael Chen' },
    { date: '2026-02-21', available: false, reason: 'Booked by Michael Chen' },
    { date: '2026-03-10', available: true, price: 420, priceOverride: true },
  ]
};
