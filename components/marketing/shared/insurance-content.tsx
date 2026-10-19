"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Check, X, Star, ArrowRight, Phone, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { Badge } from "@/components/marketing/ui/index";
import { formatPrice, cn } from "@/lib/marketing/utils";

const PLANS = [
  {
    id: "basic",
    name: "Basic Cover",
    price: 29,
    popular: false,
    color: "slate",
    coverage: "$50,000",
    features: [
      { label: "Medical Expenses", value: "$50,000", included: true },
      { label: "Trip Cancellation", value: "$2,000", included: true },
      { label: "Baggage Loss", value: "$500", included: true },
      { label: "Flight Delay", value: "$200", included: true },
      { label: "Emergency Evacuation", value: "$100,000", included: true },
      { label: "Adventure Sports", included: false },
      { label: "Pre-existing Conditions", included: false },
      { label: "Cancel for Any Reason", included: false },
    ],
  },
  {
    id: "standard",
    name: "Standard Cover",
    price: 59,
    popular: true,
    color: "emerald",
    coverage: "$200,000",
    features: [
      { label: "Medical Expenses", value: "$200,000", included: true },
      { label: "Trip Cancellation", value: "$10,000", included: true },
      { label: "Baggage Loss", value: "$2,000", included: true },
      { label: "Flight Delay", value: "$500", included: true },
      { label: "Emergency Evacuation", value: "$500,000", included: true },
      { label: "Adventure Sports", value: "Basic", included: true },
      { label: "Pre-existing Conditions", included: false },
      { label: "Cancel for Any Reason", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium Cover",
    price: 99,
    popular: false,
    color: "amber",
    coverage: "Unlimited",
    features: [
      { label: "Medical Expenses", value: "Unlimited", included: true },
      { label: "Trip Cancellation", value: "$25,000", included: true },
      { label: "Baggage Loss", value: "$5,000", included: true },
      { label: "Flight Delay", value: "$1,000", included: true },
      { label: "Emergency Evacuation", value: "Unlimited", included: true },
      { label: "Adventure Sports", value: "Full Cover", included: true },
      { label: "Pre-existing Conditions", value: "Covered", included: true },
      { label: "Cancel for Any Reason", value: "75% refund", included: true },
    ],
  },
];

const CLAIM_STEPS = [
  { step: 1, title: "Report Incident", desc: "Notify us within 24 hours via app, call, or email." },
  { step: 2, title: "Submit Documents", desc: "Upload required documents through our secure portal." },
  { step: 3, title: "Claim Review", desc: "Our team reviews your claim within 3-5 business days." },
  { step: 4, title: "Get Paid", desc: "Approved claims are settled directly to your account." },
];

export function InsuranceContent() {
  const [selected, setSelected] = useState("standard");
  const [travelers, setTravelers] = useState(1);
  const [days, setDays] = useState(7);

  const plan = PLANS.find((p) => p.id === selected)!;
  const total = plan.price * travelers * Math.ceil(days / 7);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-full mb-6">
              <Shield className="h-4 w-4" /> Travel Insurance
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">Travel with Confidence</h1>
            <p className="text-white/70 text-xl mb-4 max-w-2xl mx-auto">Comprehensive coverage for medical emergencies, trip cancellations, and more.</p>
            <div className="flex items-center justify-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Instant Coverage</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> 24/7 Assistance</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Easy Claims</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Plans */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Choose Your Plan</h2>
          <p className="text-slate-500">All plans include 24/7 emergency assistance and instant digital policy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(plan.id)}
              className={cn(
                "relative bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 cursor-pointer transition-all",
                selected === plan.id ? "border-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20" : "border-slate-100 dark:border-slate-800 hover:border-emerald-200"
              )}
              style={{ boxShadow: selected === plan.id ? "var(--shadow-xl)" : "var(--shadow-md)" }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="premium" size="md">⭐ Most Popular</Badge>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <div className="text-sm text-slate-500 mb-4">Coverage up to {plan.coverage}</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">${plan.price}</div>
                <div className="text-sm text-slate-400">per person / week</div>
              </div>
              <div className="space-y-3">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {f.included
                        ? <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        : <X className="h-4 w-4 text-slate-300 flex-shrink-0" />}
                      <span className={f.included ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>{f.label}</span>
                    </div>
                    {f.value && f.included && <span className="text-xs font-medium text-emerald-600">{f.value}</span>}
                  </div>
                ))}
              </div>
              <Button
                variant={selected === plan.id ? "gradient" : "outline"}
                size="md"
                className="w-full mt-6"
                onClick={() => setSelected(plan.id)}
              >
                {selected === plan.id ? "Selected ✓" : "Select Plan"}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Calculator */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 mb-12" style={{ boxShadow: "var(--shadow-lg)" }}>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Calculate Your Premium</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Number of Travelers</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:border-emerald-400 transition-colors">-</button>
                <span className="text-xl font-bold text-slate-900 dark:text-white w-8 text-center">{travelers}</span>
                <button onClick={() => setTravelers(Math.min(10, travelers + 1))} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:border-emerald-400 transition-colors">+</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Trip Duration (days)</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setDays(Math.max(1, days - 1))} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:border-emerald-400 transition-colors">-</button>
                <span className="text-xl font-bold text-slate-900 dark:text-white w-8 text-center">{days}</span>
                <button onClick={() => setDays(Math.min(90, days + 1))} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:border-emerald-400 transition-colors">+</button>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                <div className="text-sm text-slate-500 mb-1">Total Premium</div>
                <div className="text-3xl font-bold text-emerald-600">{formatPrice(total)}</div>
                <div className="text-xs text-slate-400">{plan.name} · {travelers} traveler{travelers > 1 ? "s" : ""} · {days} days</div>
              </div>
            </div>
          </div>
          <Button variant="gradient" size="lg" className="w-full sm:w-auto">
            Buy Insurance Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Claim Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">How to File a Claim</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CLAIM_STEPS.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-white/80" />
          <h3 className="text-2xl font-bold mb-2">Trusted by 500,000+ Travelers</h3>
          <p className="text-white/80 mb-6">Rated 4.8/5 stars · 98.7% claim approval rate · 24/7 emergency support</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["IRDAI Approved", "ISO Certified", "24/7 Support", "Instant Policy"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">
                <Check className="h-4 w-4" /> {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

