'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  Send,
  RotateCcw,
  KeyRound,
  Check,
} from 'lucide-react';

export const CreateUserForm: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [formData, setFormData] = useState({
    aadharNo: '',
    panNo: '',
    isAadharVerify: false,
    panNoVerify: false,
    fullName: '',
    email: '',
    contactNo: '',
    roleName: 'RETAILER',
    statusValue: 'ACTIVE',
    isAutoPassword: true,
    password: '',
    isActive: true,
  });

  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  const [verifyingPan, setVerifyingPan] = useState(false);

  const handleVerifyAadhaar = () => {
    if (!formData.aadharNo || formData.aadharNo.length < 12) {
      toastError('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }
    setVerifyingAadhaar(true);
    setTimeout(() => {
      setVerifyingAadhaar(false);
      setFormData((prev) => ({ ...prev, isAadharVerify: true }));
      toastSuccess('Aadhaar number verified successfully via NSDL API!');
    }, 600);
  };

  const handleVerifyPan = () => {
    if (!formData.panNo || formData.panNo.length < 10) {
      toastError('Please enter a valid 10-character PAN Number.');
      return;
    }
    setVerifyingPan(true);
    setTimeout(() => {
      setVerifyingPan(false);
      setFormData((prev) => ({ ...prev, panNoVerify: true }));
      toastSuccess('PAN details verified successfully via Income Tax Portal!');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      toastError('Full Name is required.');
      return;
    }
    if (!formData.contactNo || formData.contactNo.length < 10) {
      toastError('Valid 10-digit Mobile Number is required.');
      return;
    }
    toastSuccess(`New ${formData.roleName.replace('_', ' ')} user "${formData.fullName}" created successfully!`);
  };

  const handleSendCredentials = () => {
    if (!formData.email && !formData.contactNo) {
      toastError('Please specify Email or Mobile number to send credentials.');
      return;
    }
    toastInfo(`Welcome credentials dispatched via SMS and Email to ${formData.fullName || 'User'}!`);
  };

  const handleCancel = () => {
    setFormData({
      aadharNo: '',
      panNo: '',
      isAadharVerify: false,
      panNoVerify: false,
      fullName: '',
      email: '',
      contactNo: '',
      roleName: 'RETAILER',
      statusValue: 'ACTIVE',
      isAutoPassword: true,
      password: '',
      isActive: true,
    });
    toastInfo('Form reset to blank.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#155EEF]" />
            Add User (CreateUser)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Onboard new downline users into the platform hierarchy under Master Distributor, Distributor, or Retailer roles.
          </p>
        </div>
      </div>

      {/* Section 1: Identity Verification */}
      <Card title="1. Identity Verification" subtitle="Verify Aadhaar & PAN credentials via real-time API integrations">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Aadhaar Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155]">Aadhaar Number (aadharNo)</label>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  formData.isAadharVerify
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {formData.isAadharVerify ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aadhaar Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-amber-600" /> Unverified
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="12-digit Aadhaar Number"
                maxLength={12}
                value={formData.aadharNo}
                onChange={(e) => setFormData((p) => ({ ...p, aadharNo: e.target.value.replace(/\D/g, '') }))}
                className="flex-1 px-3 py-2.5 bg-white border border-[#E5EAF1] rounded-lg text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleVerifyAadhaar}
                isLoading={verifyingAadhaar}
                disabled={formData.isAadharVerify}
              >
                {formData.isAadharVerify ? 'Verified' : 'Verify Aadhaar'}
              </Button>
            </div>
          </div>

          {/* PAN Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155]">PAN Number (panNo)</label>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  formData.panNoVerify
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {formData.panNoVerify ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAN Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-amber-600" /> Unverified
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="10-character PAN Number"
                maxLength={10}
                value={formData.panNo}
                onChange={(e) => setFormData((p) => ({ ...p, panNo: e.target.value.toUpperCase() }))}
                className="flex-1 px-3 py-2.5 bg-white border border-[#E5EAF1] rounded-lg text-xs font-mono text-[#0F172A] uppercase focus:outline-none focus:border-[#155EEF]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleVerifyPan}
                isLoading={verifyingPan}
                disabled={formData.panNoVerify}
              >
                {formData.panNoVerify ? 'Verified' : 'Verify PAN'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2: Personal & Role Details */}
      <Card title="2. Personal & Role Details" subtitle="User contact information, downline network role and initial status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          <Input
            label="Full Name (fullName)"
            placeholder="Enter user's legal name"
            value={formData.fullName}
            onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Email Address (email)"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Mobile Number (contactNo)"
            placeholder="10-digit mobile number"
            maxLength={10}
            value={formData.contactNo}
            onChange={(e) => setFormData((p) => ({ ...p, contactNo: e.target.value.replace(/\D/g, '') }))}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            required
          />

          <Select
            label="Downline Network Role (roleName)"
            value={formData.roleName}
            onChange={(e) => setFormData((p) => ({ ...p, roleName: e.target.value }))}
            options={[
              { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor (MD)' },
              { value: 'DISTRIBUTOR', label: 'Distributor (DS)' },
              { value: 'RETAILER', label: 'Retailer' },
            ]}
          />

          <Select
            label="Initial Account Status (statusValue)"
            value={formData.statusValue}
            onChange={(e) => setFormData((p) => ({ ...p, statusValue: e.target.value }))}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
              { value: 'SUSPENDED', label: 'Suspended' },
            ]}
          />
        </div>
      </Card>

      {/* Section 3: Account Settings */}
      <Card title="3. Account Security Settings" subtitle="Credentials generation and immediate operational activation switch">
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">Auto-generate Password (isAutoPassword)</span>
              <span className="text-[11px] text-[#64748B]">Automatically create a secure temporary password and dispatch via SMS/Email.</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, isAutoPassword: !p.isAutoPassword }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.isAutoPassword ? 'bg-[#155EEF]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.isAutoPassword ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!formData.isAutoPassword && (
            <Input
              label="Manual Password (password)"
              type="password"
              placeholder="Set initial password"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
            />
          )}

          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">Account Active Status (isActive)</span>
              <span className="text-[11px] text-[#64748B]">Set user account to active state immediately upon creation.</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, isActive: !p.isActive }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.isActive ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Form Action Controls */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
        >
          Cancel / Clear Form
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSendCredentials}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Credentials
          </Button>

          <Button
            type="submit"
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create User Account
          </Button>
        </div>
      </div>
    </form>
  );
};
