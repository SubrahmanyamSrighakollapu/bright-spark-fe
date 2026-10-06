'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/utils/formatters';
import { Shield, Save, History, CheckCircle2, FileText, Tag, Clock } from 'lucide-react';

const DEFAULT_PRIVACY_POLICY = `## 1. Information Collection & Usage
Qin Star Pay collects personal verification documents (PAN, Aadhaar, Bank Account Statements) to satisfy RBI KYC mandates and enable seamless crop settlement payments across our agriculture distribution network.

## 2. Data Protection & Security Controls
All sensitive transaction tokens and encryption keys are protected using AES-256 bit encryption in compliance with PCI-DSS guidelines.

## 3. Data Sharing Restrictions
We do not sell or rent user data to third parties. Data is shared exclusively with integrated payment gateway providers (e.g., Razorpay, Cashfree, PhonePe) and scheduled banking partners solely for settlement verification.`;

export const PrivacyPolicyView: React.FC = () => {
  const { toastSuccess } = useToast();

  const [versionTag, setVersionTag] = useState('v2.4 - Effective Sept 2026');
  const [lastUpdated, setLastUpdated] = useState('2026-09-26T14:30:00Z');
  const [content, setContent] = useState(DEFAULT_PRIVACY_POLICY);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      setLastUpdated(now);
      setIsPublishing(false);
      toastSuccess(`Privacy Policy version "${versionTag}" published successfully!`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#155EEF]" />
            Privacy Policy Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Edit and publish platform data collection, privacy terms, and RBI compliance policies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
            <form onSubmit={handlePublish} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#155EEF]" /> Version Tag
                  </label>
                  <Input
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" /> Last Updated Timestamp
                  </label>
                  <Input value={formatDateTime(lastUpdated)} readOnly className="bg-[#F8FAFC] text-[#475569]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Document Markdown / Text Content Body
                </label>
                <textarea
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#155EEF] leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={isPublishing} className="bg-[#155EEF] hover:bg-[#124BCC]">
                  <Save className="w-4 h-4 mr-2" />
                  Save & Publish Policy
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Info Card */}
        <div>
          <Card className="p-5 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Policy Audit & Version Log</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                <div className="font-bold text-[#0F172A] flex items-center justify-between">
                  <span>{versionTag}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B]">{formatDateTime(lastUpdated)}</div>
                <div className="text-[11px] text-[#334155]">Published by Super Admin</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1 opacity-70">
                <div className="font-bold text-[#0F172A]">v2.3 - Effective Jun 2026</div>
                <div className="text-[11px] text-[#64748B]">2026-06-15 10:00 AM</div>
                <div className="text-[11px] text-[#334155]">Archived Version</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
