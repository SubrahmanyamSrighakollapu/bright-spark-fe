"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { useState } from "react";

const OFFICES = [
  { city: "San Francisco", address: "100 Market Street, Suite 400", phone: "+1 (415) 555-0100", email: "sf@brightspark.travel", flag: "🇺🇸" },
  { city: "London", address: "25 Old Broad Street, EC2N 1HQ", phone: "+44 20 7946 0100", email: "london@brightspark.travel", flag: "🇬🇧" },
  { city: "Dubai", address: "DIFC, Gate Village, Building 4", phone: "+971 4 555 0100", email: "dubai@brightspark.travel", flag: "🇦🇪" },
  { city: "Singapore", address: "1 Raffles Place, #20-61", phone: "+65 6555 0100", email: "sg@brightspark.travel", flag: "🇸🇬" },
];

const FAQS = [
  { q: "How do I cancel or modify my booking?", a: "You can cancel or modify bookings from your dashboard under 'My Bookings'. Cancellation policies vary by provider." },
  { q: "When will I receive my booking confirmation?", a: "Confirmations are sent instantly via email. Check your spam folder if you don't see it within 5 minutes." },
  { q: "How do I get a refund?", a: "Refunds are processed within 5-7 business days to your original payment method, subject to cancellation policy." },
  { q: "Is my payment information secure?", a: "Yes. We use 256-bit SSL encryption and are PCI DSS compliant. We never store your full card details." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <span className="font-medium text-slate-900 dark:text-white text-sm">{q}</span>
        <span className={`text-slate-400 transition-transform ${open ? "rotate-45" : ""} text-xl leading-none`}>+</span>
      </button>
      {open && <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">{a}</div>}
    </div>
  );
}

export function ContactContent() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">Our travel experts are available 24/7 to help you plan the perfect trip.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Phone, title: "Call Us", desc: "+1 (800) WANDER-1", sub: "Mon–Sun, 24/7", color: "emerald" },
            { icon: Mail, title: "Email Us", desc: "hello@brightspark.travel", sub: "Response within 2 hours", color: "blue" },
            { icon: MessageCircle, title: "Live Chat", desc: "Chat with an expert", sub: "Available now", color: "purple" },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center hover:border-emerald-200 transition-all cursor-pointer group" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className={[
                "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform",
                item.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/30" : item.color === "blue" ? "bg-[#E7EFD2] dark:bg-[#17362F]/30" : "bg-purple-100 dark:bg-purple-900/30"
              ].join(" ")}>
                <item.icon className={item.color === "emerald" ? "h-7 w-7 text-emerald-600" : item.color === "blue" ? "h-7 w-7 text-[#2F6F5E]" : "h-7 w-7 text-purple-600"} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h3>
              <div className="text-emerald-600 font-medium text-sm mb-1">{item.desc}</div>
              <div className="text-xs text-slate-400">{item.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>
            {submitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 text-center border border-emerald-200 dark:border-emerald-800">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg mb-2">Message Sent!</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">We&apos;ll get back to you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: "First Name", placeholder: "John" }, { label: "Last Name", placeholder: "Doe" }].map((f) => (
                    <div key={f.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">{f.label}</label>
                      <input type="text" placeholder={f.placeholder} required
                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Email</label>
                  <input type="email" placeholder="john@example.com" required
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Subject</label>
                  <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all">
                    <option>Booking Inquiry</option>
                    <option>Cancellation / Refund</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Message</label>
                  <textarea rows={5} placeholder="Tell us how we can help..." required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none" />
                </div>
                <Button type="submit" variant="gradient" size="lg" className="w-full">
                  Send Message <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked</h2>
            <div className="space-y-3">
              {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
            </div>
          </motion.div>
        </div>

        {/* Office Locations */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Our Offices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OFFICES.map((office, i) => (
              <motion.div key={office.city} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="text-3xl mb-3">{office.flag}</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">{office.city}</h3>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />{office.address}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-500" />{office.phone}</div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-500" />{office.email}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

