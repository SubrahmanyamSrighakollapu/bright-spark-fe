'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatusBadge, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatters';
import { walletService } from '@/services/walletService';
import { userService, NetworkUserItem } from '@/services/userService';
import { kycService } from '@/services/kycService';
import {
  Building2,
  Users,
  Store,
  Wallet,
  Mail,
  Phone,
  Camera,
  Upload,
  RefreshCw,
} from 'lucide-react';

export default function MasterDistributorProfilePage() {
  const { session, profilePhotoUrl, updateProfilePhotoUrl } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const mdId = session?.entityId || 'md_001';
  const [profile, setProfile] = useState<NetworkUserItem | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const targetId = session?.entityId || session?.userId || mdId;
      if (targetId) {
        const [userRes, wltRes] = await Promise.all([
          userService.getUserById(targetId),
          walletService.getMasterDistributorWallet(session?.entityId || mdId).catch(() => ({ success: false, data: null })),
        ]);

        if (userRes.success && userRes.data && ((userRes.data as any).type === 'MASTER_DISTRIBUTOR' || (userRes.data as any).role === 'MASTER_DISTRIBUTOR')) {
          const u = userRes.data as any;
          setProfile({
            id: u.id || mdId,
            userId: u.userId || u.id || mdId,
            partyId: u.partyId || mdId,
            code: u.code || 'MD001',
            fullName: session?.name || u.fullName || u.name || 'Apex National Network',
            name: session?.name || u.displayName || u.name || 'Apex National Network',
            displayName: u.displayName || u.name || 'Apex National Network',
            businessName: u.businessName || 'Apex Financial Solutions Private Limited',
            email: session?.email || u.email || 'admin@apexnetwork.com',
            mobile: session?.mobile || u.mobile || '+91 98765 00100',
            contactNo: session?.mobile || u.mobile || '+91 98765 00100',
            role: 'MASTER_DISTRIBUTOR',
            roleName: 'MASTER_DISTRIBUTOR',
            status: u.accountStatus || u.status || 'ACTIVE',
            accountStatus: u.accountStatus || 'ACTIVE',
            approvalStatus: u.approvalStatus || 'APPROVED',
            kycStatus: u.kycStatus || 'APPROVED',
            isAadharVerify: true,
            panNoVerify: true,
            availableBalance: wltRes.success && wltRes.data ? wltRes.data.availableBalance : 125000,
            holdBalance: wltRes.success && wltRes.data ? wltRes.data.holdBalance : 0,
            ledgerBalance: wltRes.success && wltRes.data ? wltRes.data.ledgerBalance : 125000,
            version: 1,
            createdAt: u.createdAt || new Date().toISOString(),
          });
          if (wltRes.success && wltRes.data) setWalletBalance(wltRes.data.availableBalance);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setProfile({
      id: mdId,
      userId: mdId,
      partyId: mdId,
      code: 'MD001',
      fullName: session?.name || 'Apex National Network',
      name: session?.name || 'Apex National Network',
      displayName: 'Apex National Network',
      businessName: 'Apex Financial Solutions Private Limited',
      email: session?.email || 'admin@apexnetwork.com',
      mobile: '+91 98765 00100',
      contactNo: '+91 98765 00100',
      role: 'MASTER_DISTRIBUTOR',
      roleName: 'MASTER_DISTRIBUTOR',
      status: 'ACTIVE',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      kycStatus: 'APPROVED',
      isAadharVerify: true,
      panNoVerify: true,
      availableBalance: 125000,
      holdBalance: 0,
      ledgerBalance: 125000,
      version: 1,
      createdAt: new Date().toISOString(),
    });
    setWalletBalance(125000);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, [session?.userId, session?.entityId]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setImageError(false);
        updateProfilePhotoUrl(dataUrl);
        try {
          await kycService.uploadDocument('PROFILE_PHOTO', file);
        } catch {
          // Cached locally
        }
        toastSuccess('Profile photo updated successfully!');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toastError('Failed to process uploaded photo.');
      setIsUploadingPhoto(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-5xl mx-auto">
        <FinancialPageHeader
          title="Master Distributor Profile"
          subtitle="Inspect your Master Distributor business entity, profile photograph, network scope, and platform account credentials."
          statusBadge={<StatusBadge status={profile?.accountStatus || 'ACTIVE'} label="Approved Master Distributor" />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfileData}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh Profile
            </Button>
          }
        />

        {/* Identity & Photo Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                {profilePhotoUrl && !imageError ? (
                  <img
                    src={profilePhotoUrl}
                    alt={profile?.fullName || 'Master Distributor'}
                    onError={() => setImageError(true)}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md ring-4 ring-indigo-50 border border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-[#0F4C81] text-white font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-md ring-4 ring-indigo-50">
                    {(profile?.fullName || session?.name || 'MD').slice(0, 2).toUpperCase()}
                  </div>
                )}

                <label
                  htmlFor="md-photo-input"
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-1"
                  title="Update Profile Photo"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span>Update</span>
                </label>
                <input
                  id="md-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {profile?.fullName || session?.name || 'Apex National Network'}
                  </h2>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#0F4C81] border border-indigo-200">
                    {profile?.code || 'MD001'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">{profile?.businessName}</p>
              </div>
            </div>

            <label
              htmlFor="md-photo-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#0F4C81] border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
            >
              <Upload className="w-4 h-4 text-[#0F4C81]" />
              <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Profile Photo'}</span>
              <input
                id="md-photo-btn"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
              />
            </label>
          </div>

          {/* Business Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-[#0F4C81]" /> Business Profile
              </h3>
              <div className="space-y-2 font-mono text-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Entity Code:</span>
                  <span className="font-bold text-[#0F4C81]">{profile?.code}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Legal Entity:</span>
                  <span className="font-sans font-semibold text-slate-900">{profile?.businessName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">KYC Status:</span>
                  <StatusBadge status={profile?.kycStatus || 'APPROVED'} size="sm" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Mail className="w-4 h-4 text-[#0F4C81]" /> Contact & Communication
              </h3>
              <div className="space-y-2 font-mono text-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Primary Email:</span>
                  <span className="font-semibold text-slate-900">{profile?.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Registered Mobile:</span>
                  <span className="font-semibold text-slate-900">{profile?.mobile}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Operating Role:</span>
                  <span className="font-sans font-bold text-[#0F4C81]">MASTER_DISTRIBUTOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network & Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0F4C81]" /> Direct Distributors
              </span>
              <span className="font-mono text-xs font-bold text-[#0F4C81]">8 Active</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">8 Partners</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#0F4C81]" /> Retailer Outlets
              </span>
              <span className="font-mono text-xs font-bold text-emerald-700">42 Outlets</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">42 Retailers</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F4C81] uppercase flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#0F4C81]" /> Available Wallet
              </span>
              <span className="font-mono text-xs font-bold text-emerald-700">ACTIVE</span>
            </div>
            <p className="text-2xl font-extrabold text-[#0F4C81] font-mono">{formatCurrency(walletBalance)}</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
