'use client';

import React, { useState } from 'react';
import { DEV_FEATURES } from '@/config/devFeatures';
import { Wrench, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface DeveloperTestControlsProps {
  mockScenario: 'AUTO' | 'SUCCESS' | 'PENDING' | 'FAILED';
  onScenarioChange: (scenario: 'AUTO' | 'SUCCESS' | 'PENDING' | 'FAILED') => void;
}

export const DeveloperTestControls: React.FC<DeveloperTestControlsProps> = ({
  mockScenario,
  onScenarioChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Strictly gate for non-production environments
  const isDev = process.env.NODE_ENV !== 'production' || DEV_FEATURES.showTransactionOutcomeSelector;

  if (!isDev) return null;

  const scenarios: Array<{
    id: 'AUTO' | 'SUCCESS' | 'PENDING' | 'FAILED';
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'AUTO',
      label: 'Auto (Deterministic)',
      description: 'Uses amount-based rules (e.g. ₹999 = PENDING)',
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" />,
    },
    {
      id: 'SUCCESS',
      label: 'Force Success',
      description: 'Transaction always completes successfully',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      id: 'PENDING',
      label: 'Force Pending',
      description: 'Simulates clearance delay or provider hold',
      icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'FAILED',
      label: 'Force Failed',
      description: 'Simulates provider decline or switch error',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
    },
  ];

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-semibold text-slate-600 hover:text-slate-900 focus:outline-hidden"
      >
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-slate-200 text-slate-700">
            <Wrench className="w-3.5 h-3.5" />
          </span>
          <span>Developer Test Controls</span>
          <span className="text-[10px] uppercase font-bold text-indigo-600 px-1.5 py-0.2 bg-indigo-50 border border-[#D4E1AE] rounded">
            QA Only
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px] font-mono">{mockScenario}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
          <p className="text-[11px] text-slate-500">
            Select an execution outcome scenario for testing user flows. This panel is omitted in production.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {scenarios.map((item) => {
              const isSelected = mockScenario === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onScenarioChange(item.id)}
                  className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900 text-slate-900'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      {item.label}
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
