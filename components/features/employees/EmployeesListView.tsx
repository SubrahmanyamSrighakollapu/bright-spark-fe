'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { ActionKebabMenu, ActionMenuItem } from '@/components/ui/ActionKebabMenu';
import { ColumnDefinition } from '@/types/common';
import { PaginationState } from '@/types/domain';
import {
  employeeService,
  BackendEmployeeItem,
  EmployeeMetaDepartment,
  EmployeeMetaRole,
} from '@/services/employeeService';
import {
  UserCheck,
  Search,
  UserX,
  Edit2,
  KeyRound,
  UserPlus,
  Building2,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Headphones,
  TrendingUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export const EmployeesListView: React.FC = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();

  const [employees, setEmployees] = useState<BackendEmployeeItem[]>([]);
  const [departments, setDepartments] = useState<EmployeeMetaDepartment[]>([
    { code: 'OPERATIONS', label: 'Operations', description: 'Operations & Technical Support' },
    { code: 'ACCOUNTS', label: 'Accounts', description: 'Finance & Accounts Management' },
    { code: 'KYC', label: 'KYC', description: 'Verification & KYC Compliance' },
    { code: 'SALES', label: 'Sales', description: 'Business Development & Growth' },
  ]);
  const [roles, setRoles] = useState<EmployeeMetaRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit/View Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<BackendEmployeeItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editReason, setEditReason] = useState('Employee profile updated by administrator');
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 20, totalItems: 0, totalPages: 1 });
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchMetaAndEmployees = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const meta = await employeeService.getEmployeeMeta();
      if (meta.departments.length > 0) setDepartments(meta.departments);
      if (meta.roles.length > 0) setRoles(meta.roles);

      const res = await employeeService.getEmployees({
        search: searchTerm,
        departmentCode: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setEmployees(res.items);
      setPagination(res.pagination);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      const msg = error.message || 'Failed to load employee list from server';
      if (msg.includes('expired') || msg.includes('invalid') || error.statusCode === 401) {
        setAuthError('Your session has expired or token is invalid. Please log in again.');
      } else {
        toastError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, departmentFilter, statusFilter, pagination.page, pagination.pageSize, toastError]);

  useEffect(() => {
    fetchMetaAndEmployees();
  }, [fetchMetaAndEmployees]);

  const handleToggleStatus = async (emp: BackendEmployeeItem) => {
    const nextStatus = emp.employmentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setIsUpdatingStatus(true);
      const updated = await employeeService.updateEmployeeStatus(emp.id, nextStatus);
      setEmployees((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toastSuccess(`Employee ${emp.employeeCode} (${emp.fullName}) status updated to ${nextStatus}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update employee status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetPassword = async (emp: BackendEmployeeItem) => {
    try {
      const temporaryPassword = await employeeService.resetEmployeePassword(emp.id, 'Administrator initiated password reset');
      toastInfo(`Temporary password for ${emp.fullName}: ${temporaryPassword}`);
    } catch (error: unknown) {
      toastError(error instanceof Error ? error.message : 'Failed to reset employee password');
    }
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      setIsSaving(true);
      const updated = await employeeService.updateEmployee(selectedEmployee.id, {
        fullName: selectedEmployee.fullName,
        email: selectedEmployee.email,
        mobile: selectedEmployee.mobile,
        departmentCode: selectedEmployee.departmentCode,
        roleId: selectedEmployee.role.id,
        designation: selectedEmployee.designation,
        joiningDate: selectedEmployee.joiningDate,
        shiftCode: selectedEmployee.shiftCode,
        reason: editReason,
      });
      setEmployees((current) => current.map((employee) => employee.id === updated.id ? updated : employee));
      setSelectedEmployee(updated);
      setIsEditModalOpen(false);
      toastSuccess(`Employee ${updated.employeeCode} updated successfully.`);
    } catch (error: unknown) {
      toastError(error instanceof Error ? error.message : 'Failed to update employee');
    } finally {
      setIsSaving(false);
    }
  };

  // Department count calculations
  const deptCounts = {
    OPERATIONS: employees.filter((e) => e.departmentCode === 'OPERATIONS').length,
    ACCOUNTS: employees.filter((e) => e.departmentCode === 'ACCOUNTS').length,
    KYC: employees.filter((e) => e.departmentCode === 'KYC').length,
    SALES: employees.filter((e) => e.departmentCode === 'SALES').length,
    TOTAL: employees.length,
  };

  const departmentIcons: Record<string, React.ReactNode> = {
    OPERATIONS: <Headphones className="w-5 h-5 text-blue-600" />,
    ACCOUNTS: <CreditCard className="w-5 h-5 text-emerald-600" />,
    KYC: <ShieldCheck className="w-5 h-5 text-purple-600" />,
    SALES: <TrendingUp className="w-5 h-5 text-amber-600" />,
  };

  const departmentColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    OPERATIONS: { bg: 'bg-blue-50/70', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
    ACCOUNTS: { bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
    KYC: { bg: 'bg-purple-50/70', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
    SALES: { bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  };

  const columns: ColumnDefinition<BackendEmployeeItem>[] = [
    {
      key: 'employeeCode',
      header: 'Employee Code',
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-[#155EEF] text-xs block">{r.employeeCode}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Role: Employee</span>
        </div>
      ),
    },
    {
      key: 'fullName',
      header: 'Employee Name & Contact',
      render: (r) => (
        <div>
          <div className="font-semibold text-xs text-[#0F172A]">{r.fullName}</div>
          <div className="text-[11px] text-[#64748B]">
            {r.email} {r.mobile ? `• ${r.mobile}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'departmentCode',
      header: 'Department & Role',
      render: (r) => {
        const style = departmentColors[r.departmentCode] || { badge: 'bg-slate-100 text-slate-800' };
        return (
          <div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${style.badge} border border-slate-200/60 inline-block`}>
              {r.departmentCode}
            </span>
            <div className="text-[11px] font-medium text-[#334155] mt-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-slate-400" />
              {r.role.name}
            </div>
          </div>
        );
      },
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (r) => (
        <span className="text-xs text-slate-700 font-medium">
          {r.designation || r.role.name || 'Staff Member'}
        </span>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      render: (r) => (
        <div className="text-xs font-mono text-[#0F172A]">
          {r.joiningDate || new Date(r.createdAt).toISOString().split('T')[0]}
        </div>
      ),
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      align: 'center',
      render: (r) => {
        const isAct = r.employmentStatus === 'ACTIVE';
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
              isAct
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAct ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {r.employmentStatus}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#155EEF]" />
            Employee Management
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Directory of staff under the <strong className="text-slate-800 font-bold">Employee</strong> role category, organized into 4 departments: Operations, Accounts, KYC, and Sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetaAndEmployees}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Link href="/admin/employees/add">
            <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
              + Add Employee
            </Button>
          </Link>
        </div>
      </div>

      {authError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Authentication Required
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">{authError}</p>
          </div>
          <Link href="/login">
            <Button variant="primary" size="sm">
              Log In Now
            </Button>
          </Link>
        </div>
      )}

      {/* 4 Departments Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { code: 'OPERATIONS', name: 'Operations', label: 'Ops & Support', count: deptCounts.OPERATIONS },
          { code: 'ACCOUNTS', name: 'Accounts', label: 'Finance & Payouts', count: deptCounts.ACCOUNTS },
          { code: 'KYC', name: 'KYC', label: 'Verification & Onboarding', count: deptCounts.KYC },
          { code: 'SALES', name: 'Sales', label: 'Growth & Business', count: deptCounts.SALES },
        ].map((dept) => {
          const isSelected = departmentFilter === dept.code;
          const colors = departmentColors[dept.code];
          return (
            <div
              key={dept.code}
              onClick={() => setDepartmentFilter(isSelected ? 'ALL' : dept.code)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? `${colors.bg} ${colors.border} ring-2 ring-blue-500/20 shadow-sm`
                  : 'bg-white border-[#E5EAF1] hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 shadow-xs">
                  {departmentIcons[dept.code]}
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  {dept.code}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-[#0F172A]">{dept.count}</div>
                <div className="text-xs font-semibold text-slate-700">{dept.name} Dept</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{dept.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <Card noPadding>
        <div className="p-4 border-b border-[#E5EAF1] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by Name, Employee Code (EMP_OPS_001), or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All 4 Departments' },
                { value: 'OPERATIONS', label: 'Operations' },
                { value: 'ACCOUNTS', label: 'Accounts' },
                { value: 'KYC', label: 'KYC' },
                { value: 'SALES', label: 'Sales' },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Staff' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'SUSPENDED', label: 'Suspended' },
                { value: 'TERMINATED', label: 'Terminated' },
              ]}
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#155EEF]" />
              <span className="text-xs font-medium">Loading employee records...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No Employees Found</h3>
              <p className="text-xs text-slate-500 mt-1">No staff members match the selected department or search filter.</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={employees}
              keyExtractor={(r) => r.id}
              renderActions={(row) => {
                const isAct = row.employmentStatus === 'ACTIVE';
                const actionItems: ActionMenuItem[] = [
                  {
                    key: 'view-edit',
                    label: 'View / Edit Details',
                    icon: <Edit2 className="w-3.5 h-3.5" />,
                    onClick: () => {
                      setSelectedEmployee(row);
                      setIsEditModalOpen(true);
                    },
                  },
                  {
                    key: 'reset-pwd',
                    label: 'Reset Password',
                    icon: <KeyRound className="w-3.5 h-3.5 text-amber-600" />,
                    onClick: () => handleResetPassword(row),
                  },
                  {
                    key: 'toggle-status',
                    label: isAct ? 'Suspend Employee' : 'Activate Employee',
                    icon: isAct ? <UserX className="w-3.5 h-3.5 text-rose-600" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
                    onClick: () => handleToggleStatus(row),
                    danger: isAct,
                  },
                ];

                return <ActionKebabMenu items={actionItems} align="right" />;
              }}
            />
          )}
        </div>
        {pagination.totalPages > 1 && (
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems} pageSize={pagination.pageSize}
            onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
            onPageSizeChange={(pageSize) => setPagination((current) => ({ ...current, page: 1, pageSize }))} />
        )}
      </Card>

      {/* View / Edit Employee Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Employee Details (${selectedEmployee.employeeCode})`}
          size="md"
        >
          <div className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Full Name" value={selectedEmployee.fullName} onChange={(event) => setSelectedEmployee({ ...selectedEmployee, fullName: event.target.value })} />
              <Input label="Email" type="email" value={selectedEmployee.email} onChange={(event) => setSelectedEmployee({ ...selectedEmployee, email: event.target.value })} />
              <Input label="Mobile" value={selectedEmployee.mobile || ''} onChange={(event) => setSelectedEmployee({ ...selectedEmployee, mobile: event.target.value || null })} />
              <Input label="Designation" value={selectedEmployee.designation || ''} onChange={(event) => setSelectedEmployee({ ...selectedEmployee, designation: event.target.value || null })} />
              <Select label="Department" value={selectedEmployee.departmentCode} onChange={(event) => setSelectedEmployee({ ...selectedEmployee, departmentCode: event.target.value })}
                options={departments.map((department) => ({ value: department.code, label: department.label }))} />
              <Select label="Employee Role" value={String(selectedEmployee.role.id)} onChange={(event) => {
                const role = roles.find((item) => item.id === Number(event.target.value));
                if (role) setSelectedEmployee({ ...selectedEmployee, role: { id: role.id, code: role.code, name: role.name } });
              }} options={roles.map((role) => ({ value: String(role.id), label: role.name }))} />
              <Input label="Joining Date" type="date" value={selectedEmployee.joiningDate || ''} onChange={(event) => setSelectedEmployee({ ...selectedEmployee, joiningDate: event.target.value || null })} />
              <Select label="Shift" value={selectedEmployee.shiftCode} onChange={(event) => setSelectedEmployee({ ...selectedEmployee, shiftCode: event.target.value as BackendEmployeeItem['shiftCode'] })}
                options={[{ value: 'MORNING', label: 'Morning' }, { value: 'EVENING', label: 'Evening' }, { value: 'NIGHT', label: 'Night' }]} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Department</span>
                <span className="font-bold text-[#155EEF] text-xs">{selectedEmployee.departmentCode}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Role Name</span>
                <span className="font-bold text-slate-800 text-xs">{selectedEmployee.role.name}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Designation</span>
                <span className="font-medium text-slate-700 text-xs">{selectedEmployee.designation || selectedEmployee.role.name}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Employment Status</span>
                <span className={`font-bold text-xs ${selectedEmployee.employmentStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedEmployee.employmentStatus}
                </span>
              </div>
            </div>
            <Input label="Reason for change" value={editReason} onChange={(event) => setEditReason(event.target.value)} />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant={selectedEmployee.employmentStatus === 'ACTIVE' ? 'secondary' : 'primary'}
                disabled={isUpdatingStatus}
                onClick={async () => {
                  await handleToggleStatus(selectedEmployee);
                  setIsEditModalOpen(false);
                }}
              >
                {selectedEmployee.employmentStatus === 'ACTIVE' ? 'Suspend Employee' : 'Activate Employee'}
              </Button>
              <Button type="button" variant="primary" disabled={isSaving || editReason.trim().length < 3} onClick={handleSaveEmployee}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
