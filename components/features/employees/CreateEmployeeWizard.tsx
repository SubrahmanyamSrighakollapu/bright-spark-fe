'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, CalendarDays, CheckCircle2, KeyRound, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { employeeService, type EmployeeMetaDepartment } from '@/services/employeeService';

const initialForm = () => ({
  fullName: '', email: '', mobile: '', departmentCode: '',
  joiningDate: new Date().toISOString().split('T')[0], shiftCode: 'MORNING' as 'MORNING' | 'EVENING' | 'NIGHT',
});

export const CreateEmployeeWizard: React.FC = () => {
  const router = useRouter(); const { toastSuccess, toastError } = useToast();
  const [departments, setDepartments] = useState<EmployeeMetaDepartment[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loadingMeta, setLoadingMeta] = useState(true); const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    employeeService.getEmployeeMeta().then((meta) => setDepartments(meta.departments)).catch((error) => toastError(error instanceof Error ? error.message : 'Unable to load departments')).finally(() => setLoadingMeta(false));
  }, [toastError]);

  const validate = () => {
    if (form.fullName.trim().length < 2) return 'Enter the employee full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid official email address.';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return 'Enter a valid 10-digit Indian mobile number.';
    if (!form.departmentCode) return 'Department is mandatory.';
    if (!form.joiningDate) return 'Joining date is mandatory.';
    return null;
  };

  const save = async () => {
    const error = validate(); if (error) return toastError(error);
    setSubmitting(true);
    try {
      const employee = await employeeService.createEmployee({ ...form, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase() });
      toastSuccess(`Employee ${employee.employeeCode} (${employee.fullName}) created successfully.`);
      router.push('/admin/employees');
    } catch (error) { toastError(error instanceof Error ? error.message : 'Failed to create employee'); }
    finally { setSubmitting(false); }
  };

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
      <div><h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-950"><UserCheck className="h-5 w-5 text-blue-600" />Onboard New Employee</h1><p className="mt-1 text-xs font-medium text-slate-500">Create an employee account and assign its department in one step.</p></div>
      <span className="inline-flex self-start items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 md:self-auto"><ShieldCheck className="h-4 w-4" />Employee code generated automatically</span>
    </div>

    <Card title="Employee Details" subtitle="Enter the required identity, department and work-schedule information">
      <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 xl:grid-cols-3">
        <Input label="Full Name" placeholder="e.g. Rajesh Kumar" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required />
        <Input label="Official Email ID" type="email" placeholder="rajesh@qinstarpay.com" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
        <Input label="Mobile Number" placeholder="9876543210" maxLength={10} value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value.replace(/\D/g, '') }))} required />
        <Select label="Department" placeholder={loadingMeta ? 'Loading departments…' : 'Select department'} value={form.departmentCode} disabled={loadingMeta} onChange={(event) => setForm((current) => ({ ...current, departmentCode: event.target.value }))} options={departments.map((department) => ({ value: department.code, label: department.label }))} required />
        <Input label="Joining Date" type="date" value={form.joiningDate} onChange={(event) => setForm((current) => ({ ...current, joiningDate: event.target.value }))} leftIcon={<CalendarDays className="h-4 w-4 text-slate-400" />} required />
        <Select label="Assigned Shift" value={form.shiftCode} onChange={(event) => setForm((current) => ({ ...current, shiftCode: event.target.value as typeof current.shiftCode }))} options={[{ value: 'MORNING', label: 'Morning (09:00 AM – 06:00 PM)' }, { value: 'EVENING', label: 'Evening (02:00 PM – 11:00 PM)' }, { value: 'NIGHT', label: 'Night (10:00 PM – 07:00 AM)' }]} required />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4"><BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><p className="text-xs font-bold text-slate-900">Department controls access</p><p className="mt-1 text-[11px] leading-4 text-slate-600">The matching employee role and permissions are assigned automatically from the selected department.</p></div></div>
        <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4"><KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-xs font-bold text-slate-900">Temporary password</p><p className="mt-1 text-[11px] leading-4 text-slate-600">Generated as QinStarEmp@ plus the last four mobile digits. It must be changed on first login.</p></div></div>
      </div>
    </Card>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Button variant="outline" onClick={() => router.push('/admin/employees')}>Cancel</Button>
      <Button disabled={submitting} onClick={() => void save()} leftIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}>{submitting ? 'Creating…' : 'Create Employee'}</Button>
    </div>
  </div>;
};
