'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import {
  UserCheck,
  Search,
  Filter,
  UserX,
  Edit2,
  KeyRound,
  ShieldAlert,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

export interface EmployeeItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  contactNo: string;
  departmentId: string;
  departmentName: string;
  roleId: string;
  roleName: string;
  isViewOrder: boolean;
  isManageInventory: boolean;
  isPaymentApproval: boolean;
  isViewReports: boolean;
  joiningDate: string;
  shift: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
}

const MOCK_EMPLOYEES: EmployeeItem[] = [
  {
    id: 'emp_1',
    employeeCode: 'EMP001',
    fullName: 'Ananya Sharma',
    email: 'ananya.kyc@qinstarpay.com',
    contactNo: '9876543210',
    departmentId: 'KYC_ONBOARDING',
    departmentName: 'KYC & Onboarding',
    roleId: 'KYC_SPECIALIST',
    roleName: 'KYC Approval Specialist',
    isViewOrder: true,
    isManageInventory: false,
    isPaymentApproval: false,
    isViewReports: true,
    joiningDate: '2025-01-15',
    shift: 'Morning (09:00 - 18:00)',
    status: 'ACTIVE',
  },
  {
    id: 'emp_2',
    employeeCode: 'EMP002',
    fullName: 'Vikramaditya Singh',
    email: 'vikram.sales@qinstarpay.com',
    contactNo: '9812345678',
    departmentId: 'SALES',
    departmentName: 'Sales & Growth',
    roleId: 'SALES_LEAD',
    roleName: 'Sales Lead',
    isViewOrder: true,
    isManageInventory: true,
    isPaymentApproval: false,
    isViewReports: true,
    joiningDate: '2024-11-01',
    shift: 'Morning (09:00 - 18:00)',
    status: 'ACTIVE',
  },
  {
    id: 'emp_3',
    employeeCode: 'EMP003',
    fullName: 'Neha Gupta',
    email: 'neha.accounts@qinstarpay.com',
    contactNo: '9988776655',
    departmentId: 'ACCOUNTS',
    departmentName: 'Finance & Accounts',
    roleId: 'ACCOUNTANT',
    roleName: 'Staff Accountant',
    isViewOrder: true,
    isManageInventory: false,
    isPaymentApproval: true,
    isViewReports: true,
    joiningDate: '2025-03-10',
    shift: 'Evening (14:00 - 23:00)',
    status: 'ACTIVE',
  },
  {
    id: 'emp_4',
    employeeCode: 'EMP004',
    fullName: 'Rahul Verma',
    email: 'rahul.ops@qinstarpay.com',
    contactNo: '9765432109',
    departmentId: 'OPERATIONS',
    departmentName: 'Operations & Support',
    roleId: 'OPERATIONS_LEAD',
    roleName: 'Operations Lead',
    isViewOrder: true,
    isManageInventory: true,
    isPaymentApproval: false,
    isViewReports: true,
    joiningDate: '2025-02-01',
    shift: 'Morning (09:00 - 18:00)',
    status: 'ACTIVE',
  },
];

export const EmployeesListView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();

  const [employees, setEmployees] = useState<EmployeeItem[]>(MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Employee Modal State
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || emp.departmentId === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const nextStatus = emp.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          toastSuccess(`Employee ${emp.employeeCode} status updated to ${nextStatus}.`);
          return { ...emp, status: nextStatus };
        }
        return emp;
      })
    );
  };

  const handleResetPassword = (code: string, name: string) => {
    toastInfo(`Password reset link dispatched to ${name} (${code}).`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setEmployees((prev) => prev.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp)));
    setIsEditModalOpen(false);
    toastSuccess(`Permissions updated for ${editingEmployee.employeeCode}.`);
  };

  const columns: ColumnDefinition<EmployeeItem>[] = [
    {
      key: 'employeeCode',
      header: 'Employee Code',
      render: (r) => <span className="font-mono font-bold text-[#155EEF] text-xs">{r.employeeCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Employee Name & Contact',
      render: (r) => (
        <div>
          <div className="font-semibold text-xs text-[#0F172A]">{r.fullName}</div>
          <div className="text-[11px] text-[#64748B]">{r.email} • {r.contactNo}</div>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department & Role',
      render: (r) => (
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#155EEF] border border-blue-100">
            {r.departmentName}
          </span>
          <div className="text-[11px] font-medium text-[#334155] mt-1">{r.roleName}</div>
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Assigned Permissions',
      align: 'center',
      render: (r) => (
        <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] font-semibold">
          {r.isViewOrder && <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">Orders</span>}
          {r.isManageInventory && <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">Inventory</span>}
          {r.isPaymentApproval && <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">Payouts</span>}
          {r.isViewReports && <span className="px-1.5 py-0.2 rounded bg-[#F8FAFC] text-slate-600 border border-[#E5EAF1]">Reports</span>}
        </div>
      ),
    },
    {
      key: 'shift',
      header: 'Joining Date & Shift',
      render: (r) => (
        <div>
          <div className="text-xs font-mono text-[#0F172A]">{r.joiningDate}</div>
          <div className="text-[11px] text-[#64748B]">{r.shift}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
            r.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#155EEF]" />
            Employees List (EmployeesList)
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Operational directory of active staff across KYC & Onboarding, Sales Lead, Accountant, and Support Leads.
          </p>
        </div>

        <Link href="/admin/employees/add">
          <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
            + Add Employee
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <Card noPadding>
        <div className="p-4 border-b border-[#E5EAF1] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by Employee Name, Code (EMP001), or Email..."
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
                { value: 'ALL', label: 'All Departments' },
                { value: 'KYC_ONBOARDING', label: 'KYC & Onboarding' },
                { value: 'SALES', label: 'Sales & Growth' },
                { value: 'ACCOUNTS', label: 'Finance & Accounts' },
                { value: 'OPERATIONS', label: 'Operations & Support' },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Staff' },
                { value: 'SUSPENDED', label: 'Suspended' },
              ]}
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={filteredEmployees}
            keyExtractor={(r) => r.id}
            renderActions={(row) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEmployee({ ...row });
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 text-slate-600 hover:text-[#155EEF] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  title="Edit Employee Permissions"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleResetPassword(row.employeeCode, row.fullName)}
                  className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                  title="Reset Password"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(row.id)}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    row.status === 'ACTIVE'
                      ? 'text-emerald-600 hover:text-rose-600 hover:bg-rose-50'
                      : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={row.status === 'ACTIVE' ? 'Deactivate Employee' : 'Activate Employee'}
                >
                  {row.status === 'ACTIVE' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          />
        </div>
      </Card>

      {/* Edit Permissions Modal */}
      {editingEmployee && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Permissions & Shift (${editingEmployee.employeeCode})`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg">
                <span>View Orders</span>
                <input
                  type="checkbox"
                  checked={editingEmployee.isViewOrder}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, isViewOrder: e.target.checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg">
                <span>Manage Inventory</span>
                <input
                  type="checkbox"
                  checked={editingEmployee.isManageInventory}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, isManageInventory: e.target.checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg">
                <span>Approve Payments</span>
                <input
                  type="checkbox"
                  checked={editingEmployee.isPaymentApproval}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, isPaymentApproval: e.target.checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg">
                <span>View Reports</span>
                <input
                  type="checkbox"
                  checked={editingEmployee.isViewReports}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, isViewReports: e.target.checked })}
                />
              </div>
            </div>

            <Select
              label="Assigned Shift"
              value={editingEmployee.shift}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, shift: e.target.value })}
              options={[
                { value: 'Morning (09:00 - 18:00)', label: 'Morning Shift' },
                { value: 'Evening (14:00 - 23:00)', label: 'Evening Shift' },
                { value: 'Night (22:00 - 07:00)', label: 'Night Shift' },
              ]}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAF1]">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Employee Access
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
