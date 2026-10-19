"use client";
import { motion } from "framer-motion";

const PARTNERS = [
  { name: "Emirates", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/200px-Emirates_logo.svg.png" },
  { name: "Singapore Airlines", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Singapore_Airlines_Logo_2.svg/200px-Singapore_Airlines_Logo_2.svg.png" },
  { name: "Qatar Airways", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Qatar_Airways_Logo.svg/200px-Qatar_Airways_Logo.svg.png" },
  { name: "Lufthansa", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lufthansa_Logo_2018.svg/200px-Lufthansa_Logo_2018.svg.png" },
  { name: "British Airways", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/British_Airways_Logo.svg/200px-British_Airways_Logo.svg.png" },
  { name: "Air France", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/200px-Air_France_Logo.svg.png" },
];

const TRUST_BADGES = [
  { label: "IATA Certified", icon: "✈️" },
  { label: "SSL Secured", icon: "🔒" },
  { label: "ISO 27001", icon: "🛡️" },
  { label: "PCI DSS", icon: "💳" },
  { label: "GDPR Compliant", icon: "✅" },
];

export function PartnersSection() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-6">Trusted Partners & Airlines</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {PARTNERS.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-700">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
              <span>{badge.icon}</span>
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

