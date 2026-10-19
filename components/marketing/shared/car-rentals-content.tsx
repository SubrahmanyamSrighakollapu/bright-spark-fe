"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Car, MapPin, Calendar, Users, Star, ArrowRight, Fuel, Settings, Shield, Check } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { formatPrice, cn } from "@/lib/marketing/utils";

const CAR_TYPES = [
  { id: "all", label: "All Vehicles", icon: "🚗" },
  { id: "economy", label: "Economy", icon: "🚙" },
  { id: "suv", label: "SUV", icon: "🚐" },
  { id: "luxury", label: "Luxury", icon: "🏎️" },
  { id: "minivan", label: "Minivan", icon: "🚌" },
  { id: "electric", label: "Electric", icon: "⚡" },
];

const CARS = [
  { id: "1", name: "Toyota Corolla", type: "economy", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80", seats: 5, transmission: "Automatic", fuel: "Petrol", price: 45, rating: 4.7, reviews: 2840, features: ["AC", "Bluetooth", "GPS", "USB"], available: true },
  { id: "2", name: "BMW X5", type: "suv", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80", seats: 7, transmission: "Automatic", fuel: "Diesel", price: 120, rating: 4.9, reviews: 1240, features: ["AC", "Sunroof", "GPS", "Leather Seats", "Parking Sensors"], available: true },
  { id: "3", name: "Mercedes S-Class", type: "luxury", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80", seats: 5, transmission: "Automatic", fuel: "Petrol", price: 250, rating: 4.9, reviews: 680, features: ["Chauffeur", "Massage Seats", "Champagne", "WiFi", "Privacy Glass"], available: true },
  { id: "4", name: "Toyota Innova", type: "minivan", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80", seats: 8, transmission: "Manual", fuel: "Diesel", price: 65, rating: 4.6, reviews: 3200, features: ["AC", "Large Boot", "GPS", "USB"], available: true },
  { id: "5", name: "Tesla Model 3", type: "electric", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80", seats: 5, transmission: "Automatic", fuel: "Electric", price: 95, rating: 4.8, reviews: 920, features: ["Autopilot", "Supercharger", "App Control", "Panoramic Roof"], available: false },
  { id: "6", name: "Hyundai Creta", type: "suv", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", seats: 5, transmission: "Automatic", fuel: "Petrol", price: 75, rating: 4.7, reviews: 1890, features: ["AC", "Sunroof", "GPS", "Reverse Camera"], available: true },
];

export function CarRentalsContent() {
  const [activeType, setActiveType] = useState("all");
  const [pickup, setPickup] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const filtered = activeType === "all" ? CARS : CARS.filter((c) => c.type === activeType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm px-4 py-2 rounded-full mb-6">
              <Car className="h-4 w-4" /> Car Rentals
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">Drive Your Way</h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">Premium vehicles at unbeatable prices. Free cancellation on most bookings.</p>
          </motion.div>

          {/* Search Widget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto glass rounded-3xl p-6 border border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input type="text" placeholder="City or Airport" value={pickup} onChange={(e) => setPickup(e.target.value)}
                    className="w-full h-12 bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/60" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Pickup Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full h-12 bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/60" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/60 mb-1.5 block">Return Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full h-12 bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400/60" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="gradient" size="md" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                Search Cars <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type Filters */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-8">
          {CAR_TYPES.map((type) => (
            <button key={type.id} onClick={() => setActiveType(type.id)}
              className={cn("flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeType === type.id ? "bg-orange-500 text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-orange-300"
              )}>
              <span>{type.icon}</span> {type.label}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          {["Free Cancellation", "No Hidden Fees", "24/7 Roadside Assistance", "Fully Insured"].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> {badge}
            </div>
          ))}
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((car, i) => (
            <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 card-lift" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={car.available ? "success" : "danger"} size="sm">
                    {car.available ? "Available" : "Unavailable"}
                  </Badge>
                  <Badge variant="secondary" size="sm" className="capitalize">{car.type}</Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors">{car.name}</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <Users className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-500">{car.seats} Seats</div>
                  </div>
                  <div className="text-center">
                    <Settings className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-500">{car.transmission}</div>
                  </div>
                  <div className="text-center">
                    <Fuel className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-500">{car.fuel}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {car.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">{f}</span>
                  ))}
                  {car.features.length > 3 && <span className="text-xs text-slate-400 px-2 py-1">+{car.features.length - 3}</span>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{car.rating}</span>
                      <span className="text-xs text-slate-400">({car.reviews.toLocaleString()})</span>
                    </div>
                    <div className="font-bold text-orange-600 text-xl">{formatPrice(car.price)}</div>
                    <div className="text-xs text-slate-400">per day</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-orange-400 text-orange-600 hover:bg-orange-50" disabled={!car.available}>
                    {car.available ? "Book Now" : "Unavailable"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

