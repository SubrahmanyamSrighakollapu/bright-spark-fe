'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ColumnDefinition } from '@/types/common';
import { formatDateTime } from '@/utils/formatters';
import {
  Settings2,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Globe,
  Key,
  Lock,
  Copy,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  ExternalLink,
} from 'lucide-react';

export interface GatewayMapping {
  id: string;
  gatewayId: string;
  gatewayName: string;
  paymentMethod: string;
  merchantId: string;
  apiSecret: string;
  webhookUrl: string;
  environment: 'sandbox' | 'production';
  status: 'Active' | 'Inactive';
  configuredDate: string;
}

const INITIAL_MAPPINGS: GatewayMapping[] = [
  {
    id: 'map_1',
    gatewayId: 'gw_1',
    gatewayName: 'Razorpay PG',
    paymentMethod: 'Credit / Debit Card',
    merchantId: 'rzp_live_9A8X7B6C5D',
    apiSecret: '••••••••••••••••3X9',
    webhookUrl: 'https://api.qinstarpay.com/v1/webhooks/razorpay',
    environment: 'production',
    status: 'Active',
    configuredDate: '2026-08-10T12:00:00Z',
  },
  {
    id: 'map_2',
    gatewayId: 'gw_1',
    gatewayName: 'Razorpay PG',
    paymentMethod: 'UPI Direct / QR',
    merchantId: 'rzp_live_9A8X7B6C5D',
    apiSecret: '••••••••••••••••3X9',
    webhookUrl: 'https://api.qinstarpay.com/v1/webhooks/razorpay',
    environment: 'production',
    status: 'Active',
    configuredDate: '2026-08-10T12:15:00Z',
  },
  {
    id: 'map_3',
    gatewayId: 'gw_2',
    gatewayName: 'Cashfree Payments',
    paymentMethod: 'Net Banking / Bank Transfer',
    merchantId: 'CF_TEST_84739210',
    apiSecret: '••••••••••••••••8K1',
    webhookUrl: 'https://api.qinstarpay.com/v1/webhooks/cashfree',
    environment: 'sandbox',
    status: 'Active',
    configuredDate: '2026-08-15T15:20:00Z',
  },
  {
    id: 'map_4',
    gatewayId: 'gw_3',
    gatewayName: 'PhonePe PG Direct',
    paymentMethod: 'UPI Direct / QR',
    merchantId: 'PHONEPE_M23049182',
    apiSecret: '••••••••••••••••7P4',
    webhookUrl: 'https://api.qinstarpay.com/v1/webhooks/phonepe',
    environment: 'production',
    status: 'Active',
    configuredDate: '2026-09-02T10:30:00Z',
  },
];

const AVAILABLE_GATEWAYS = [
  { id: 'gw_1', name: 'Razorpay PG' },
  { id: 'gw_2', name: 'Cashfree Payments' },
  { id: 'gw_3', name: 'PhonePe PG Direct' },
  { id: 'gw_4', name: 'Paytm Payment Gateway' },
  { id: 'gw_5', name: 'Stripe India' },
];

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
  { id: 'upi', name: 'UPI Direct / QR', icon: QrCode },
  { id: 'netbanking', name: 'Net Banking / Bank Transfer', icon: Building2 },
  { id: 'wallet', name: 'Digital Wallets', icon: Wallet },
];

export const PaymentGatewaySetupView: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const [mappings, setMappings] = useState<GatewayMapping[]>(INITIAL_MAPPINGS);

  // Form State
  const [selectedGatewayId, setSelectedGatewayId] = useState('gw_1');
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['Credit / Debit Card', 'UPI Direct / QR']);
  const [merchantId, setMerchantId] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('production');

  // Modal State for editing existing mapping
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<GatewayMapping | null>(null);

  const selectedGateway = AVAILABLE_GATEWAYS.find((g) => g.id === selectedGatewayId);
  const autoWebhookUrl = selectedGateway
    ? `https://api.qinstarpay.com/v1/webhooks/${selectedGateway.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : 'https://api.qinstarpay.com/v1/webhooks/callback';

  const togglePaymentMethod = (methodName: string) => {
    if (selectedMethods.includes(methodName)) {
      setSelectedMethods(selectedMethods.filter((m) => m !== methodName));
    } else {
      setSelectedMethods([...selectedMethods, methodName]);
    }
  };

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantId.trim() || !apiSecret.trim()) {
      toastInfo('Please fill in Merchant ID and API Secret credentials.');
      return;
    }
    if (selectedMethods.length === 0) {
      toastInfo('Please select at least one payment method.');
      return;
    }

    const newMappings: GatewayMapping[] = selectedMethods.map((method, idx) => ({
      id: `map_${Date.now()}_${idx}`,
      gatewayId: selectedGatewayId,
      gatewayName: selectedGateway?.name || 'Gateway',
      paymentMethod: method,
      merchantId,
      apiSecret: apiSecret.slice(0, 4) + '••••••••' + apiSecret.slice(-3),
      webhookUrl: autoWebhookUrl,
      environment,
      status: 'Active',
      configuredDate: new Date().toISOString(),
    }));

    setMappings([...newMappings, ...mappings]);
    toastSuccess(`Mapped ${selectedMethods.length} method(s) to ${selectedGateway?.name} successfully!`);

    // Reset fields
    setMerchantId('');
    setApiSecret('');
  };

  const handleOpenEdit = (mapping: GatewayMapping) => {
    setEditingMapping(mapping);
    setMerchantId(mapping.merchantId);
    setApiSecret(mapping.apiSecret);
    setEnvironment(mapping.environment);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMapping) return;

    setMappings((prev) =>
      prev.map((m) =>
        m.id === editingMapping.id
          ? {
              ...m,
              merchantId,
              apiSecret,
              environment,
            }
          : m
      )
    );

    toastSuccess(`Credentials updated for ${editingMapping.gatewayName} (${editingMapping.paymentMethod})`);
    setIsEditModalOpen(false);
    setEditingMapping(null);
    setMerchantId('');
    setApiSecret('');
  };

  const handleDeleteMapping = (id: string, name: string, method: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
    toastInfo(`Removed ${method} mapping from ${name}.`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess('Webhook URL copied to clipboard!');
  };

  const columns: ColumnDefinition<GatewayMapping>[] = [
    {
      key: 'gatewayName',
      header: 'Gateway Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[#155EEF]" />
          <div>
            <div className="font-medium text-[#0F172A]">{row.gatewayName}</div>
            <div className="text-xs text-[#64748B]">ID: {row.gatewayId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      key: 'environment',
      header: 'Environment & Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
              row.environment === 'production'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {row.environment === 'production' ? 'Live / Prod' : 'Sandbox / Test'}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              row.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {row.status}
          </span>
        </div>
      ),
    },
    {
      key: 'configuredDate',
      header: 'Configured Date',
      render: (row) => <span className="text-xs text-[#64748B]">{formatDateTime(row.configuredDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 px-2 text-[#155EEF] hover:bg-[#F1F5F9]"
            title="Modify Credentials"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteMapping(row.id, row.gatewayName, row.paymentMethod)}
            className="h-8 px-2 text-rose-600 hover:bg-rose-50"
            title="Delete Mapping"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-[#155EEF]" />
            Payment Gateway Setup & Mapping
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Map digital payment methods to registered processing gateways and configure API merchant credentials.
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl">
        <form onSubmit={handleSaveSetup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gateway Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                1. Select Gateway <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedGatewayId}
                onChange={(e) => setSelectedGatewayId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              >
                {AVAILABLE_GATEWAYS.map((gw) => (
                  <option key={gw.id} value={gw.id}>
                    {gw.name} ({gw.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Environment Mode Toggle */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                2. Environment Mode <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-[#0F172A] cursor-pointer">
                  <input
                    type="radio"
                    name="envMode"
                    checked={environment === 'sandbox'}
                    onChange={() => setEnvironment('sandbox')}
                    className="w-4 h-4 text-[#155EEF] focus:ring-[#155EEF]"
                  />
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                    Sandbox / Test
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#0F172A] cursor-pointer">
                  <input
                    type="radio"
                    name="envMode"
                    checked={environment === 'production'}
                    onChange={() => setEnvironment('production')}
                    className="w-4 h-4 text-[#155EEF] focus:ring-[#155EEF]"
                  />
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    Production / Live
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-2">
              3. Select Payment Methods <span className="text-xs text-[#64748B] font-normal">(Multi-select enabled)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const isSelected = selectedMethods.includes(pm.name);
                return (
                  <div
                    key={pm.id}
                    onClick={() => togglePaymentMethod(pm.name)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#155EEF] bg-blue-50/50 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-md ${
                        isSelected ? 'bg-[#155EEF] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#0F172A] truncate">{pm.name}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#155EEF] rounded focus:ring-[#155EEF]"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Credentials Setup */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
              API Credentials Setup ({selectedGateway?.name})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  API Key / Merchant ID (merchantId / apiKey)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. rzp_live_9A8X7B6C5D"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  API Secret / Encryption Key (apiSecret)
                </label>
                <Input
                  type="password"
                  placeholder="Enter secret or salt key"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>
            </div>

            {/* Webhook Endpoint */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Auto-generated Webhook Callback Endpoint (IPN)
              </label>
              <div className="flex items-center gap-2">
                <Input type="text" value={autoWebhookUrl} readOnly className="bg-[#F1F5F9] text-[#475569] font-mono text-xs" />
                <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(autoWebhookUrl)}>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" className="px-6 bg-[#155EEF] hover:bg-[#124BCC]">
              <Plus className="w-4 h-4 mr-2" />
              Save Gateway Setup & Mapping
            </Button>
          </div>
        </form>
      </Card>

      {/* Mappings Table */}
      <Card className="p-6 bg-white border border-[#E5EAF1] shadow-xs rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A]">Active Gateway Mappings ({mappings.length})</h2>
        </div>
        <Table columns={columns} data={mappings} keyExtractor={(row) => row.id} />
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && editingMapping && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Modify Credentials - ${editingMapping.gatewayName}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Gateway & Method</label>
              <div className="p-2.5 rounded bg-[#F8FAFC] text-xs font-medium text-[#0F172A] border border-[#E2E8F0]">
                {editingMapping.gatewayName} — {editingMapping.paymentMethod}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">API Key / Merchant ID</label>
              <Input value={merchantId} onChange={(e) => setMerchantId(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">API Secret / Encryption Key</label>
              <Input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Environment Mode</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#0F172A]"
              >
                <option value="sandbox">Sandbox / Test</option>
                <option value="production">Production / Live</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-[#155EEF]">
                Update Credentials
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
