import React, { useState, useEffect } from 'react';
import { Retailer, KYCStatus, Distributor, RetailerPlan } from '@/types/domain';
import { CreateRetailerInput, UpdateRetailerInput, retailerService } from '@/services/retailerService';
import { retailerPlanService } from '@/services/retailerPlanService';
import { Modal, Button, Input, Select, FormField, MobileInput } from '@/components/ui';
import { User, Building2, Mail, Phone, MapPin, ShieldCheck, Tag, Info, AlertTriangle } from 'lucide-react';

interface RetailerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRetailerInput | UpdateRetailerInput) => Promise<boolean>;
  initialData?: Retailer | null;
  mode: 'create' | 'edit';
  masterDistributorId: string;
}

export const RetailerFormModal: React.FC<RetailerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  masterDistributorId,
}) => {
  const [formData, setFormData] = useState({
    distributorId: '',
    planId: '',
    name: '',
    code: '',
    businessName: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    kycStatus: 'APPROVED' as KYCStatus,
  });

  const [eligibleDistributors, setEligibleDistributors] = useState<Distributor[]>([]);
  const [activePlans, setActivePlans] = useState<RetailerPlan[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const dstList = await retailerService.getEligibleDistributorsForRetailerCreation(masterDistributorId);
        setEligibleDistributors(dstList);

        const plansRes = await retailerPlanService.getActiveRetailerPlans();
        if (plansRes.success && plansRes.data) {
          setActivePlans(plansRes.data);
        }
      } catch (err) {
        console.error('Error loading modal metadata:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();

    if (initialData && mode === 'edit') {
      setFormData({
        distributorId: initialData.distributorId || '',
        planId: initialData.planId || '',
        name: initialData.name || '',
        code: initialData.code || '',
        businessName: initialData.businessName || '',
        email: initialData.email || '',
        mobile: initialData.mobile || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        kycStatus: initialData.kycStatus || 'APPROVED',
      });
    } else {
      setFormData({
        distributorId: '',
        planId: '',
        name: '',
        code: '',
        businessName: '',
        email: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        kycStatus: 'APPROVED',
      });
    }
    setErrors({});
  }, [isOpen, initialData, mode, masterDistributorId]);

  // Pre-select first eligible distributor and first plan if blank in create mode
  useEffect(() => {
    if (mode === 'create' && isOpen) {
      if (!formData.distributorId && eligibleDistributors.length > 0) {
        setFormData((prev) => ({ ...prev, distributorId: eligibleDistributors[0].id }));
      }
      if (!formData.planId && activePlans.length > 0) {
        setFormData((prev) => ({ ...prev, planId: activePlans[0].id }));
      }
    }
  }, [eligibleDistributors, activePlans, mode, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.distributorId) newErrors.distributorId = 'Parent Distributor selection is required';
    if (!formData.planId) newErrors.planId = 'Commercial Retailer Plan is required';
    if (!formData.name.trim()) newErrors.name = 'Retailer Full Name is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business / Outlet Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
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
        code: formData.code.trim().toUpperCase() || undefined,
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
      };
      const success = await onSubmit(payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('Submit retailer form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Retailer' : `Edit Retailer - ${initialData?.code || ''}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {mode === 'create' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Admin Approval Notice:</span> Retailers created by Master
              Distributor will be submitted for platform review (`PENDING_APPROVAL`) and remain inactive until
              approved centrally in Admin Approval Center.
            </div>
          </div>
        )}

        {/* Section 1: Network & Plan Selection */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            Parent Distributor & Commercial Plan Assignment
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Parent Distributor *" error={errors.distributorId}>
              <Select
                value={formData.distributorId}
                onChange={(e) => handleChange('distributorId', e.target.value)}
                disabled={mode === 'edit' || eligibleDistributors.length === 0}
                options={
                  eligibleDistributors.length > 0
                    ? eligibleDistributors.map((d) => ({
                        label: `${d.name} (${d.code})`,
                        value: d.id,
                      }))
                    : [{ label: 'No Active/Approved Distributors Available', value: '' }]
                }
              />
            </FormField>

            <FormField label="Commercial Retailer Plan *" error={errors.planId}>
              <Select
                value={formData.planId}
                onChange={(e) => handleChange('planId', e.target.value)}
                options={
                  activePlans.length > 0
                    ? activePlans.map((p) => ({
                        label: `${p.name} (${p.code})`,
                        value: p.id,
                      }))
                    : [{ label: 'No Active Commercial Plans', value: '' }]
                }
              />
            </FormField>
          </div>

          {eligibleDistributors.length === 0 && mode === 'create' && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-md p-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                You currently have no active & approved distributors in your network to assign this retailer to.
              </span>
            </div>
          )}
        </div>

        {/* Section 2: Contact & Identification */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            Retailer Outlet & Contact Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Retailer Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Amit Verma"
              error={errors.name}
            />

            <Input
              label="Business / Store Name *"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="e.g. Verma General Store"
              error={errors.businessName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="amit@vermamart.com"
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

        {/* Section 3: Location & KYC Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Location & Compliance Settings
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Delhi"
            />

            <Input
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="e.g. Delhi NCR"
            />

            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              placeholder="110001"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="KYC Status">
              <Select
                value={formData.kycStatus}
                onChange={(e) => handleChange('kycStatus', e.target.value as KYCStatus)}
                options={[
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'UNDER_REVIEW', value: 'UNDER_REVIEW' },
                  { label: 'REJECTED', value: 'REJECTED' },
                ]}
              />
            </FormField>

            {mode === 'create' && (
              <Input
                label="Custom Retailer Code (Optional)"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="Auto-generated if empty"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={eligibleDistributors.length === 0 && mode === 'create'}
          >
            {mode === 'create' ? 'Submit Retailer for Approval' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
