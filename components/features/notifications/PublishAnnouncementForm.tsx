'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Button, Checkbox, TextArea } from '@/components/ui';
import { NotificationSeverity } from '@/types/domain';
import { USER_ROLE_LABELS, UserRole } from '@/config/roles';
import { Megaphone, Users, Shield, Network, Globe } from 'lucide-react';
import { PublishAnnouncementInput } from '@/services/notificationService';

export type TargetKind = 'ALL' | 'ROLES' | 'USER_IDS' | 'HIERARCHY';

export interface PublishAnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: PublishAnnouncementInput) => Promise<void>;
}

const SEVERITY_OPTIONS: { value: NotificationSeverity; label: string }[] = [
  { value: 'INFO', label: 'Informational' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'CRITICAL', label: 'Critical / Urgent' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'None (General announcement)' },
  { value: 'TRANSACTION', label: 'Transaction' },
  { value: 'SETTLEMENT', label: 'Settlement Batch' },
  { value: 'CHARGEBACK', label: 'Chargeback Case' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'KYC', label: 'KYC Application' },
  { value: 'WALLET', label: 'Wallet / Balance' },
  { value: 'PROVIDER', label: 'Provider / Gateway' },
  { value: 'SYSTEM', label: 'System Platform' },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = (
  Object.keys(USER_ROLE_LABELS) as UserRole[]
).map((r) => ({ value: r, label: USER_ROLE_LABELS[r] }));

export const PublishAnnouncementForm: React.FC<PublishAnnouncementFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [targetKind, setTargetKind] = useState<TargetKind>('ALL');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [userIdsCsv, setUserIdsCsv] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [includeOwner, setIncludeOwner] = useState(true);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<NotificationSeverity>('INFO');
  const [actionRequired, setActionRequired] = useState(false);

  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [relatedEntity, setRelatedEntity] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setTargetKind('ALL');
    setSelectedRoles([]);
    setUserIdsCsv('');
    setOwnerUserId('');
    setIncludeOwner(true);
    setTitle('');
    setMessage('');
    setSeverity('INFO');
    setActionRequired(false);
    setEntityType('');
    setEntityId('');
    setRelatedEntity('');
    setExpiresAt('');
    setErrorMsg('');
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const validate = (): string | null => {
    if (!title.trim() || title.trim().length < 3) {
      return 'Title must be at least 3 characters.';
    }
    if (!message.trim() || message.trim().length < 10) {
      return 'Message must be at least 10 characters.';
    }
    if (targetKind === 'ROLES' && selectedRoles.length === 0) {
      return 'Please select at least one role for audience targeting.';
    }
    if (targetKind === 'USER_IDS') {
      const ids = userIdsCsv
        .split(/[\s,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length === 0) return 'Please enter at least one User ID.';
      if (ids.length > 5000) return 'Maximum 5000 User IDs allowed.';
    }
    if (targetKind === 'HIERARCHY' && !ownerUserId.trim()) {
      return 'Please enter the owner User ID for hierarchy targeting.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      let target: PublishAnnouncementInput['target'];
      switch (targetKind) {
        case 'ALL':
          target = { kind: 'ALL' };
          break;
        case 'ROLES':
          target = { kind: 'ROLES', roles: selectedRoles };
          break;
        case 'USER_IDS': {
          const ids = userIdsCsv
            .split(/[\s,;\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          target = { kind: 'USER_IDS', userIds: ids };
          break;
        }
        case 'HIERARCHY':
          target = { kind: 'HIERARCHY', ownerUserId: ownerUserId.trim(), includeOwner };
          break;
      }

      const input: PublishAnnouncementInput = {
        target,
        title: title.trim(),
        message: message.trim(),
        severity,
        actionRequired,
      };
      if (entityType) input.entityType = entityType as PublishAnnouncementInput['entityType'];
      if (entityId.trim()) input.entityId = entityId.trim();
      if (relatedEntity.trim()) input.relatedEntity = relatedEntity.trim();
      if (expiresAt) input.expiresAt = new Date(expiresAt).toISOString();

      await onSubmit(input);
      setIsSubmitting(false);
      resetForm();
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Failed to publish announcement.';
      setErrorMsg(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish System Announcement"
      description="Broadcast a targeted announcement to eligible platform users. Audience targeting respects user notification preferences for non-mandatory events."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Audience Targeting
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { k: 'ALL', label: 'All Users', icon: Globe, desc: 'Every active user' },
                { k: 'ROLES', label: 'By Role', icon: Shield, desc: 'Select roles' },
                { k: 'USER_IDS', label: 'User IDs', icon: Users, desc: 'List of IDs' },
                { k: 'HIERARCHY', label: 'Hierarchy', icon: Network, desc: 'Downline users' },
              ] as { k: TargetKind; label: string; icon: any; desc: string }[]
            ).map(({ k, label, icon: Icon, desc }) => (
              <button
                key={k}
                type="button"
                onClick={() => setTargetKind(k)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  targetKind === k
                    ? 'border-[var(--primary)] bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      targetKind === k ? 'text-[var(--primary)]' : 'text-slate-400'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wide ${
                      targetKind === k ? 'text-[var(--primary)]' : 'text-slate-600'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 leading-snug">{desc}</div>
              </button>
            ))}
          </div>

          {targetKind === 'ROLES' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-700">
                Select Roles ({selectedRoles.length} selected)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                {ROLE_OPTIONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedRoles.includes(r.value)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-[var(--primary)] w-3.5 h-3.5"
                      checked={selectedRoles.includes(r.value)}
                      onChange={() => toggleRole(r.value)}
                    />
                    <span className="text-[11px] text-slate-700 font-medium leading-tight">
                      {r.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {targetKind === 'USER_IDS' && (
            <TextArea
              label="Target User IDs"
              required
              rows={5}
              placeholder="Enter user IDs separated by commas, spaces, or newlines (max 5000).&#10;Example:&#10;usr_1a2b3c, usr_4d5e6f&#10;usr_7g8h9i"
              value={userIdsCsv}
              onChange={(e) => setUserIdsCsv(e.target.value)}
              helperText="Supports comma, space, semicolon, or newline-separated values."
            />
          )}

          {targetKind === 'HIERARCHY' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <Input
                label="Owner User ID (top of hierarchy)"
                required
                placeholder="e.g. usr_admin_001 or usr_md_mumbai01"
                value={ownerUserId}
                onChange={(e) => setOwnerUserId(e.target.value)}
                helperText="All users below this owner in the network hierarchy will be targeted."
              />
              <Checkbox
                label="Include the owner user themselves as a recipient"
                checked={includeOwner}
                onChange={(c) => setIncludeOwner(c)}
              />
            </div>
          )}
        </div>

        <div className="h-px bg-slate-200" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Announcement Title *"
              required
              placeholder="Short, descriptive headline (e.g. Scheduled Platform Maintenance)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={180}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Announcement Message *"
              required
              rows={4}
              placeholder="Full message body. Include dates, action items, links to resources, or relevant references."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={4000}
            />
          </div>
          <Select
            label="Severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as NotificationSeverity)}
            options={SEVERITY_OPTIONS}
          />
          <div className="flex items-end">
            <Checkbox
              label="Mark as Action Required (recipient must explicitly acknowledge)"
              checked={actionRequired}
              onChange={(c) => setActionRequired(c)}
            />
          </div>
        </div>

        <details className="group rounded-xl border border-slate-200 bg-slate-50/50">
          <summary className="cursor-pointer px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 flex items-center gap-2 select-none">
            <Megaphone className="w-3.5 h-3.5" />
            Advanced Context &amp; Expiration
          </summary>
          <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200/60 mt-1 pt-3">
            <Select
              label="Related Entity Type"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              options={ENTITY_TYPE_OPTIONS}
              helperText="If the announcement references a specific system object."
            />
            <Input
              label="Related Entity ID"
              placeholder="e.g. TXN_20260910_001 or STL_BATCH_442"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
            <Input
              label="Cross-Reference / Related Entity"
              placeholder="e.g. Ticket #INC-1042 or Provider: Razorpay"
              value={relatedEntity}
              onChange={(e) => setRelatedEntity(e.target.value)}
            />
            <Input
              label="Expires At (auto-dismiss after)"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              helperText="Leave empty for no expiration."
            />
          </div>
        </details>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 leading-relaxed text-[11px]">
          <strong>Delivery Note:</strong> Announcements respect per-user notification preferences.
          Users who have opted-out of non-mandatory in-app announcements will not receive this
          notification unless it is a platform-mandatory security event.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Megaphone className="w-3.5 h-3.5" />}
          >
            Publish Announcement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
