'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  step: number;
  label: string;
  description?: string;
}

interface TransactionStepIndicatorProps {
  currentStep: number;
  steps: StepItem[];
  type: 'PAY_IN' | 'PAY_OUT';
}

export const TransactionStepIndicator: React.FC<TransactionStepIndicatorProps> = ({
  currentStep,
  steps,
  type,
}) => {
  const isPayIn = type === 'PAY_IN';

  // Theme styles
  const activeBg = isPayIn ? 'bg-[#2F6F5E]' : 'bg-[#F97316]';
  const activeRing = isPayIn ? 'ring-indigo-100' : 'ring-orange-100';
  const activeText = isPayIn ? 'text-[#2F6F5E]' : 'text-[#F97316]';
  const completedBg = isPayIn ? 'bg-indigo-600' : 'bg-orange-500';
  const progressLineBg = isPayIn ? 'bg-[#2F6F5E]' : 'bg-[#F97316]';

  const activeStepObj = steps.find((s) => s.step === currentStep) || steps[0];
  const progressPercent = Math.min(100, Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 md:px-8 md:py-5 shadow-xs">
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <ol className="flex items-center w-full justify-between relative">
          {steps.map((item, idx) => {
            const isCompleted = currentStep > item.step;
            const isActive = currentStep === item.step;
            const isLast = idx === steps.length - 1;

            return (
              <li
                key={item.step}
                className={`flex items-center ${!isLast ? 'flex-1' : ''}`}
              >
                <div className="flex items-center gap-3 shrink-0 relative z-10">
                  {/* Icon Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                      isCompleted
                        ? `${completedBg} text-white shadow-xs`
                        : isActive
                        ? `${activeBg} text-white ring-4 ${activeRing} shadow-sm`
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : item.step}
                  </div>

                  {/* Labels */}
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold tracking-tight ${
                        isActive
                          ? `${activeText} font-bold`
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-[11px] text-slate-400 hidden lg:inline">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Connecting Progress Line */}
                {!isLast && (
                  <div className="flex-1 mx-4 h-0.5 bg-slate-200 relative overflow-hidden rounded-full">
                    <div
                      className={`absolute top-0 left-0 bottom-0 transition-all duration-300 ${
                        isCompleted ? progressLineBg : isActive ? `${progressLineBg} opacity-50` : 'w-0'
                      }`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                currentStep === 4 ? 'bg-emerald-600' : activeBg
              }`}
            >
              {currentStep}
            </span>
            <span className="font-bold text-slate-900">{activeStepObj.label}</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progressLineBg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
