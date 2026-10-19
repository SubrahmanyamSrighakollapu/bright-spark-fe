'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { BrandingConfig } from '@/types/domain';

export interface BrandingPreviewCardProps {
  branding: BrandingConfig;
}

export const BrandingPreviewCard: React.FC<BrandingPreviewCardProps> = ({ branding }) => {
  return (
    <Card title="Live Brand Identity Preview" subtitle="Real-time visual preview of platform branding assets and color themes">
      <div className="space-y-4 text-xs">
        {/* Mock Header Brand Preview */}
        <div className="p-4 bg-slate-900 text-white rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-base shadow-sm"
              style={{ backgroundColor: branding.primaryBrandColor || '#002B49' }}
            >
              QS
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight">{branding.platformName || 'Bright Spark'}</div>
              <span className="text-[10px] text-slate-400 font-mono">Enterprise Operations Engine</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {branding.supportText}
            </span>
          </div>
        </div>

        {/* Mock UI Component Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Login Screen Header</span>
            <div className="p-3 bg-white border border-slate-200 rounded text-slate-900 space-y-1">
              <h4 className="font-extrabold text-sm">{branding.loginPageTitle}</h4>
              <p className="text-slate-500 text-xs">Sign in with your administrative credentials to continue.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Primary Brand Color Button</span>
            <div className="p-3 bg-white border border-slate-200 rounded flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 text-white font-bold rounded-lg text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                style={{ backgroundColor: branding.primaryBrandColor || '#002B49' }}
              >
                Sample Action Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
