'use client';

import React from 'react';

type HeroTone = 'blue' | 'emerald' | 'amber' | 'violet' | 'sky';

interface RoleDashboardHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone?: HeroTone;
  actions?: React.ReactNode;
}

const tones: Record<HeroTone, { glow: string; icon: string; eyebrow: string }> = {
  blue: { glow: 'bg-blue-400/10', icon: 'from-blue-600 to-indigo-600 shadow-blue-900/20', eyebrow: 'text-blue-700 bg-blue-50 border-blue-100' },
  emerald: { glow: 'bg-emerald-400/10', icon: 'from-emerald-500 to-teal-600 shadow-emerald-900/20', eyebrow: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  amber: { glow: 'bg-amber-400/10', icon: 'from-amber-500 to-orange-600 shadow-amber-900/20', eyebrow: 'text-amber-700 bg-amber-50 border-amber-100' },
  violet: { glow: 'bg-violet-400/10', icon: 'from-violet-600 to-indigo-600 shadow-violet-900/20', eyebrow: 'text-violet-700 bg-violet-50 border-violet-100' },
  sky: { glow: 'bg-sky-400/10', icon: 'from-sky-500 to-blue-600 shadow-sky-900/20', eyebrow: 'text-sky-700 bg-sky-50 border-sky-100' },
};

export function RoleDashboardHero({ eyebrow, title, description, icon, tone = 'blue', actions }: RoleDashboardHeroProps) {
  const style = tones[tone];
  return (
    <section className="relative isolate z-20 overflow-visible rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/80 px-5 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:px-7">
      <div className={`pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full blur-3xl ${style.glow}`} />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${style.icon}`}>{icon}</div>
          <div className="min-w-0">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${style.eyebrow}`}>{eyebrow}</span>
            <h1 className="mt-2 text-xl font-extrabold tracking-[-0.025em] text-slate-950 sm:text-2xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">{description}</p>
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-4 lg:border-0 lg:pt-0">{actions}</div>}
      </div>
    </section>
  );
}
