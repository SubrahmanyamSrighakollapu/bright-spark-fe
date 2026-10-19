'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { FileText, Save, Upload, Building, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const InvoiceDetailsView: React.FC = () => {
  const { toastSuccess } = useToast();

  const [companyName, setCompanyName] = useState('Bright Spark India Private Limited');
  const [gstNo, setGstNo] = useState('36AAACQ9481Q1Z4');
  const [address, setAddress] = useState('Plot No. 42, Financial District, Nanakramguda, Hyderabad, Telangana - 500032');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('billing@brightspark.com');
  const [footerNote, setFooterNote] = useState('This is a computer-generated tax invoice. No signature required under Section 31 of CGST Act 2017.');
  const [termsContent, setTermsContent] = useState('1. All payments are subject to bank processing rules.\n2. Discrepancies must be reported within 7 business days.\n3. GST charges are non-refundable after tax invoice filing.');
  const [logoFileName, setLogoFileName] = useState<string | null>('bright_spark_official_logo.jpg');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toastSuccess('Invoice branding & legal tax settings updated successfully!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      toastSuccess(`Uploaded logo asset: ${file.name}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#2F6F5E]" />
            Invoice & Legal Tax Configuration
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Configure company legal entity details, taxes, GSTIN, header logo, and printable invoice disclaimers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl">
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-base font-bold text-[#0F172A] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#2F6F5E]" /> Entity Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Company Name (companyName) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    GSTIN Number (gstNo) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    placeholder="15-character GSTIN"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Registered Business Address (address)
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2F6F5E]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Contact Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Support Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              {/* Logo Asset Upload */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#334155] mb-1">Company Header Logo Asset</label>
                <div className="p-4 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2F6F5E] flex items-center justify-center font-bold text-lg border border-blue-200">
                      Q
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#0F172A]">
                        {logoFileName || 'No logo uploaded'}
                      </div>
                      <div className="text-[11px] text-[#64748B]">PNG, JPG or SVG (Max 2MB)</div>
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <span className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#2F6F5E]" />
                      Upload Logo
                    </span>
                  </label>
                </div>
              </div>

              {/* Legal Notes */}
              <div className="space-y-4 pt-2">
                <h2 className="text-base font-bold text-[#0F172A] pb-2 border-b border-[#E2E8F0] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2F6F5E]" /> Invoice Terms & Legal Footers
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Invoice Footer Note</label>
                  <Input value={footerNote} onChange={(e) => setFooterNote(e.target.value)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Terms & Conditions Text (T&C)</label>
                  <textarea
                    rows={4}
                    value={termsContent}
                    onChange={(e) => setTermsContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2F6F5E]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" className="px-6">
                  <Save className="w-4 h-4 mr-2" />
                  Save Invoice Settings
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Invoice Preview Mockup */}
        <div>
          <Card className="p-5 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Live Invoice Printable Preview</h3>
            
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-4 text-[11px] text-[#334155]">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-[#CBD5E1] pb-3">
                <div>
                  <div className="font-bold text-[#0F172A] text-sm">{companyName || 'Company Name'}</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 max-w-[200px]">{address}</div>
                  <div className="text-[10px] text-[#2F6F5E] font-semibold mt-1">GSTIN: {gstNo}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-[#0F172A]">TAX INVOICE</span>
                  <div className="text-[10px] text-[#64748B]">#INV-2026-0894</div>
                  <div className="text-[10px] text-[#64748B]">Date: 26 Sep 2026</div>
                </div>
              </div>

              {/* Sample Table */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[#0F172A] border-b pb-1">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-[#475569]">
                  <span>Paddy Settlement Payout</span>
                  <span>₹25,000.00</span>
                </div>
                <div className="flex justify-between text-[#475569]">
                  <span>Platform Gateway Fee</span>
                  <span>₹10.00</span>
                </div>
                <div className="flex justify-between text-[#475569]">
                  <span>18% GST on Fee</span>
                  <span>₹1.80</span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#CBD5E1] pt-3 text-[9px] text-[#64748B] space-y-1">
                <div className="font-semibold text-[#0F172A]">Note:</div>
                <div>{footerNote}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
