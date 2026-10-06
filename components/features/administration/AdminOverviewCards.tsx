'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { AdminSummary } from '@/types/domain';
import { Users, ShieldCheck, Gauge, Percent, Settings, Palette, Lock, ChevronRight, UserCheck, Key, SlidersHorizontal, ShoppingBag, Megaphone } from 'lucide-react';

export interface AdminOverviewCardsProps {
  summary: AdminSummary;
}

export const AdminOverviewCards: React.FC<AdminOverviewCardsProps> = ({ summary }) => {
  const quickLinks = [
    {
      title: 'Headline & Ticker Alerts',
      description: 'Configure continuous scrolling announcements, promotional margin offers, and security alerts for Retailers',
      href: '/admin/administration/headlines',
      icon: Megaphone,
      badge: 'Live Marquee',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Service Categories & Products',
      description: 'Configure applications (Grocery, Tourism, Fashion, etc.), product details, and preset collection prices',
      href: '/admin/administration/service-categories',
      icon: ShoppingBag,
      badge: 'Catalog Master',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      title: 'Admin User Management',
      description: 'Manage internal operational staff accounts, status, and role assignments',
      href: '/admin/administration/users',
      icon: Users,
      badge: `${summary.activeAdminUsers} Active Staff`,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Roles & Permissions',
      description: 'Configure RBAC system roles, custom role definitions, and granular module permissions',
      href: '/admin/administration/roles',
      icon: ShieldCheck,
      badge: `${summary.totalRoles} Roles Configured`,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Transaction Limits',
      description: 'Configure min/max, daily, and monthly transaction limit rules with scope precedence',
      href: '/admin/administration/limits',
      icon: Gauge,
      badge: `${summary.activeLimitRules} Limit Rules`,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Fee & Charge Master',
      description: 'Manage platform commercial fee structures, percentage/flat charges, and GST rates',
      href: '/admin/administration/fees',
      icon: Percent,
      badge: `${summary.activeFeeRules} Fee Rules`,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Platform Settings',
      description: 'Configure platform defaults, transaction timeouts, cut-off times, and notifications',
      href: '/admin/administration/settings',
      icon: Settings,
      badge: 'System Defaults',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
    },
    {
      title: 'Branding & Identity',
      description: 'Customize platform name, brand colors, login titles, and support contact details',
      href: '/admin/administration/branding',
      icon: Palette,
      badge: 'Live Preview',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Security Settings',
      description: 'Session timeout rules, password complexity policies, and MFA enforcement',
      href: '/admin/administration/security',
      icon: Lock,
      badge: 'Security Controls',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-[var(--primary)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Admin Staff</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-extrabold text-lg text-[var(--primary)]">
            {summary.totalAdminUsers}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">{summary.activeAdminUsers} Active Staff</span>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Super Admins</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-extrabold text-lg text-purple-900">
            {summary.superAdminsCount}
          </div>
          <span className="text-[10px] text-purple-600 block mt-0.5 font-mono font-semibold">Full Governance</span>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">System Roles</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-extrabold text-lg text-slate-900">
            {summary.totalRoles}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">{summary.systemRolesCount} Core • {summary.customRolesCount} Custom</span>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Permissions</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Key className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-extrabold text-lg text-blue-700">
            {summary.configuredPermissionsCount}
          </div>
          <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">Granular Tokens</span>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Limit Rules</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-extrabold text-lg text-emerald-700">
            {summary.activeLimitRules}
          </div>
          <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Precedence Active</span>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fee Rules</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono font-extrabold text-lg text-amber-700">
            {summary.activeFeeRules}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">GST Included</span>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Administration Workspaces & Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="p-5 hover:border-[var(--primary)] transition-all cursor-pointer group h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-lg ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                        <span>{item.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

