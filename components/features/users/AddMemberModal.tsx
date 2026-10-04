'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { hierarchyService } from '@/services/hierarchyService';
import { UserPlus, Building, Phone, Mail, UserCheck } from 'lucide-react';
import { KYCDocument } from '@/types/domain';

export type MemberType = 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER' | 'BACKOFFICE';

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: MemberType;
  onSuccess?: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'DISTRIBUTOR',
  onSuccess,
}) => {
  const { toastSuccess } = useToast();
  const [memberType, setMemberType] = useState<MemberType>(defaultType);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [parentName, setParentName] = useState('Apex National Network');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycFiles, setKycFiles] = useState<Record<string, File | null>>({
    AADHAAR: null,
    PAN: null,
    GST_CERTIFICATE: null,
    CANCELLED_CHEQUE: null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    const requiredDocuments = ['AADHAAR', 'PAN', 'CANCELLED_CHEQUE'];
    if (memberType !== 'BACKOFFICE' && requiredDocuments.some((type) => !kycFiles[type])) return;

    setIsSubmitting(true);
    try {
      const code =
        memberType === 'MASTER_DISTRIBUTOR'
          ? `MD_${Math.floor(100 + Math.random() * 900)}`
          : memberType === 'DISTRIBUTOR'
          ? `DST_${Math.floor(100 + Math.random() * 900)}`
          : memberType === 'RETAILER'
          ? `RET_${Math.floor(100 + Math.random() * 900)}`
          : `EMP_${Math.floor(100 + Math.random() * 900)}`;

      const documents: KYCDocument[] = Object.entries(kycFiles)
        .filter((entry): entry is [string, File] => Boolean(entry[1]))
        .map(([type, file]) => ({
          id: `doc_${type.toLowerCase()}_${Date.now()}`,
          type: type as KYCDocument['type'],
          title: file.name,
          documentNumberMasked: 'Submitted for verification',
          fileUrl: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          status: 'PENDING',
        }));

      if (memberType === 'DISTRIBUTOR') {
        hierarchyService.addDistributorRecord({
          id: `dst_${Date.now()}`,
          code,
          userId: `usr_${Date.now()}`,
          name,
          businessName: businessName || name,
          email: email || `${code.toLowerCase()}@qinstar.in`,
          mobile,
          status: 'ACTIVE',
          kycStatus: 'APPROVED',
          approvalStatus: 'APPROVED',
          masterDistributorId: 'md_01',
          walletId: `wlt_dst_${Date.now()}`,
          createdByUserId: 'usr_admin_01',
          createdByRole: 'ADMIN',
          createdByEntityId: 'ent_admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents,
        });
      } else if (memberType === 'RETAILER') {
        hierarchyService.addRetailerRecord({
          id: `ret_${Date.now()}`,
          code,
          userId: `usr_${Date.now()}`,
          name,
          businessName: businessName || name,
          email: email || `${code.toLowerCase()}@qinstar.in`,
          mobile,
          accountStatus: 'ACTIVE',
          kycStatus: 'APPROVED',
          approvalStatus: 'APPROVED',
          masterDistributorId: 'md_01',
          distributorId: 'dst_01',
          planId: 'PLAN_STANDARD',
          walletId: `wlt_ret_${Date.now()}`,
          createdByUserId: 'usr_admin_01',
          createdByRole: 'ADMIN',
          createdByEntityId: 'ent_admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents,
        });
      } else if (memberType === 'MASTER_DISTRIBUTOR') {
        hierarchyService.addMasterDistributorRecord({
          id: `md_${Date.now()}`,
          code,
          userId: `usr_${Date.now()}`,
          name,
          businessName: businessName || name,
          email: email || `${code.toLowerCase()}@qinstar.in`,
          mobile,
          status: 'ACTIVE',
          walletId: `wlt_md_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents,
        });
      }

      toastSuccess(`New ${memberType.replace('_', ' ')} "${name}" (${code}) onboarded successfully!`);
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setName('');
      setBusinessName('');
      setMobile('');
      setEmail('');
      setKycFiles({ AADHAAR: null, PAN: null, GST_CERTIFICATE: null, CANCELLED_CHEQUE: null });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <UserPlus className="w-5 h-5 text-[var(--primary)]" />
          <span>Onboard New Network Member / User</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Select
          label="User / Member Type *"
          value={memberType}
          onChange={(e) => setMemberType(e.target.value as MemberType)}
          options={[
            { value: 'MASTER_DISTRIBUTOR', label: 'Master Distributor' },
            { value: 'DISTRIBUTOR', label: 'Distributor' },
            { value: 'RETAILER', label: 'Retailer' },
            { value: 'BACKOFFICE', label: 'Back Office User' },
          ]}
        />

        <Input
          label="Full Name *"
          placeholder="e.g. Subrahmanyam S"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
        />

        {memberType !== 'BACKOFFICE' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">KYC document uploads</p>
              <p className="mt-1 text-[11px] text-slate-500">Aadhaar, PAN and bank proof are required before onboarding.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['AADHAAR', 'Aadhaar Card *'],
                ['PAN', 'PAN Card *'],
                ['GST_CERTIFICATE', 'GST Certificate'],
                ['CANCELLED_CHEQUE', 'Cancelled Cheque / Passbook *'],
              ].map(([type, label]) => (
                <label key={type} className="space-y-1 text-[11px] font-semibold text-slate-700">
                  <span>{label}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    required={type !== 'GST_CERTIFICATE'}
                    onChange={(e) => setKycFiles((prev) => ({ ...prev, [type]: e.target.files?.[0] || null }))}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:font-bold file:text-blue-700"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Business / Firm Name"
          placeholder="e.g. Apex Digital Point"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          leftIcon={<Building className="w-4 h-4 text-slate-400" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Mobile Number (+91) *"
            placeholder="9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Email Address"
            placeholder="member@qinstar.in"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Input
          label="Mapped Parent Entity / Region"
          placeholder="e.g. Direct Admin / Apex Network"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
        />

        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Confirm & Onboard Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
