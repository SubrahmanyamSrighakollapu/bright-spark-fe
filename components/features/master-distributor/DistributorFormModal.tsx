import React, { useState, useEffect } from 'react';
import { Distributor, AccountStatus, KYCStatus } from '@/types/domain';
import { CreateDistributorInput, UpdateDistributorInput } from '@/services/distributorService';
import { Modal, Button, Input, Select, FormField, MobileInput } from '@/components/ui';
import { User, Building2, Mail, Phone, MapPin, ShieldCheck, Tag } from 'lucide-react';

interface DistributorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDistributorInput | UpdateDistributorInput) => Promise<boolean>;
  initialData?: Distributor | null;
  mode: 'create' | 'edit';
}

export const DistributorFormModal: React.FC<DistributorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    businessName: '',
    email: '',
    mobile: '',
    businessType: 'Private Limited',
    gstNumber: '',
    panNumberMasked: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    kycStatus: 'APPROVED' as KYCStatus,
    status: 'ACTIVE' as AccountStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        businessName: initialData.businessName || '',
        email: initialData.email || '',
        mobile: initialData.mobile || '',
        businessType: initialData.businessType || 'Private Limited',
        gstNumber: initialData.gstNumber || '',
        panNumberMasked: initialData.panNumberMasked || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        kycStatus: initialData.kycStatus || 'APPROVED',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        businessName: '',
        email: '',
        mobile: '',
        businessType: 'Private Limited',
        gstNumber: '',
        panNumberMasked: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        kycStatus: 'APPROVED',
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (mode === 'create' && !formData.code.trim()) {
      newErrors.code = 'Distributor Code is required';
    } else if (mode === 'create' && !/^[A-Z0-9_-]{3,15}$/i.test(formData.code.trim())) {
      newErrors.code = 'Code must be 3-15 alphanumeric characters';
    }

    if (!formData.businessName.trim()) newErrors.businessName = 'Business / Entity Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim().replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
      };
      const success = await onSubmit(payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Distributor' : `Edit Distributor - ${initialData?.code || ''}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Section 1: Basic Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            Contact & Identification
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Rahul Sharma"
              error={errors.name}
            />

            <Input
              label="Distributor Code *"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g. DST009"
              disabled={mode === 'edit'}
              error={errors.code}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="rahul@example.com"
              type="email"
              error={errors.email}
            />

            <MobileInput
              label="Mobile Number *"
              value={formData.mobile}
              onChange={(e: any) => handleChange('mobile', typeof e === 'string' ? e : e?.target?.value || '')}
              error={errors.mobile}
              required
            />
          </div>
        </div>

        {/* Section 2: Business & Tax Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            Business & Entity Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Business Name *"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="e.g. Sharma Digital Pay"
              error={errors.businessName}
            />

            <FormField label="Business Type">
              <Select
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                options={[
                  { label: 'Private Limited', value: 'Private Limited' },
                  { label: 'Sole Proprietorship', value: 'Sole Proprietorship' },
                  { label: 'Partnership', value: 'Partnership' },
                  { label: 'LLP', value: 'LLP' },
                  { label: 'Public Limited', value: 'Public Limited' },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GST Number (Optional)"
              value={formData.gstNumber}
              onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
              placeholder="e.g. 27AAAAA0000A1Z5"
            />

            <Input
              label="PAN Number (Masked/Full)"
              value={formData.panNumberMasked}
              onChange={(e) => handleChange('panNumberMasked', e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE1234F"
            />
          </div>
        </div>

        {/* Section 3: Address & Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Address & Status Configuration
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Mumbai"
            />

            <Input
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="e.g. Maharashtra"
            />

            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              placeholder="400001"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="KYC Verification Status">
              <Select
                value={formData.kycStatus}
                onChange={(e) => handleChange('kycStatus', e.target.value as KYCStatus)}
                options={[
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'REJECTED', value: 'REJECTED' },
                  { label: 'EXPIRED', value: 'EXPIRED' },
                ]}
              />
            </FormField>

            <FormField label="Account Status">
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as AccountStatus)}
                options={[
                  { label: 'ACTIVE', value: 'ACTIVE' },
                  { label: 'INACTIVE', value: 'INACTIVE' },
                  { label: 'SUSPENDED', value: 'SUSPENDED' },
                ]}
              />
            </FormField>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create Distributor' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
