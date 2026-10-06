'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import {
  UserCheck,
  Shield,
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Plus,
} from 'lucide-react';

export const CreateEmployeeWizard: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNo: '',
    employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    departmentId: 'KYC_ONBOARDING',
    roleId: 'KYC_SPECIALIST',
    statusId: 'ACTIVE',
    isAutoPassword: true,
    password: '',
    isViewOrder: true,
    isManageInventory: false,
    isPaymentApproval: false,
    isViewReports: true,
    joiningDate: new Date().toISOString().split('T')[0],
    shift: 'MORNING',
  });

  const handleNextStep = () => {
    if (!formData.fullName) {
      toastError('Please enter Full Name before proceeding.');
      return;
    }
    if (!formData.email) {
      toastError('Please enter Email ID before proceeding.');
      return;
    }
    setCurrentStep(2);
  };

  const handleSaveEmployee = (addAnother: boolean = false) => {
    toastSuccess(`Employee ${formData.employeeCode} ("${formData.fullName}") onboarded successfully!`);
    if (addAnother) {
      setFormData({
        fullName: '',
        email: '',
        contactNo: '',
        employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        departmentId: 'KYC_ONBOARDING',
        roleId: 'KYC_SPECIALIST',
        statusId: 'ACTIVE',
        isAutoPassword: true,
        password: '',
        isViewOrder: true,
        isManageInventory: false,
        isPaymentApproval: false,
        isViewReports: true,
        joiningDate: new Date().toISOString().split('T')[0],
        shift: 'MORNING',
      });
      setCurrentStep(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Step Wizard Indicator */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#155EEF]" />
            Add Employee (CreateEmployee)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Multi-step onboarding wizard for operational staff across KYC, Sales, Accounts, and Support.
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              currentStep === 1
                ? 'bg-[#155EEF] text-white border-[#155EEF]'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            Basic & Access Details
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              currentStep === 2
                ? 'bg-[#155EEF] text-white border-[#155EEF]'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            Work & Schedule
          </div>
        </div>
      </div>

      {/* STEP 1: Basic & Access Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card title="Category 1: Personal Info & Department Assignment" subtitle="Employee code, official email, and organizational role">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
              <Input
                label="Full Name (fullName)"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                required
              />

              <Input
                label="Official Email ID (email)"
                type="email"
                placeholder="employee@qinstarpay.com"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
              />

              <Input
                label="Mobile Number (contactNo)"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={formData.contactNo}
                onChange={(e) => setFormData((p) => ({ ...p, contactNo: e.target.value.replace(/\D/g, '') }))}
                required
              />

              <Input
                label="Employee Code (employeeCode)"
                value={formData.employeeCode}
                onChange={(e) => setFormData((p) => ({ ...p, employeeCode: e.target.value }))}
                required
              />

              <Select
                label="Department (departmentId)"
                value={formData.departmentId}
                onChange={(e) => setFormData((p) => ({ ...p, departmentId: e.target.value }))}
                options={[
                  { value: 'KYC_ONBOARDING', label: 'KYC & Onboarding Desk' },
                  { value: 'SALES', label: 'Sales & Growth' },
                  { value: 'ACCOUNTS', label: 'Finance & Accounts' },
                  { value: 'OPERATIONS', label: 'Operations & Support' },
                ]}
              />

              <Select
                label="Role Type (roleId)"
                value={formData.roleId}
                onChange={(e) => setFormData((p) => ({ ...p, roleId: e.target.value }))}
                options={[
                  { value: 'KYC_SPECIALIST', label: 'KYC Approval Specialist' },
                  { value: 'SALES_LEAD', label: 'Sales Lead' },
                  { value: 'ACCOUNTANT', label: 'Staff Accountant' },
                  { value: 'OPERATIONS_LEAD', label: 'Operations Lead' },
                ]}
              />

              <Select
                label="Initial Status (statusId)"
                value={formData.statusId}
                onChange={(e) => setFormData((p) => ({ ...p, statusId: e.target.value }))}
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'ON_LEAVE', label: 'On Leave' },
                  { value: 'SUSPENDED', label: 'Suspended' },
                ]}
              />
            </div>
          </Card>

          <Card title="Category 2: System Permissions & Security" subtitle="Configure granular feature switches for staff access">
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl">
                <div>
                  <span className="text-xs font-bold text-[#0F172A] block">Auto-generate Password (isAutoPassword)</span>
                  <span className="text-[11px] text-[#64748B]">Automatically create secure credentials and send welcome email.</span>
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
                  label="Password (password)"
                  type="password"
                  placeholder="Set employee password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E5EAF1] rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">View Orders (isViewOrder)</span>
                    <span className="text-[11px] text-[#64748B]">Visibility to global order pipeline.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isViewOrder}
                    onChange={(e) => setFormData((p) => ({ ...p, isViewOrder: e.target.checked }))}
                    className="w-4 h-4 text-[#155EEF] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E5EAF1] rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Manage Inventory (isManageInventory)</span>
                    <span className="text-[11px] text-[#64748B]">Permissions to add/edit products.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isManageInventory}
                    onChange={(e) => setFormData((p) => ({ ...p, isManageInventory: e.target.checked }))}
                    className="w-4 h-4 text-[#155EEF] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E5EAF1] rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Approve Payments (isPaymentApproval)</span>
                    <span className="text-[11px] text-[#64748B]">Grant access to approve payouts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isPaymentApproval}
                    onChange={(e) => setFormData((p) => ({ ...p, isPaymentApproval: e.target.checked }))}
                    className="w-4 h-4 text-[#155EEF] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E5EAF1] rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">View Reports (isViewReports)</span>
                    <span className="text-[11px] text-[#64748B]">Access to financial audit reports.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isViewReports}
                    onChange={(e) => setFormData((p) => ({ ...p, isViewReports: e.target.checked }))}
                    className="w-4 h-4 text-[#155EEF] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-white rounded-2xl border border-[#E5EAF1] p-4 shadow-xs flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Work & Schedule Details
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Work & Schedule Details */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card title="Step 2: Work & Schedule Details" subtitle="Joining date and operational shift timing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <Input
                label="Joining Date (joiningDate)"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData((p) => ({ ...p, joiningDate: e.target.value }))}
                required
              />

              <Select
                label="Assigned Shift (shift)"
                value={formData.shift}
                onChange={(e) => setFormData((p) => ({ ...p, shift: e.target.value }))}
                options={[
                  { value: 'MORNING', label: 'Morning Shift (09:00 AM - 06:00 PM)' },
                  { value: 'EVENING', label: 'Evening Shift (02:00 PM - 11:00 PM)' },
                  { value: 'NIGHT', label: 'Night Shift (10:00 PM - 07:00 AM)' },
                ]}
              />
            </div>
          </Card>

          <div className="bg-white rounded-2xl border border-[#E5EAF1] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Step 1
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSaveEmployee(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Save & Add Another
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleSaveEmployee(false)}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Employee
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
