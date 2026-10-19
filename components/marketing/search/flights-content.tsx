"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Filter, SlidersHorizontal, ArrowUpDown, Clock, Wifi, Utensils, Luggage, RefreshCw, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { FLIGHTS } from "@/lib/marketing/data/mock";
import { formatPrice, cn } from "@/lib/marketing/utils";
import type { Flight } from "@/types/marketing";

const SORT_OPTIONS = ["Cheapest", "Fastest", "Best Value", "Departure", "Arrival"];
const STOP_FILTERS = ["Any", "Non-stop", "1 Stop", "2+ Stops"];

function FlightCard({ flight, index }: { flight: Flight; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Airline */}
          <div className="flex items-center gap-3 lg:w-40">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              <Plane className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <div className="font-medium text-sm text-slate-900 dark:text-white">{flight.airline}</div>
              <div className="text-xs text-slate-400">{flight.fromCode}→{flight.toCode}</div>
            </div>
          </div>

          {/* Route */}
          <div className="flex-1 flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{flight.departure}</div>
              <div className="text-sm text-slate-500">{flight.fromCode}</div>
              <div className="text-xs text-slate-400">{flight.from}</div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-slate-400">{flight.duration}</div>
              <div className="relative w-full flex items-center">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <Plane className="h-4 w-4 text-emerald-500 mx-2 rotate-90" />
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="text-xs text-slate-400">
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{flight.arrival}</div>
              <div className="text-sm text-slate-500">{flight.toCode}</div>
              <div className="text-xs text-slate-400">{flight.to}</div>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-3 lg:w-32">
            {flight.meals && <div title="Meals included" className="text-emerald-500"><Utensils className="h-4 w-4" /></div>}
            {flight.refundable && <div title="Refundable" className="text-[#6D8E37]"><RefreshCw className="h-4 w-4" /></div>}
            <div title={`Baggage: ${flight.baggage}`} className="text-slate-400"><Luggage className="h-4 w-4" /></div>
          </div>

          {/* Price & CTA */}
          <div className="flex flex-col items-end gap-2 lg:w-36">
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{formatPrice(flight.price)}</div>
              <div className="text-xs text-slate-400">per person</div>
            </div>
            {flight.seatsLeft <= 5 && (
              <Badge variant="danger" size="sm">{flight.seatsLeft} seats left</Badge>
            )}
            <Button variant="gradient" size="sm" className="w-full">Book Now</Button>
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-emerald-600 mt-3 hover:text-emerald-700 transition-colors"
        >
          Flight details
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-800/50"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-500 text-xs mb-1">Class</div>
              <div className="font-medium text-slate-900 dark:text-white capitalize">{flight.class}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Baggage</div>
              <div className="font-medium text-slate-900 dark:text-white">{flight.baggage}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Meals</div>
              <div className="font-medium text-slate-900 dark:text-white">{flight.meals ? "Included" : "Not included"}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Refundable</div>
              <div className={cn("font-medium", flight.refundable ? "text-emerald-600" : "text-red-500")}>
                {flight.refundable ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function FlightsContent() {
  const [activeSort, setActiveSort] = useState("Cheapest");
  const [activeStop, setActiveStop] = useState("Any");
  const [priceRange, setPriceRange] = useState([0, 3000]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5">
              <Plane className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">New York → Dubai</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400">
              Jan 15 — Jan 22
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400">
              2 Adults
            </div>
            <Button variant="outline" size="sm">Modify Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 sticky top-24" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                  Filters
                </h3>
                <button className="text-xs text-emerald-600 hover:text-emerald-700">Reset all</button>
              </div>

              {/* Stops */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Stops</h4>
                <div className="space-y-2">
                  {STOP_FILTERS.map((stop) => (
                    <label key={stop} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                        activeStop === stop ? "bg-emerald-600 border-emerald-600" : "border-slate-300 dark:border-slate-600"
                      )} onClick={() => setActiveStop(stop)}>
                        {activeStop === stop && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">{stop}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Price Range
                  <span className="text-emerald-600 ml-2">{formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}</span>
                </h4>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Airlines */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Airlines</h4>
                <div className="space-y-2">
                  {["Emirates", "Singapore Airlines", "Qatar Airways", "Lufthansa"].map((airline) => (
                    <label key={airline} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="accent-emerald-600 rounded" defaultChecked />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{airline}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departure Time */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Departure Time</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                    <button key={time} className="text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all">
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{FLIGHTS.length}</span> flights
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
                <div className="flex gap-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setActiveSort(opt)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        activeSort === opt
                          ? "bg-emerald-600 text-white"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Flight Cards */}
            <div className="space-y-4">
              {FLIGHTS.map((flight, i) => (
                <FlightCard key={flight.id} flight={flight} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

