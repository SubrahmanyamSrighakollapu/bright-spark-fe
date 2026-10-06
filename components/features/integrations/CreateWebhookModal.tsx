'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Provider, WebhookEventType, WebhookDirection, AuthType } from '@/types/domain';
import { Radio } from 'lucide-react';

export interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
  onCreateWebhook: (
    providerId: string,
    eventType: WebhookEventType,
    direction: WebhookDirection,
    endpointUrl: string,
    authType: AuthType,
    signatureKey: string
  ) => Promise<void>;
}

export const CreateWebhookModal: React.FC<CreateWebhookModalProps> = ({
  isOpen,
  onClose,
  providers,
  onCreateWebhook,
}) => {
  const [providerId, setProviderId] = useState(providers[0]?.id || 'PRV_HDFC_01');
  const [eventType, setEventType] = useState<WebhookEventType>('TRANSACTION_STATUS');
  const [direction, setDirection] = useState<WebhookDirection>('INBOUND');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [authType, setAuthType] = useState<AuthType>('API_KEY');
  const [signatureKey, setSignatureKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpointUrl.trim()) return;

    setIsSubmitting(true);
    await onCreateWebhook(providerId, eventType, direction, endpointUrl, authType, signatureKey);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Webhook Endpoint" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Select
          label="Partner Provider"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          options={providers.map((p) => ({ value: p.id, label: p.name }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Event Type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as WebhookEventType)}
            options={[
              { value: 'TRANSACTION_STATUS', label: 'Transaction Status' },
              { value: 'PAY_IN_CALLBACK', label: 'Pay-In Callback' },
              { value: 'PAY_OUT_CALLBACK', label: 'Pay-Out Callback' },
              { value: 'SETTLEMENT_STATUS', label: 'Settlement Status' },
              { value: 'REFUND_STATUS', label: 'Refund Status' },
              { value: 'CHARGEBACK', label: 'Chargeback Event' },
              { value: 'KYC_STATUS', label: 'KYC Verification' },
            ]}
          />

          <Select
            label="Direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as WebhookDirection)}
            options={[
              { value: 'INBOUND', label: 'Inbound (From Provider)' },
              { value: 'OUTBOUND', label: 'Outbound (To Retailer)' },
            ]}
          />
        </div>

        <Input
          label="Webhook Endpoint URL"
          placeholder="https://api.qinstarpay.com/v1/callbacks/..."
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          required
        />

        <Select
          label="Authentication Type"
          value={authType}
          onChange={(e) => setAuthType(e.target.value as AuthType)}
          options={[
            { value: 'API_KEY', label: 'API Key Header' },
            { value: 'BEARER_TOKEN', label: 'Bearer Token' },
            { value: 'CUSTOM', label: 'HMAC Signature' },
          ]}
        />

        <Input
          label="Signature Secret Key (Masked on save)"
          type="password"
          placeholder="whsec_••••••••"
          value={signatureKey}
          onChange={(e) => setSignatureKey(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<Radio className="w-3.5 h-3.5" />}>
            Create Webhook Config
          </Button>
        </div>
      </form>
    </Modal>
  );
};
