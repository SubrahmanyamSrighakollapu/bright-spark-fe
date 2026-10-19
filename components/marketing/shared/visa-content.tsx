"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, FileText, CheckCircle, Globe, ArrowRight, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { cn } from "@/lib/marketing/utils";

const VISA_TYPES = [
  { id: "tourist", label: "Tourist Visa", icon: "🏖️" },
  { id: "business", label: "Business Visa", icon: "💼" },
  { id: "student", label: "Student Visa", icon: "🎓" },
  { id: "transit", label: "Transit Visa", icon: "✈️" },
];

const COUNTRIES = [
  { id: "1", name: "United States", flag: "🇺🇸", processingTime: "5-7 days", fee: 160, difficulty: "moderate", type: "B1/B2 Tourist", documents: ["Passport", "Bank Statements", "Invitation Letter", "Travel Itinerary", "Photos"], popular: true },
  { id: "2", name: "United Kingdom", flag: "🇬🇧", processingTime: "3-5 days", fee: 115, difficulty: "moderate", type: "Standard Visitor", documents: ["Passport", "Bank Statements", "Employment Letter", "Travel History"], popular: true },
  { id: "3", name: "Schengen (Europe)", flag: "🇪🇺", processingTime: "10-15 days", fee: 80, difficulty: "moderate", type: "Schengen Visa", documents: ["Passport", "Travel Insurance", "Hotel Bookings", "Bank Statements", "Itinerary"], popular: true },
  { id: "4", name: "Japan", flag: "🇯🇵", processingTime: "5-7 days", fee: 25, difficulty: "easy", type: "Tourist Visa", documents: ["Passport", "Application Form", "Photo", "Itinerary"], popular: true },
  { id: "5", name: "Australia", flag: "🇦🇺", processingTime: "20-30 days", fee: 145, difficulty: "hard", type: "Visitor Visa", documents: ["Passport", "Financial Documents", "Health Insurance", "Character Documents"], popular: false },
  { id: "6", name: "Canada", flag: "🇨🇦", processingTime: "14-21 days", fee: 100, difficulty: "moderate", type: "Visitor Visa", documents: ["Passport", "Biometrics", "Financial Proof", "Travel History"], popular: false },
  { id: "7", name: "Dubai (UAE)", flag: "🇦🇪", processingTime: "3-5 days", fee: 90, difficulty: "easy", type: "Tourist Visa", documents: ["Passport", "Photo", "Bank Statement", "Return Ticket"], popular: true },
  { id: "8", name: "Thailand", flag: "🇹🇭", processingTime: "1-3 days", fee: 35, difficulty: "easy", type: "Tourist Visa", documents: ["Passport", "Photo", "Application Form"], popular: false },
];

const FAQS = [
  { q: "How long does visa processing take?", a: "Processing times vary by country — from 1 day for some e-visas to 30+ days for complex applications. We show estimated times for each destination." },
  { q: "What documents do I need?", a: "Requirements vary by destination and visa type. Our platform provides a complete checklist for each visa application." },
  { q: "Can I track my visa application?", a: "Yes! Once you apply through Bright Spark Travel, you'll receive real-time updates via email and SMS throughout the process." },
  { q: "What if my visa is rejected?", a: "We offer a full refund of our service fee if your visa is rejected. Government fees are non-refundable as per embassy policies." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <span className="font-medium text-slate-900 dark:text-white">{q}</span>
        <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export function VisaContent() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("tourist");
  const [selected, setSelected] = useState<typeof COUNTRIES[0] | null>(null);

  const filtered = COUNTRIES.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-[#102620] to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-[#6D8E37]/10 border border-[#6D8E37]/20 text-[#8DA84D] text-sm px-4 py-2 rounded-full mb-6">
              <Shield className="h-4 w-4" /> Visa Services
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">Hassle-Free Visa Services</h1>
            <p className="text-white/70 text-xl mb-8 max-w-2xl mx-auto">Expert visa assistance for 100+ countries. Fast processing, guaranteed accuracy.</p>
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search destination country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#8DA84D]/50 text-base"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Visa Type Tabs */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-10">
          {VISA_TYPES.map((type) => (
            <button key={type.id} onClick={() => setActiveType(type.id)}
              className={cn("flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all",
                activeType === type.id ? "bg-[#2F6F5E] text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#B8CB7D]"
              )}>
              <span>{type.icon}</span> {type.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Countries Covered", value: "100+", icon: Globe },
            { label: "Avg Processing", value: "5 Days", icon: Clock },
            { label: "Success Rate", value: "98.7%", icon: CheckCircle },
            { label: "Applications Done", value: "500K+", icon: FileText },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="w-10 h-10 rounded-xl bg-[#E7EFD2] dark:bg-[#17362F]/30 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-5 w-5 text-[#2F6F5E]" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Country List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Popular Destinations</h2>
            <div className="space-y-3">
              {filtered.map((country, i) => (
                <motion.div key={country.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(selected?.id === country.id ? null : country)}
                  className={cn("bg-white dark:bg-slate-900 rounded-2xl p-5 border cursor-pointer transition-all",
                    selected?.id === country.id ? "border-[#8DA84D] shadow-lg shadow-[#E7EFD2] dark:shadow-[#17362F]/20" : "border-slate-100 dark:border-slate-800 hover:border-[#D4E1AE]"
                  )} style={{ boxShadow: "var(--shadow-md)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{country.name}</div>
                        <div className="text-sm text-slate-500">{country.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">${country.fee}</div>
                        <div className="text-xs text-slate-400">Govt. fee</div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{country.processingTime}</div>
                        <div className="text-xs text-slate-400">Processing</div>
                      </div>
                      <Badge variant={country.difficulty === "easy" ? "success" : country.difficulty === "moderate" ? "warning" : "danger"} size="sm" className="capitalize">
                        {country.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {selected?.id === country.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="mb-3">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Required Documents:</div>
                        <div className="flex flex-wrap gap-2">
                          {country.documents.map((doc) => (
                            <span key={doc} className="flex items-center gap-1 text-xs bg-[#F3F7E9] dark:bg-[#17362F]/20 text-[#285C50] dark:text-[#8DA84D] px-3 py-1.5 rounded-full">
                              <CheckCircle className="h-3 w-3" /> {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button variant="gradient" size="sm" className="bg-gradient-to-r from-[#6D8E37] to-[#2F6F5E] hover:from-[#2F6F5E] hover:to-[#285C50]">
                        Apply for Visa <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ Sidebar */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">FAQs</h2>
            <div className="space-y-3">
              {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
            </div>

            {/* CTA Card */}
            <div className="mt-6 bg-gradient-to-br from-[#2F6F5E] to-[#285C50] rounded-2xl p-6 text-white">
              <Shield className="h-8 w-8 mb-3 text-[#D4E1AE]" />
              <h3 className="font-bold text-lg mb-2">Need Expert Help?</h3>
              <p className="text-[#E7EFD2] text-sm mb-4">Our visa experts are available 24/7 to guide you through the process.</p>
              <Button variant="dark" size="sm" className="w-full bg-white text-[#285C50] hover:bg-[#F3F7E9]">
                Talk to an Expert
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

