export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  tags: string[];
  trending?: boolean;
  featured?: boolean;
  description: string;
  bestSeason: string;
  temperature: string;
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  class: "economy" | "business" | "first";
  refundable: boolean;
  meals: boolean;
  baggage: string;
  seatsLeft: number;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  stars: number;
  amenities: string[];
  tags: string[];
  featured?: boolean;
  description: string;
  checkIn: string;
  checkOut: string;
}

export interface Package {
  id: string;
  title: string;
  destination: string;
  image: string;
  images: string[];
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: "luxury" | "adventure" | "honeymoon" | "family" | "pilgrimage" | "international" | "domestic";
  includes: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  featured?: boolean;
  trending?: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Tour {
  id: string;
  title: string;
  destination: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  groupSize: string;
  difficulty: "easy" | "moderate" | "challenging";
  category: string;
  highlights: string[];
  included: string[];
  excluded: string[];
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  destination?: string;
  verified: boolean;
  helpful: number;
}

export interface SearchParams {
  type: "flights" | "hotels" | "packages" | "tours" | "activities";
  from?: string;
  to?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  infants?: number;
  rooms?: number;
  class?: string;
  tripType?: "one-way" | "round-trip" | "multi-city";
}

export interface WishlistItem {
  id: string;
  type: "destination" | "hotel" | "package" | "tour" | "flight";
  itemId: string;
  title: string;
  image: string;
  price: number;
  addedAt: string;
}

export interface CartItem {
  id: string;
  type: "flight" | "hotel" | "package" | "tour" | "activity";
  title: string;
  image: string;
  price: number;
  quantity: number;
  details: Record<string, string | number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  nationality?: string;
  rewards: number;
  wallet: number;
  tier: "silver" | "gold" | "platinum";
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}
