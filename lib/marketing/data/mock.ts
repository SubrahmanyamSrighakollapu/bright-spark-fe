import type { Destination, Package, Hotel, Tour, Review, BlogPost, Flight } from "@/types/marketing";

export const DESTINATIONS: Destination[] = [
  { id: "1", name: "Bali", country: "Indonesia", continent: "Asia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", rating: 4.9, reviews: 12840, price: 899, currency: "USD", tags: ["Beach", "Culture", "Temples"], trending: true, featured: true, description: "Island of the Gods with stunning temples, rice terraces, and pristine beaches.", bestSeason: "Apr–Oct", temperature: "27°C" },
  { id: "2", name: "Santorini", country: "Greece", continent: "Europe", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80", rating: 4.8, reviews: 9320, price: 1299, currency: "USD", tags: ["Romantic", "Views", "Wine"], trending: true, featured: true, description: "Iconic white-washed buildings perched on volcanic cliffs above the Aegean Sea.", bestSeason: "May–Oct", temperature: "25°C" },
  { id: "3", name: "Maldives", country: "Maldives", continent: "Asia", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", rating: 4.9, reviews: 8760, price: 2499, currency: "USD", tags: ["Luxury", "Beach", "Diving"], trending: false, featured: true, description: "Crystal-clear lagoons, overwater bungalows, and vibrant coral reefs.", bestSeason: "Nov–Apr", temperature: "30°C" },
  { id: "4", name: "Kyoto", country: "Japan", continent: "Asia", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", rating: 4.8, reviews: 11200, price: 1099, currency: "USD", tags: ["Culture", "Temples", "Cherry Blossom"], trending: true, featured: false, description: "Ancient capital with thousands of classical Buddhist temples and Shinto shrines.", bestSeason: "Mar–May", temperature: "18°C" },
  { id: "5", name: "Paris", country: "France", continent: "Europe", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", rating: 4.7, reviews: 18900, price: 1199, currency: "USD", tags: ["Romance", "Art", "Food"], trending: false, featured: true, description: "The City of Light — art, fashion, gastronomy, and the iconic Eiffel Tower.", bestSeason: "Apr–Jun", temperature: "20°C" },
  { id: "6", name: "Dubai", country: "UAE", continent: "Asia", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", rating: 4.7, reviews: 14500, price: 1399, currency: "USD", tags: ["Luxury", "Shopping", "Modern"], trending: true, featured: true, description: "Futuristic skyline, world-class shopping, and desert adventures.", bestSeason: "Nov–Mar", temperature: "24°C" },
  { id: "7", name: "New York", country: "USA", continent: "Americas", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", rating: 4.6, reviews: 22100, price: 1599, currency: "USD", tags: ["City", "Culture", "Food"], trending: false, featured: false, description: "The city that never sleeps — iconic skyline, Broadway, and world-class dining.", bestSeason: "Sep–Nov", temperature: "15°C" },
  { id: "8", name: "Machu Picchu", country: "Peru", continent: "Americas", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80", rating: 4.9, reviews: 7800, price: 1799, currency: "USD", tags: ["Adventure", "History", "Hiking"], trending: true, featured: false, description: "The Lost City of the Incas — a UNESCO World Heritage Site in the Andes.", bestSeason: "May–Sep", temperature: "17°C" },
  { id: "9", name: "Amalfi Coast", country: "Italy", continent: "Europe", image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=80", rating: 4.8, reviews: 6540, price: 1499, currency: "USD", tags: ["Scenic", "Beach", "Food"], trending: false, featured: true, description: "Dramatic cliffs, colorful villages, and turquoise Mediterranean waters.", bestSeason: "May–Sep", temperature: "26°C" },
  { id: "10", name: "Safari Kenya", country: "Kenya", continent: "Africa", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80", rating: 4.9, reviews: 5200, price: 2999, currency: "USD", tags: ["Safari", "Wildlife", "Adventure"], trending: true, featured: true, description: "Witness the Great Migration and Africa's Big Five in their natural habitat.", bestSeason: "Jul–Oct", temperature: "22°C" },
  { id: "11", name: "Rajasthan", country: "India", continent: "Asia", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80", rating: 4.7, reviews: 9800, price: 599, currency: "USD", tags: ["Culture", "Palaces", "Desert"], trending: false, featured: false, description: "Land of kings — majestic forts, vibrant culture, and golden desert landscapes.", bestSeason: "Oct–Mar", temperature: "25°C" },
  { id: "12", name: "Phuket", country: "Thailand", continent: "Asia", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80", rating: 4.6, reviews: 13400, price: 799, currency: "USD", tags: ["Beach", "Nightlife", "Food"], trending: true, featured: false, description: "Thailand's largest island with stunning beaches, vibrant nightlife, and Thai cuisine.", bestSeason: "Nov–Apr", temperature: "29°C" },
];

export const PACKAGES: Package[] = [
  {
    id: "1", title: "Bali Bliss — 7 Days of Paradise", destination: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80"],
    duration: "7 Days / 6 Nights", price: 1299, originalPrice: 1699, rating: 4.9, reviews: 2840,
    category: "luxury", featured: true, trending: true,
    includes: ["Flights", "5-Star Hotel", "Daily Breakfast", "Airport Transfers", "Guided Tours"],
    highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Seminyak Beach", "Cooking Class"],
    itinerary: [
      { day: 1, title: "Arrival & Seminyak", description: "Arrive in Bali, transfer to hotel, sunset at Seminyak Beach.", activities: ["Airport pickup", "Hotel check-in", "Sunset beach walk"] },
      { day: 2, title: "Ubud Cultural Tour", description: "Explore the cultural heart of Bali.", activities: ["Tegallalang Rice Terraces", "Ubud Monkey Forest", "Traditional dance show"] },
      { day: 3, title: "Temple Trail", description: "Visit Bali's most sacred temples.", activities: ["Tanah Lot", "Uluwatu Temple", "Kecak Fire Dance"] },
    ]
  },
  {
    id: "2", title: "Santorini Romantic Escape — 5 Days", destination: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80"],
    duration: "5 Days / 4 Nights", price: 2199, originalPrice: 2799, rating: 4.8, reviews: 1920,
    category: "honeymoon", featured: true, trending: false,
    includes: ["Flights", "Boutique Hotel", "Breakfast", "Wine Tasting", "Sunset Cruise"],
    highlights: ["Oia Sunset", "Caldera Views", "Wine Tasting", "Volcanic Beach"],
    itinerary: []
  },
  {
    id: "3", title: "Maldives Overwater Luxury — 6 Days", destination: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80"],
    duration: "6 Days / 5 Nights", price: 3999, originalPrice: 4999, rating: 4.9, reviews: 1540,
    category: "luxury", featured: true, trending: true,
    includes: ["Seaplane Transfer", "Overwater Villa", "All-Inclusive", "Snorkeling", "Spa"],
    highlights: ["Overwater Bungalow", "Coral Reef Snorkeling", "Dolphin Cruise", "Spa Treatment"],
    itinerary: []
  },
  {
    id: "4", title: "Japan Cherry Blossom Tour — 10 Days", destination: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80"],
    duration: "10 Days / 9 Nights", price: 2899, originalPrice: 3499, rating: 4.8, reviews: 2100,
    category: "international", featured: false, trending: true,
    includes: ["Flights", "Hotels", "JR Pass", "Guided Tours", "Breakfast"],
    highlights: ["Tokyo", "Kyoto Temples", "Mount Fuji", "Osaka Food Tour"],
    itinerary: []
  },
  {
    id: "5", title: "Kenya Safari Adventure — 8 Days", destination: "Kenya, Africa",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80"],
    duration: "8 Days / 7 Nights", price: 3499, originalPrice: 4299, rating: 4.9, reviews: 980,
    category: "adventure", featured: true, trending: false,
    includes: ["Flights", "Safari Lodge", "All Meals", "Game Drives", "Park Fees"],
    highlights: ["Great Migration", "Big Five", "Masai Village", "Hot Air Balloon"],
    itinerary: []
  },
  {
    id: "6", title: "Rajasthan Royal Heritage — 9 Days", destination: "Rajasthan, India",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80"],
    duration: "9 Days / 8 Nights", price: 899, originalPrice: 1199, rating: 4.7, reviews: 3200,
    category: "domestic", featured: false, trending: false,
    includes: ["Flights", "Heritage Hotels", "Breakfast & Dinner", "AC Transport", "Guide"],
    highlights: ["Jaipur Pink City", "Udaipur Lake Palace", "Jaisalmer Desert", "Camel Safari"],
    itinerary: []
  },
];

export const HOTELS: Hotel[] = [
  { id: "1", name: "The Oberoi Udaivilas", location: "Udaipur, Rajasthan", city: "Udaipur", country: "India", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", images: [], rating: 4.9, reviews: 2840, price: 450, originalPrice: 620, stars: 5, amenities: ["Pool", "Spa", "Restaurant", "WiFi", "Gym"], tags: ["Luxury", "Heritage", "Lake View"], featured: true, description: "A palace hotel on the banks of Lake Pichola.", checkIn: "2:00 PM", checkOut: "12:00 PM" },
  { id: "2", name: "Six Senses Laamu", location: "Laamu Atoll, Maldives", city: "Laamu", country: "Maldives", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", images: [], rating: 4.9, reviews: 1920, price: 1200, stars: 5, amenities: ["Overwater Villa", "Spa", "Diving", "Restaurant", "Bar"], tags: ["Overwater", "Luxury", "Eco"], featured: true, description: "Eco-luxury overwater resort in the pristine Maldives.", checkIn: "3:00 PM", checkOut: "11:00 AM" },
  { id: "3", name: "Aman Tokyo", location: "Tokyo, Japan", city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", images: [], rating: 4.8, reviews: 1540, price: 890, stars: 5, amenities: ["Spa", "Pool", "Restaurant", "Bar", "Gym"], tags: ["Urban Luxury", "Design", "Views"], featured: false, description: "Serene urban sanctuary in the heart of Tokyo.", checkIn: "3:00 PM", checkOut: "12:00 PM" },
  { id: "4", name: "Capella Ubud", location: "Ubud, Bali", city: "Ubud", country: "Indonesia", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", images: [], rating: 4.8, reviews: 2100, price: 680, originalPrice: 850, stars: 5, amenities: ["Jungle View", "Pool", "Spa", "Restaurant", "Yoga"], tags: ["Jungle", "Romantic", "Wellness"], featured: true, description: "Tented camp resort nestled in Bali's jungle.", checkIn: "2:00 PM", checkOut: "12:00 PM" },
  { id: "5", name: "Burj Al Arab", location: "Dubai, UAE", city: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", images: [], rating: 4.7, reviews: 3800, price: 1500, stars: 7, amenities: ["Private Beach", "Helipad", "Spa", "Multiple Restaurants", "Butler"], tags: ["Ultra Luxury", "Iconic", "Sea View"], featured: true, description: "The world's most luxurious hotel — a sail-shaped icon.", checkIn: "3:00 PM", checkOut: "12:00 PM" },
  { id: "6", name: "Hotel de Crillon", location: "Paris, France", city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", images: [], rating: 4.8, reviews: 2200, price: 950, stars: 5, amenities: ["Spa", "Pool", "Restaurant", "Bar", "Concierge"], tags: ["Historic", "Luxury", "Central"], featured: false, description: "An 18th-century palace hotel on Place de la Concorde.", checkIn: "3:00 PM", checkOut: "12:00 PM" },
];

export const TOURS: Tour[] = [
  { id: "1", title: "Bali Temples & Rice Terraces", destination: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", duration: "Full Day", price: 89, rating: 4.9, reviews: 4200, groupSize: "Max 12", difficulty: "easy", category: "Cultural", highlights: ["Tegallalang", "Tanah Lot", "Ubud Market"], included: ["Guide", "Transport", "Lunch"], excluded: ["Tips", "Personal expenses"] },
  { id: "2", title: "Kyoto Geisha District Walk", destination: "Kyoto", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", duration: "Half Day", price: 65, rating: 4.8, reviews: 3100, groupSize: "Max 8", difficulty: "easy", category: "Cultural", highlights: ["Gion District", "Fushimi Inari", "Tea Ceremony"], included: ["Guide", "Tea Ceremony"], excluded: ["Transport", "Meals"] },
  { id: "3", title: "Machu Picchu Sunrise Trek", destination: "Peru", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80", duration: "2 Days", price: 299, rating: 4.9, reviews: 2800, groupSize: "Max 16", difficulty: "challenging", category: "Adventure", highlights: ["Inca Trail", "Sun Gate", "Machu Picchu Citadel"], included: ["Guide", "Camping", "Meals", "Permits"], excluded: ["Flights", "Personal gear"] },
  { id: "4", title: "Serengeti Game Drive Safari", destination: "Tanzania", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80", duration: "3 Days", price: 599, rating: 4.9, reviews: 1900, groupSize: "Max 6", difficulty: "easy", category: "Wildlife", highlights: ["Big Five", "Great Migration", "Sundowner"], included: ["4x4 Vehicle", "Guide", "Lodge", "All Meals"], excluded: ["Flights", "Visa"] },
];

export const REVIEWS: Review[] = [
  { id: "1", author: "Sarah Mitchell", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", rating: 5, date: "2024-12-15", title: "Absolutely life-changing experience!", content: "Bright Spark Travel made our Bali honeymoon absolutely perfect. Every detail was taken care of — from the overwater villa to the private sunset dinner. The app is incredibly intuitive and the customer support was available 24/7. Will definitely book again!", destination: "Bali, Indonesia", verified: true, helpful: 234 },
  { id: "2", author: "James Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", rating: 5, date: "2024-11-28", title: "Best travel platform I've ever used", content: "Booked a Japan cherry blossom tour and it exceeded every expectation. The itinerary was perfectly planned, hotels were stunning, and the local guides were incredibly knowledgeable. The price comparison feature saved me over $400!", destination: "Japan", verified: true, helpful: 189 },
  { id: "3", author: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", rating: 5, date: "2024-11-10", title: "Premium experience at every touchpoint", content: "From booking to return, everything was seamless. The AI trip planner suggested an itinerary I never would have thought of, and it was perfect for our family. The kids loved the activities and we loved the luxury hotels.", destination: "Maldives", verified: true, helpful: 156 },
  { id: "4", author: "Marco Rossi", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", rating: 4, date: "2024-10-22", title: "Exceptional service and great deals", content: "Found an incredible deal on a Santorini package — 40% off the regular price. The booking process was smooth, the hotel was exactly as described, and the sunset cruise was magical. Minor issue with one transfer but resolved instantly.", destination: "Santorini, Greece", verified: true, helpful: 98 },
  { id: "5", author: "Aisha Patel", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80", rating: 5, date: "2024-10-05", title: "Bright Spark Travel is in a league of its own", content: "I've used every major travel platform and nothing comes close to this. The UI is gorgeous, the deals are unbeatable, and the rewards program is genuinely valuable. My platinum status gets me upgrades I never expected!", destination: "Dubai, UAE", verified: true, helpful: 312 },
  { id: "6", author: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", rating: 5, date: "2024-09-18", title: "Safari of a lifetime, perfectly organized", content: "The Kenya safari package was flawlessly organized. Witnessed the Great Migration, stayed in an incredible tented camp, and the guides were world-class. The real-time trip tracking feature kept my family updated back home.", destination: "Kenya, Africa", verified: true, helpful: 201 },
];

export const BLOG_POSTS: BlogPost[] = [
  { id: "1", title: "10 Hidden Gems in Southeast Asia You Must Visit in 2025", slug: "hidden-gems-southeast-asia-2025", excerpt: "Beyond Bali and Bangkok — discover the lesser-known paradises that will take your breath away.", content: "", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80", author: "Emma Wilson", authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", date: "2025-01-15", readTime: "8 min read", category: "Inspiration", tags: ["Southeast Asia", "Hidden Gems", "Travel Tips"] },
  { id: "2", title: "The Ultimate Guide to Luxury Travel on a Budget", slug: "luxury-travel-budget-guide", excerpt: "How to experience 5-star hotels, business class flights, and gourmet dining without breaking the bank.", content: "", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", author: "Alex Thompson", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", date: "2025-01-08", readTime: "12 min read", category: "Tips & Tricks", tags: ["Luxury", "Budget Travel", "Hacks"] },
  { id: "3", title: "Japan in Spring: The Complete Cherry Blossom Guide", slug: "japan-cherry-blossom-guide", excerpt: "Everything you need to know about planning the perfect sakura season trip to Japan.", content: "", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", author: "Yuki Tanaka", authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", date: "2024-12-28", readTime: "10 min read", category: "Destination Guide", tags: ["Japan", "Cherry Blossom", "Spring"] },
  { id: "4", title: "Solo Travel Safety: 20 Essential Tips for 2025", slug: "solo-travel-safety-tips-2025", excerpt: "Stay safe, confident, and connected while exploring the world on your own terms.", content: "", image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80", author: "Sofia Martinez", authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80", date: "2024-12-20", readTime: "9 min read", category: "Safety", tags: ["Solo Travel", "Safety", "Tips"] },
];

export const FLIGHTS: Flight[] = [
  { id: "1", airline: "Emirates", airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/200px-Emirates_logo.svg.png", from: "New York", fromCode: "JFK", to: "Dubai", toCode: "DXB", departure: "22:30", arrival: "19:45+1", duration: "12h 15m", stops: 0, price: 899, class: "economy", refundable: true, meals: true, baggage: "30kg", seatsLeft: 8 },
  { id: "2", airline: "Singapore Airlines", airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Singapore_Airlines_Logo_2.svg/200px-Singapore_Airlines_Logo_2.svg.png", from: "London", fromCode: "LHR", to: "Singapore", toCode: "SIN", departure: "09:15", arrival: "06:30+1", duration: "13h 15m", stops: 0, price: 1199, class: "economy", refundable: true, meals: true, baggage: "30kg", seatsLeft: 4 },
  { id: "3", airline: "Qatar Airways", airlineLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Qatar_Airways_Logo.svg/200px-Qatar_Airways_Logo.svg.png", from: "Mumbai", fromCode: "BOM", to: "Paris", toCode: "CDG", departure: "03:45", arrival: "12:20", duration: "9h 35m", stops: 1, price: 749, class: "economy", refundable: false, meals: true, baggage: "25kg", seatsLeft: 12 },
];

export const STATS = [
  { label: "Happy Travelers", value: "2.4M+", icon: "users" },
  { label: "Destinations", value: "190+", icon: "globe" },
  { label: "Partner Hotels", value: "50K+", icon: "building" },
  { label: "Years of Trust", value: "12+", icon: "shield" },
];

export const AIRLINES = [
  { name: "Emirates", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/200px-Emirates_logo.svg.png" },
  { name: "Singapore Airlines", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Singapore_Airlines_Logo_2.svg/200px-Singapore_Airlines_Logo_2.svg.png" },
  { name: "Qatar Airways", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Qatar_Airways_Logo.svg/200px-Qatar_Airways_Logo.svg.png" },
  { name: "Air India", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Air_India_Logo.svg/200px-Air_India_Logo.svg.png" },
  { name: "Lufthansa", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lufthansa_Logo_2018.svg/200px-Lufthansa_Logo_2018.svg.png" },
  { name: "British Airways", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/British_Airways_Logo.svg/200px-British_Airways_Logo.svg.png" },
];

export const CATEGORIES = [
  { id: "beach", label: "Beach", icon: "🏖️", count: 284 },
  { id: "mountain", label: "Mountains", icon: "🏔️", count: 196 },
  { id: "city", label: "City Breaks", icon: "🏙️", count: 412 },
  { id: "adventure", label: "Adventure", icon: "🧗", count: 158 },
  { id: "luxury", label: "Luxury", icon: "💎", count: 89 },
  { id: "culture", label: "Culture", icon: "🏛️", count: 234 },
  { id: "wildlife", label: "Wildlife", icon: "🦁", count: 67 },
  { id: "cruise", label: "Cruises", icon: "🚢", count: 45 },
  { id: "pilgrimage", label: "Pilgrimage", icon: "🕌", count: 78 },
  { id: "honeymoon", label: "Honeymoon", icon: "💑", count: 123 },
];

