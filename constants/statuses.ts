/**
 * Centralized status constants and UI metadata mappings for Qin Star Pay.
 */

export const TRANSACTION_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  REVERSED: 'REVERSED',
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUS;

export const KYC_STATUS = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING: 'PROCESSING',
  BLOCKED: 'BLOCKED',
  PENDING: 'PROCESSING',
  UNDER_REVIEW: 'PROCESSING',
} as const;

export type KYCStatus = 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'BLOCKED' | 'PENDING' | 'UNDER_REVIEW';

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
  SUSPECTED: 'SUSPECTED',
} as const;

export type UserStatus = keyof typeof USER_STATUS;

export const MERCHANT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const;

export type MerchantStatus = keyof typeof MERCHANT_STATUS;

export interface StatusMeta {
  label: string;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'purple';
  description?: string;
}

/**
 * Centralized mapping from generic status string to badge presentation configuration.
 */
export const STATUS_META: Record<string, StatusMeta> = {
  // Transaction & Wallet Statuses
  SUCCESS: { label: 'Success', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  PENDING: { label: 'Pending', variant: 'warning' },
  PROCESSING: { label: 'Processing', variant: 'info' },
  REVERSED: { label: 'Reversed', variant: 'purple' },

  // User & Entity Statuses
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'neutral' },
  BLOCKED: { label: 'Blocked', variant: 'danger' },
  SUSPECTED: { label: 'Suspected', variant: 'warning' },
  SUSPENDED: { label: 'Suspended', variant: 'danger' },

  // KYC Statuses
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  UNDER_REVIEW: { label: 'Processing', variant: 'info' },

  // Settlement & Reconciliation Statuses
  ELIGIBLE: { label: 'Eligible', variant: 'purple' },
  QUEUED: { label: 'Queued', variant: 'info' },
  SETTLED: { label: 'Settled', variant: 'success' },
  ON_HOLD: { label: 'On Hold', variant: 'warning' },
  MATCHED: { label: 'Matched', variant: 'success' },
  MISMATCHED: { label: 'Mismatched', variant: 'danger' },
  MANUAL_REVIEW: { label: 'Manual Review', variant: 'warning' },
  PARTIAL: { label: 'Partial', variant: 'warning' },

  // Chargeback & Dispute Statuses
  RAISED: { label: 'Raised', variant: 'warning' },
  EVIDENCE_REQUIRED: { label: 'Evidence Required', variant: 'warning' },
  RESPONDED: { label: 'Responded', variant: 'info' },
  WON: { label: 'Won', variant: 'success' },
  LOST: { label: 'Lost', variant: 'danger' },
  CLOSED: { label: 'Closed', variant: 'neutral' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'neutral' },

  // Invoice & Tax Statuses
  GENERATED: { label: 'Generated', variant: 'info' },
  ISSUED: { label: 'Issued', variant: 'purple' },
  PARTIALLY_PAID: { label: 'Partially Paid', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  OVERDUE: { label: 'Overdue', variant: 'danger' },
  APPLIED: { label: 'Applied', variant: 'success' },
  DEDUCTED: { label: 'Deducted', variant: 'info' },
  DEPOSITED: { label: 'Deposited', variant: 'purple' },
  CERTIFICATE_AVAILABLE: { label: 'Certificate Available', variant: 'success' },

  // Notification Statuses & Severities
  CRITICAL: { label: 'Critical', variant: 'danger' },
  UNREAD: { label: 'Unread', variant: 'warning' },
  READ: { label: 'Read', variant: 'neutral' },
  INFO: { label: 'Info', variant: 'info' },

  // Provider Health & Environments
  OPERATIONAL: { label: 'Operational', variant: 'success' },
  DEGRADED: { label: 'Degraded', variant: 'warning' },
  DOWN: { label: 'Down', variant: 'danger' },
  UNKNOWN: { label: 'Unknown', variant: 'neutral' },
  MAINTENANCE: { label: 'Maintenance', variant: 'warning' },
  PRODUCTION: { label: 'Production', variant: 'purple' },
  SANDBOX: { label: 'Sandbox', variant: 'info' },

  // Log & Callback Processing Statuses
  RECEIVED: { label: 'Received', variant: 'info' },
  PROCESSED: { label: 'Processed', variant: 'success' },
  DUPLICATE: { label: 'Duplicate', variant: 'warning' },
  IGNORED: { label: 'Ignored', variant: 'neutral' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  RETRYING: { label: 'Retrying', variant: 'warning' },
  EXHAUSTED: { label: 'Exhausted', variant: 'danger' },
  VERIFIED: { label: 'Verified', variant: 'success' },
  NOT_CONFIGURED: { label: 'Not Configured', variant: 'neutral' },
  LOCKED: { label: 'Locked', variant: 'danger' },
  EXPIRED: { label: 'Expired', variant: 'neutral' },

  // Generic System States
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'neutral' },
  DRAFT: { label: 'Draft', variant: 'neutral' },
};
