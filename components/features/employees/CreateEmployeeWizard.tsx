'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import {
  employeeService,
  EmployeeMetaDepartment,
  EmployeeMetaRole,
} from '@/services/employeeService';
import {
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Loader2,
} from 'lucide-react';

export const CreateEmployeeWizard: React.FC = () => {
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [departments, setDepartments] = useState<EmployeeMetaDepartment[]>([
    { code: 'OPERATIONS', label: 'Operations', description: 'Operations & Technical Support' },
    { code: 'ACCOUNTS', label: 'Accounts', description: 'Finance & Accounts Management' },
    { code: 'KYC', label: 'KYC', description: 'Verification & KYC Compliance' },
    { code: 'SALES', label: 'Sales', description: 'Business Development & Growth' },
  ]);

  const [roles, setRoles] = useState<EmployeeMetaRole[]>([
    { id: 5, code: 'OPERATIONS', name: 'Operations', description: null },
    { id: 6, code: 'ACCOUNTS', name: 'Accounts', description: null },
    { id: 7, code: 'KYC', name: 'KYC', description: null },
    { id: 8, code: 'SALES', name: 'Sales', description: null },
  ]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    employeeCode: '',
    departmentCode: 'OPERATIONS',
    roleId: 5,
    designation: 'Operations Staff',
    joiningDate: new Date().toISOString().split('T')[0],
    shift: 'MORNING',
  });

  useEffect(() => {
    employeeService.getEmployeeMeta().then((meta) => {
      if (meta.departments.length > 0) setDepartments(meta.departments);
      if (meta.roles.length > 0) {
        setRoles(meta.roles);
        // Default roleId to first role
        if (meta.roles[0]) {
          setFormData((p) => ({ ...p, roleId: meta.roles[0].id, departmentCode: meta.departments[0]?.code || 'OPERATIONS' }));
        }
      }
    }).catch((err) => {
      console.warn('Failed to load employee meta', err);
    });
  }, []);

  // When department changes, update default role and designation matching that department
  const handleDepartmentChange = (deptCode: string) => {
    const matchedRole = roles.find((r) => r.code === deptCode) || roles[0];
    const roleId = matchedRole ? matchedRole.id : 5;
    const defaultDesignations: Record<string, string> = {
      OPERATIONS: 'Operations Lead',
      ACCOUNTS: 'Staff Accountant',
      KYC: 'KYC Specialist',
      SALES: 'Sales Lead',
    };
    setFormData((p) => ({
      ...p,
      departmentCode: deptCode,
      roleId: roleId,
      designation: defaultDesignations[deptCode] || 'Staff Member',
    }));
  };

  const handleNextStep = () => {
    if (!formData.fullName.trim()) {
      toastError('Please enter Full Name before proceeding.');
      return;
    }
    if (!formData.email.trim()) {
      toastError('Please enter Official Email ID before proceeding.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      toastError('Please enter a valid 10-digit mobile number. It is required for the initial password.');
      return;
    }
    setCurrentStep(2);
  };

  const handleSaveEmployee = async (addAnother: boolean = false) => {
    try {
      setIsSubmitting(true);
      const created = await employeeService.createEmployee({
        employeeCode: formData.employeeCode,
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        departmentCode: formData.departmentCode,
        roleId: Number(formData.roleId),
        designation: formData.designation,
        joiningDate: formData.joiningDate,
        shiftCode: formData.shift as 'MORNING' | 'EVENING' | 'NIGHT',
      });

      toastSuccess(`Employee ${created.employeeCode} ("${created.fullName}") onboarded successfully!`);

      if (addAnother) {
        setFormData({
          fullName: '',
          email: '',
          mobile: '',
          employeeCode: '',
          departmentCode: 'OPERATIONS',
          roleId: roles[0]?.id || 5,
          designation: 'Operations Staff',
          joiningDate: new Date().toISOString().split('T')[0],
          shift: 'MORNING',
        });
        setCurrentStep(1);
      } else {
        router.push('/admin/employees');
      }
    } catch (err: unknown) {
      toastError((err as Error).message || 'Failed to onboard employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Step Wizard Indicator */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#155EEF]" />
            Onboard New Employee
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Multi-step wizard to create staff under role <strong className="text-slate-800">Employee</strong> across the 4 departments: Operations, Accounts, KYC, and Sales.
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
            Basic & Department Details
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              currentStep === 2
                ? 'bg-[#155EEF] text-white border-[#155EEF]'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            Schedule & Credentials
          </div>
        </div>
      </div>

      {/* STEP 1: Basic & Department Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card title="Category 1: Personal Info & Department Assignment" subtitle="Employee identity, contact, and department assignment">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
              <Input
                label="Full Name"
                placeholder="e.g. Rajesh Kumar"
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                required
              />

              <Input
                label="Official Email ID"
                type="email"
                placeholder="rajesh.ops@qinstarpay.com"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
              />

              <Input
                label="Mobile Number"
                placeholder="9876543210"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => setFormData((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }))}
                required
              />

              <Input
                label="Employee Code"
                value={formData.employeeCode}
                onChange={(e) => setFormData((p) => ({ ...p, employeeCode: e.target.value }))}
                required
              />

              <Select
                label="Department (4 Core Options)"
                value={formData.departmentCode}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                options={departments.map((d) => ({
                  value: d.code,
                  label: `${d.label} (${d.code})`,
                }))}
              />

              <Select
                label="Role Category Role"
                value={formData.roleId.toString()}
                onChange={(e) => setFormData((p) => ({ ...p, roleId: Number(e.target.value) }))}
                options={roles.map((r) => ({
                  value: r.id.toString(),
                  label: `${r.name} (Role: Employee)`,
                }))}
              />

              <Input
                label="Designation"
                placeholder="e.g. Operations Executive"
                value={formData.designation}
                onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
              />
            </div>
          </Card>

          <div className="bg-white rounded-2xl border border-[#E5EAF1] p-4 shadow-xs flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Schedule & Credentials
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Schedule & Credentials */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card title="Step 2: Work Schedule & Password Security" subtitle="Joining date, assigned shift, and account password">
            <div className="space-y-5 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Joining Date"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData((p) => ({ ...p, joiningDate: e.target.value }))}
                  required
                />

                <Select
                  label="Assigned Shift"
                  value={formData.shift}
                  onChange={(e) => setFormData((p) => ({ ...p, shift: e.target.value }))}
                  options={[
                    { value: 'MORNING', label: 'Morning Shift (09:00 AM - 06:00 PM)' },
                    { value: 'EVENING', label: 'Evening Shift (02:00 PM - 11:00 PM)' },
                    { value: 'NIGHT', label: 'Night Shift (10:00 PM - 07:00 AM)' },
                  ]}
                />
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl">
                <div>
                  <span className="text-xs font-bold text-[#0F172A] block">Temporary Password</span>
                  <span className="text-[11px] text-[#64748B]">The initial password is the last 4 digits of the employee mobile number. The employee must create a new secure password immediately after first login.</span>
                </div>
              </div>
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
                disabled={isSubmitting}
                onClick={() => handleSaveEmployee(true)}
                leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              >
                Save & Add Another
              </Button>

              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={() => handleSaveEmployee(false)}
                leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              >
                {isSubmitting ? 'Onboarding...' : 'Save Employee'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
