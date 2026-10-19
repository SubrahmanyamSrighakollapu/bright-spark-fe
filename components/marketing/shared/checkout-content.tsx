"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, User, Users, CreditCard, FileText, Shield, ArrowRight, ArrowLeft, Plane, Hotel, Package } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";
import { useCart } from "@/lib/marketing/store";
import { formatPrice, cn } from "@/lib/marketing/utils";

const STEPS = [
  { id: 1, label: "Traveler Details", icon: User },
  { id: 2, label: "Review & Add-ons", icon: FileText },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Confirmation", icon: Check },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "upi", label: "UPI / Net Banking", icon: "📱" },
  { id: "wallet", label: "Travel Wallet", icon: "👛" },
  { id: "emi", label: "EMI (0% interest)", icon: "📅" },
];

export function CheckoutContent() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [bookingReference] = useState(() => `BSP-TRAVEL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);
  const { items } = useCart();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                step > s.id ? "bg-emerald-600 text-white" : step === s.id ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}>
                {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn("text-xs mt-1.5 font-medium hidden sm:block", step >= s.id ? "text-emerald-600" : "text-slate-400")}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("w-16 sm:w-24 h-0.5 mx-2 transition-all", step > s.id ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700")} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-md)" }}>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-5 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-500" /> Primary Traveler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "First Name", placeholder: "John" },
                    { label: "Last Name", placeholder: "Doe" },
                    { label: "Email Address", placeholder: "john@example.com", type: "email" },
                    { label: "Phone Number", placeholder: "+1 (555) 000-0000", type: "tel" },
                    { label: "Date of Birth", placeholder: "", type: "date" },
                    { label: "Nationality", placeholder: "United States" },
                    { label: "Passport Number", placeholder: "A12345678" },
                    { label: "Passport Expiry", placeholder: "", type: "date" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">{field.label}</label>
                      <input type={field.type || "text"} placeholder={field.placeholder}
                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-md)" }}>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-5 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" /> Emergency Contact
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Contact Name", placeholder: "Jane Doe" },
                    { label: "Relationship", placeholder: "Spouse" },
                    { label: "Phone Number", placeholder: "+1 (555) 000-0001", type: "tel" },
                    { label: "Email", placeholder: "jane@example.com", type: "email" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">{field.label}</label>
                      <input type={field.type || "text"} placeholder={field.placeholder}
                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-md)" }}>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-5">Review Your Booking</h2>
                {items.length === 0 ? (
                  <p className="text-slate-500 text-sm">No items in cart.</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs text-emerald-600 font-semibold capitalize">{item.type}</div>
                          <div className="font-medium text-slate-900 dark:text-white">{item.title}</div>
                          <div className="text-sm text-emerald-600 font-bold mt-1">{formatPrice(item.price)} × {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-md)" }}>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-5">GST Details (Optional)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{ label: "Company Name", placeholder: "Acme Corp" }, { label: "GST Number", placeholder: "22AAAAA0000A1Z5" }].map((f) => (
                    <div key={f.label}>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">{f.label}</label>
                      <input type="text" placeholder={f.placeholder}
                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800" style={{ boxShadow: "var(--shadow-md)" }}>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-5 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-500" /> Payment Method
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                      className={cn("flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                        paymentMethod === method.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-200 dark:border-slate-700 hover:border-emerald-200"
                      )}>
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{method.label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Expiry Date</label>
                        <input type="text" placeholder="MM / YY"
                          className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">CVV</label>
                        <input type="text" placeholder="•••" maxLength={4}
                          className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Cardholder Name</label>
                      <input type="text" placeholder="John Doe"
                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <Check className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Booking Confirmed! 🎉</h2>
              <p className="text-slate-500 mb-2">Your booking reference: <span className="font-bold text-emerald-600">{bookingReference}</span></p>
              <p className="text-slate-500 mb-8">A confirmation email has been sent to your registered email address.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="gradient" size="lg">View My Bookings <ArrowRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="lg">Download Invoice</Button>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-6">
              <Button variant="secondary" size="md" onClick={prevStep} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="gradient" size="md" onClick={nextStep}>
                {step === 3 ? "Confirm & Pay" : "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 sticky top-24" style={{ boxShadow: "var(--shadow-lg)" }}>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-5">Booking Summary</h3>
            {items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex gap-3 mb-4">
                <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <div className="text-xs text-emerald-600 font-semibold capitalize">{item.type}</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{item.title}</div>
                  <div className="text-sm font-bold text-emerald-600">{formatPrice(item.price)}</div>
                </div>
              </div>
            ))}
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium text-slate-900 dark:text-white">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Taxes (12%)</span><span className="font-medium text-slate-900 dark:text-white">{formatPrice(taxes)}</span></div>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              <div className="flex justify-between font-bold">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-emerald-600 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

