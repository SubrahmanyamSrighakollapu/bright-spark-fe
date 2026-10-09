import { TransactionStatus, KYCStatus, UserStatus } from '@/constants/statuses';
import { ApiResponse } from '@/types/common';
import { UserRole } from '@/config/roles';

export type { UserRole, KYCStatus, ApiResponse };

export type EntityType = 'MASTER' | 'DISTRIBUTOR' | 'RETAILER' | 'MERCHANT' | 'BACK_OFFICE';

export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'SUSPENDED';

export type LedgerDirection = 'CREDIT' | 'DEBIT';

export type LedgerEntryType =
  | 'PAY_IN'
  | 'PAY_OUT'
  | 'WALLET_CREDIT'
  | 'WALLET_DEBIT'
  | 'ADJUSTMENT'
  | 'CHARGE'
  | 'TAX'
  | 'HOLD'
  | 'RELEASE'
  | 'SETTLEMENT';

export type DebitRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';

export type SettlementStatus =
  | 'PENDING'
  | 'ELIGIBLE'
  | 'NOT_ELIGIBLE'
  | 'QUEUED'
  | 'PROCESSING'
  | 'SETTLED'
  | 'FAILED'
  | 'ON_HOLD'
  | 'REVERSED';

export type SettlementCycle = 'T+0' | 'T+1' | 'T+2' | 'MANUAL';

export type SettlementMode = 'BANK_TRANSFER' | 'IMPS' | 'NEFT' | 'RTGS' | 'UPI';

export type BatchStatus = 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

export type ReconciliationStatus = 'MATCHED' | 'MISMATCHED' | 'PENDING' | 'MANUAL_REVIEW';

export interface SettlementTimelineEvent {
  timestamp: string;
  event: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'INFO';
  description: string;
  actor?: string;
}

export interface IncludedTransactionSummary {
  transactionId: string;
  type: 'PAY_IN' | 'PAY_OUT';
  grossAmount: number;
  charges: number;
  netSettlementAmount: number;
  transactionDate: string;
  status: TransactionStatus;
}

export interface Settlement {
  settlementId: string;
  entityId: string;
  entityType: EntityType;
  entityName: string;
  entityCode: string;
  walletId: string;
  settlementMode: SettlementMode;
  settlementCycle: SettlementCycle;
  transactionCount: number;
  grossAmount: number;
  charges: number;
  tax: number;
  tds: number;
  adjustments: number;
  holdAmount: number;
  netSettlementAmount: number;
  status: SettlementStatus;
  provider: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  utr?: string;
  bankReference?: string;
  scheduledAt: string;
  processedAt?: string;
  settledAt?: string;
  failureCode?: string;
  failureReason?: string;
  timeline: SettlementTimelineEvent[];
  includedTransactions: IncludedTransactionSummary[];
  createdAt: string;
  updatedAt?: string;
}

export interface SettlementBatch {
  batchId: string;
  provider: string;
  settlementCount: number;
  grossAmount: number;
  netAmount: number;
  status: BatchStatus;
  settlementIds: string[];
  createdAt: string;
  processedAt?: string;
}

export interface SettlementReconciliation {
  reconciliationId: string;
  settlementId: string;
  entityId: string;
  entityName: string;
  internalAmount: number;
  providerAmount: number;
  difference: number;
  internalStatus: SettlementStatus;
  providerStatus: string;
  reconciliationStatus: ReconciliationStatus;
  utr?: string;
  bankReference?: string;
  reconciledBy?: string;
  reconciledAt?: string;
  remarks?: string;
}

export interface SettlementFilters {
  searchQuery?: string;
  dateRange?: string;
  settlementId?: string;
  entityType?: 'ALL' | EntityType;
  entityId?: string;
  status?: 'ALL' | SettlementStatus;
  settlementCycle?: 'ALL' | SettlementCycle;
  provider?: string;
  bankReference?: string;
  utr?: string;
}

export type DateRangePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'PREVIOUS_MONTH'
  | 'CUSTOM';

export interface ReportDateRange {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

export interface TransactionReportSummary {
  totalTransactions: number;
  totalAmount: number;
  successfulCount: number;
  successfulAmount: number;
  failedCount: number;
  failedAmount: number;
  pendingCount: number;
  pendingAmount: number;
  successRate: number;
}

export interface TransactionReportRecord {
  retailerName: string;
  retailerId: string;
  mobileNumber: string;

  transactionId: string;
  apiReferenceId: string;

  serviceType: string;
  status: TransactionStatus;
  responseMessage: string;

  requestedAt: string;
  updatedAt: string;

  transactionAmount: number;
  transactionCharges: number;
  gstAmount: number;
  totalAmount: number;

  settlementStatus: SettlementStatus;
  settlementDate?: string;

  paymentMode: string;

  rrnOrUtr?: string;
  bankReferenceNumber?: string;

  remarks?: string;
}

export interface LedgerReportSummary {
  totalCredits: number;
  totalDebits: number;
  netMovement: number;
  entryCount: number;
}

export interface SettlementReportSummary {
  totalSettlements: number;
  pendingCount: number;
  processingCount: number;
  settledCount: number;
  failedCount: number;
  grossSettlementAmount: number;
  netSettlementAmount: number;
}

export interface BalanceReportSummary {
  totalAvailable: number;
  totalLedger: number;
  totalHold: number;
  pendingSettlement: number;
}

export interface AccountSummary {
  entityId: string;
  entityName: string;
  entityType: EntityType;
  walletId: string;
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  closingBalance: number;
  holdBalance: number;
  pendingSettlement: number;
  transactionCount: number;
  settlementCount: number;
}

export interface ApiPerformanceMetric {
  provider: string;
  service: string;
  apiType: 'PAY_IN' | 'PAY_OUT' | 'STATUS_CHECK' | 'SETTLEMENT';
  totalRequests: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  avgResponseTimeMs: number;
  providerAvailability: number;
  lastFailureAt?: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

export interface ApiPerformanceSummary {
  totalRequests: number;
  successCount: number;
  failedCount: number;
  overallSuccessRate: number;
  avgResponseTimeMs: number;
  overallAvailability: number;
  providers: ApiPerformanceMetric[];
}

export interface ReportFilters {
  dateRange?: ReportDateRange;
  searchQuery?: string;
  entityType?: 'ALL' | EntityType;
  entityId?: string;
  distributorId?: string;
  retailerId?: string;
  merchantId?: string;
  type?: string;
  transactionType?: 'ALL' | 'PAY_IN' | 'PAY_OUT';
  paymentMode?: string;
  status?: string;
  provider?: string;
  service?: string;
  channel?: string;
  entryType?: string;
  direction?: string;
  settlementCycle?: string;
}

export interface ApiPerformanceFilters {
  dateRange?: ReportDateRange;
  provider?: string;
  apiType?: string;
}

export interface BatchFilters {
  searchQuery?: string;
  status?: 'ALL' | BatchStatus;
  provider?: string;
}

export interface ReconciliationFilters {
  searchQuery?: string;
  reconciliationStatus?: 'ALL' | ReconciliationStatus;
  utr?: string;
}

export type ChargebackStatus =
  | 'RAISED'
  | 'UNDER_REVIEW'
  | 'EVIDENCE_REQUIRED'
  | 'RESPONDED'
  | 'WON'
  | 'LOST'
  | 'CLOSED'
  | 'WITHDRAWN';

export type ChargebackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ChargebackReasonCode =
  | 'FRAUD'
  | 'SERVICE_NOT_RECEIVED'
  | 'DUPLICATE'
  | 'PROCESSING_ERROR'
  | 'UNRECOGNIZED_TRANSACTION';

export type EvidenceStatus = 'DRAFT' | 'READY' | 'SUBMITTED' | 'REJECTED';

export interface ChargebackEvidence {
  id: string;
  documentType: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: EvidenceStatus;
}

export interface ChargebackTimelineEvent {
  timestamp: string;
  event: string;
  actor: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'INFO';
}

export interface Chargeback {
  chargebackId: string;
  transactionId: string;
  orderId?: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  walletId: string;
  disputedAmount: number;
  currency: string;
  reasonCode: ChargebackReasonCode;
  reason: string;
  status: ChargebackStatus;
  priority: ChargebackPriority;
  filingDate: string;
  responseDueDate: string;
  assignedTo?: string;
  assignedAt?: string;
  provider: string;
  cardNetworkOrSource?: string;
  holdAmount: number;
  potentialLoss: number;
  recoveredAmount: number;
  finalLoss: number;
  evidence: ChargebackEvidence[];
  responseSummary?: string;
  merchantExplanation?: string;
  submittedBy?: string;
  submittedAt?: string;
  timeline: ChargebackTimelineEvent[];
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChargebackFilters {
  searchQuery?: string;
  dateRange?: string;
  status?: 'ALL' | ChargebackStatus;
  priority?: 'ALL' | ChargebackPriority;
  reasonCode?: 'ALL' | ChargebackReasonCode;
  provider?: string;
  assignedTo?: string;
}

export interface ChargebackSummary {
  openCases: number;
  underReview: number;
  evidenceRequired: number;
  responseDueSoon: number;
  wonCases: number;
  lostCases: number;
  totalDisputedAmount: number;
  totalLossAmount: number;
  winRate: number;
}

export type InvoiceStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type InvoiceType =
  | 'PLATFORM_FEE'
  | 'SERVICE_FEE'
  | 'SETTLEMENT_INVOICE'
  | 'ADJUSTMENT_INVOICE';

export type NoteType = 'CREDIT_NOTE' | 'DEBIT_NOTE';
export type NoteStatus = 'DRAFT' | 'ISSUED' | 'APPLIED' | 'CANCELLED';
export type TaxMode = 'INTRA_STATE' | 'INTER_STATE';
export type TdsStatus = 'PENDING' | 'DEDUCTED' | 'DEPOSITED' | 'CERTIFICATE_AVAILABLE';

export type ServiceCode =
  | 'PAY_IN'
  | 'PAY_OUT'
  | 'AEPS'
  | 'BBPS'
  | 'DMT'
  | 'RECHARGE'
  | 'DEFAULT';

export type InvoiceTemplateStyle =
  | 'STANDARD_TAX'
  | 'ITEMIZED_SERVICE'
  | 'PAYOUT_DISBURSAL'
  | 'BANKING_CORRESPONDENT'
  | 'UTILITY_BILL_RECEIPT'
  | 'REMITTANCE_COMMISSION'
  | 'COMPACT_RECEIPT';

export interface ServiceInvoiceConfig {
  id: string;
  serviceCode: ServiceCode;
  serviceName: string;
  templateStyle: InvoiceTemplateStyle;
  templateName: string;
  businessName: string;
  legalName: string;
  gstin: string;
  pan: string;
  sacCode: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  primaryColor: string;
  logoUrl?: string;
  termsAndConditions: string;
  footerDeclaration: string;
  isActive: boolean;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  referenceId?: string;
  quantity: number;
  rate: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
}

export interface InvoiceTimelineEvent {
  timestamp: string;
  event: string;
  actor: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'INFO';
}

export interface InvoicePayment {
  paymentId: string;
  paymentDate: string;
  utr: string;
  amount: number;
  remarks?: string;
  receivedBy: string;
}

export interface Invoice {
  id: string; // INV_20260903_001
  entityId: string;
  entityName: string;
  entityCode: string;
  entityType: EntityType;
  serviceCode?: ServiceCode;
  serviceConfig?: ServiceInvoiceConfig;
  gstin?: string;
  billingAddress?: string;
  invoiceType: InvoiceType;
  billingPeriod: string;
  lineItems: InvoiceLineItem[];
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  tdsApplicable: boolean;
  tdsRate: number;
  tdsAmount: number;
  grossAmount: number;
  netReceivable: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  transactionIds: string[];
  settlementIds: string[];
  ledgerEntryIds: string[];
  walletId: string;
  payments: InvoicePayment[];
  timeline: InvoiceTimelineEvent[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreditDebitNote {
  noteId: string; // CDN_20260903_001
  invoiceId: string;
  entityId: string;
  entityName: string;
  entityCode: string;
  entityType: EntityType;
  noteType: NoteType;
  reason: string;
  adjustmentAmount: number;
  gstAdjustment: number;
  totalAdjustment: number;
  status: NoteStatus;
  remarks?: string;
  createdBy: string;
  createdAt: string;
}

export interface TaxRecord {
  period: string; // e.g. 2026-09
  taxableRevenue: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstAdjustments: number;
  netGstLiability: number;
  status: 'FILED' | 'PENDING_FILING' | 'DRAFT';
}

export interface TdsRecord {
  tdsId: string;
  invoiceId: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  panMasked: string;
  taxableAmount: number;
  tdsRate: number;
  tdsAmount: number;
  status: TdsStatus;
  deductionDate: string;
  certificateRef?: string;
}

export interface InvoiceFilters {
  searchQuery?: string;
  entityType?: 'ALL' | EntityType;
  invoiceType?: 'ALL' | InvoiceType;
  status?: 'ALL' | InvoiceStatus;
  dateRange?: ReportDateRange;
}

export interface InvoiceSummary {
  totalInvoiced: number;
  outstandingAmount: number;
  paidAmount: number;
  gstCollected: number;
  tdsDeducted: number;
  overdueCount: number;
  totalInvoices: number;
}

export type NotificationCategory =
  | 'TRANSACTION'
  | 'KYC'
  | 'WALLET'
  | 'SETTLEMENT'
  | 'RECONCILIATION'
  | 'CHARGEBACK'
  | 'INVOICE'
  | 'TAX'
  | 'PROVIDER'
  | 'SECURITY'
  | 'SYSTEM';

export type NotificationType =
  | 'TRANSACTION_FAILED'
  | 'HIGH_VALUE_TRANSACTION'
  | 'PAYOUT_FAILED'
  | 'SETTLEMENT_COMPLETED'
  | 'SETTLEMENT_FAILED'
  | 'RECONCILIATION_MISMATCH'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'KYC_EXPIRING'
  | 'CHARGEBACK_RECEIVED'
  | 'CHARGEBACK_EVIDENCE_REQUIRED'
  | 'CHARGEBACK_DEADLINE_APPROACHING'
  | 'CHARGEBACK_WON'
  | 'CHARGEBACK_LOST'
  | 'INVOICE_GENERATED'
  | 'INVOICE_OVERDUE'
  | 'INVOICE_PAID'
  | 'WALLET_BALANCE_LOW'
  | 'WALLET_HOLD_APPLIED'
  | 'WALLET_HOLD_RELEASED'
  | 'PROVIDER_DEGRADED'
  | 'SECURITY_ALERT';

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
export type NotificationStatus = 'UNREAD' | 'READ';

export interface Notification {
  id: string; // e.g. NTF_20260903_001
  category: NotificationCategory;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entityType?: 'TRANSACTION' | 'SETTLEMENT' | 'CHARGEBACK' | 'INVOICE' | 'KYC' | 'WALLET' | 'PROVIDER' | 'SYSTEM';
  entityId?: string;
  relatedEntity?: string;
  sourceModule: string;
  status: NotificationStatus;
  actionRequired: boolean;
  createdAt: string;
  readAt?: string | null;
  metadata?: Record<string, string | number | boolean>;
}

export interface NotificationFilters {
  searchQuery?: string;
  category?: 'ALL' | NotificationCategory;
  severity?: 'ALL' | NotificationSeverity;
  status?: 'ALL' | NotificationStatus;
  dateRange?: ReportDateRange;
}

export interface NotificationSummary {
  totalNotifications: number;
  unreadCount: number;
  criticalCount: number;
  actionRequiredCount: number;
  todayCount: number;
  readCount: number;
}

export interface NotificationPreferenceItem {
  type: NotificationType;
  label: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  inAppMandatory: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export type ProviderType = 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT' | 'MULTI_SERVICE';
export type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type ProviderHealth = 'OPERATIONAL' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
export type AuthType = 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH' | 'OAUTH' | 'CUSTOM';
export type IntegrationEnvironment = 'SANDBOX' | 'PRODUCTION' | 'DEMO';
export type TransactionMode = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'BANK_TRANSFER' | 'WEB' | 'API';
export type IntegrationServiceType =
  | 'PAY_IN'
  | 'PAY_OUT'
  | 'SETTLEMENT'
  | 'STATUS_CHECK'
  | 'REFUND'
  | 'ACCOUNT_VALIDATION'
  | 'BENEFICIARY_VALIDATION';

export type WebhookDirection = 'INBOUND' | 'OUTBOUND';
export type WebhookEventType =
  | 'TRANSACTION_STATUS'
  | 'PAY_IN_CALLBACK'
  | 'PAY_OUT_CALLBACK'
  | 'SETTLEMENT_STATUS'
  | 'REFUND_STATUS'
  | 'CHARGEBACK'
  | 'KYC_STATUS';

export interface Provider {
  id: string; // e.g. PRV_HDFC_01
  code: string;
  name: string;
  providerType: ProviderType;
  environment: IntegrationEnvironment;
  status: ProviderStatus;
  supportedServices: IntegrationServiceType[];
  supportedModes: TransactionMode[];
  baseUrl: string;
  authType: AuthType;
  timeout: number; // in ms
  priority: number; // 1 = highest
  healthStatus: ProviderHealth;
  successRate: number; // e.g. 99.4
  avgResponseTime: number; // in ms e.g. 240
  lastCheckedAt: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiConfiguration {
  id: string; // API_CFG_001
  providerId: string;
  providerName: string;
  environment: IntegrationEnvironment;
  baseUrl: string;
  authType: AuthType;
  apiKeyMasked?: string;
  clientSecretMasked?: string;
  bearerTokenMasked?: string;
  usernameMasked?: string;
  passwordMasked?: string;
  timeout: number;
  retryCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
}

export interface ServiceConfiguration {
  id: string; // SVC_CFG_001
  service: IntegrationServiceType;
  providerId: string;
  providerName: string;
  supportedModes: TransactionMode[];
  minAmount: number;
  maxAmount: number;
  status: 'ACTIVE' | 'INACTIVE';
  priority: number;
  updatedAt: string;
}

export interface RoutingRule {
  id: string; // ROUTE_001
  service: IntegrationServiceType;
  transactionType: 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT';
  primaryProviderId: string;
  primaryProviderName: string;
  secondaryProviderId: string;
  secondaryProviderName: string;
  minAmount: number;
  maxAmount: number;
  mode: TransactionMode | 'ALL';
  entityType: EntityType | 'ALL';
  priority: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface WebhookConfiguration {
  id: string; // WH_20260903_001
  providerId: string;
  providerName: string;
  eventType: WebhookEventType;
  direction: WebhookDirection;
  endpointUrl: string;
  authType: AuthType;
  signatureKeyMasked: string;
  retryCount: number;
  timeout: number;
  status: 'ACTIVE' | 'INACTIVE';
  lastReceivedAt?: string;
  failureCount: number;
  updatedAt: string;
}

export interface ProviderSummary {
  totalProviders: number;
  activeCount: number;
  degradedCount: number;
  downCount: number;
  avgSuccessRate: number;
}

export interface RoutingSimulationResult {
  matchedRuleId: string;
  selectedProviderId: string;
  selectedProviderName: string;
  fallbackProviderId: string;
  fallbackProviderName: string;
  reason: string;
  simulatedAt: string;
}

export interface TestConnectionResult {
  success: boolean;
  httpStatus: number;
  responseTimeMs: number;
  message: string;
  timestamp: string;
}

export interface ProviderFilters {
  searchQuery?: string;
  providerType?: 'ALL' | ProviderType;
  status?: 'ALL' | ProviderStatus;
  environment?: 'ALL' | IntegrationEnvironment;
  health?: 'ALL' | ProviderHealth;
}

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface BaseLog {
  id: string; // e.g. API_20260903_001
  traceId: string; // e.g. TRACE_20260903_000123
  correlationId: string; // e.g. CORR_20260903_000456
  sourceModule: string;
  severity: LogSeverity;
  status: string;
  createdAt: string;
  entityType?: EntityType | 'TRANSACTION' | 'SETTLEMENT' | 'CHARGEBACK' | 'INVOICE' | 'PROVIDER' | 'USER' | 'SYSTEM';
  entityId?: string;
}

export interface ApiLog extends BaseLog {
  providerId: string;
  providerName: string;
  service: IntegrationServiceType;
  apiType: 'PAY_IN' | 'PAY_OUT' | 'STATUS_CHECK' | 'SETTLEMENT' | 'REFUND' | 'ACCOUNT_VALIDATION' | 'BENEFICIARY_VALIDATION' | 'WEBHOOK' | 'CALLBACK';
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  httpStatus: number;
  resultStatus: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  responseTimeMs: number;
  requestReference: string;
  requestHeaders?: Record<string, string>;
  requestPayloadSanitized?: Record<string, unknown>;
  responseHeaders?: Record<string, string>;
  responsePayloadSanitized?: Record<string, unknown>;
  internalErrorCode?: string;
  providerErrorCode?: string;
  errorMessage?: string;
  retryCount: number;
}

export interface ClientLog extends BaseLog {
  clientEntity: string;
  clientId: string;
  environment: IntegrationEnvironment;
  endpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requestReference: string;
  httpStatus: number;
  responseTimeMs: number;
  ipAddress: string;
  userAgent: string;
}

export interface CallbackLog extends BaseLog {
  providerId: string;
  providerName: string;
  eventType: WebhookEventType;
  direction: WebhookDirection;
  transactionId?: string;
  settlementId?: string;
  providerReference: string;
  processingStatus: 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'DUPLICATE' | 'IGNORED';
  httpStatus: number;
  signatureVerification: 'VERIFIED' | 'FAILED' | 'NOT_CONFIGURED';
  isDuplicate: boolean;
  originalCallbackId?: string;
  retryCount: number;
  payloadSanitized?: Record<string, unknown>;
}

export interface WebhookAttempt {
  attemptNumber: number;
  timestamp: string;
  httpStatus: number;
  status: 'DELIVERED' | 'FAILED';
  errorMessage?: string;
}

export interface WebhookLog extends BaseLog {
  configurationId: string;
  providerName: string;
  direction: WebhookDirection;
  eventType: WebhookEventType;
  endpointUrl: string;
  httpStatus: number;
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'EXHAUSTED';
  attemptCount: number;
  lastAttemptAt: string;
  attemptHistory: WebhookAttempt[];
  payloadSanitized?: Record<string, unknown>;
}

export interface LoginLog extends BaseLog {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  loginTime: string;
  logoutTime?: string | null;
  sessionDuration?: string;
  ipAddress: string;
  browser: string;
  os: string;
  device: string;
  authMethod: 'PASSWORD' | 'MFA_TOTP' | 'SSO' | 'API_KEY';
  status: 'SUCCESS' | 'FAILED' | 'LOCKED' | 'EXPIRED';
  failureReason?: string;
  securityFlags?: Array<'MULTIPLE_FAILED_ATTEMPTS' | 'NEW_DEVICE' | 'UNUSUAL_IP' | 'ACCOUNT_LOCKED'>;
}

export interface ActivityLog extends BaseLog {
  action: string; // e.g. WALLET_CREDIT, SETTLEMENT_PROCESS, CHARGEBACK_RESOLVE
  module: string; // e.g. WALLET, SETTLEMENT, CHARGEBACK, INVOICE, INTEGRATIONS
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  description: string;
  previousValue?: string | Record<string, unknown>;
  newValue?: string | Record<string, unknown>;
  reason?: string;
  ipAddress: string;
}

export interface TraceSearchResult {
  referenceId: string;
  traceId: string;
  correlationId: string;
  transaction?: Transaction;
  apiLogs: ApiLog[];
  callbacks: CallbackLog[];
  webhooks: WebhookLog[];
  activityLogs: ActivityLog[];
}

export interface ApiLogSummary {
  totalRequests: number;
  successCount: number;
  failedCount: number;
  avgResponseTimeMs: number;
  timeoutCount: number;
  criticalErrors: number;
}

export interface CallbackLogSummary {
  totalReceived: number;
  processedCount: number;
  failedCount: number;
  duplicateCount: number;
  pendingCount: number;
}

export interface WebhookLogSummary {
  totalWebhooks: number;
  deliveredCount: number;
  failedCount: number;
  pendingRetryCount: number;
  exhaustedCount: number;
}

export interface WalletAccount {
  walletId: string;
  entityId: string;
  entityType: EntityType;
  entityName: string;
  entityCode: string;
  parentName?: string;
  availableBalance: number;
  ledgerBalance: number;
  holdBalance: number;
  pendingSettlement: number;
  currency: string;
  status: WalletStatus;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  entityId: string;
  entityType: EntityType;
  entityName: string;
  transactionId?: string;
  referenceId?: string;
  entryType: LedgerEntryType;
  openingBalance: number;
  amount: number;
  closingBalance: number;
  direction: LedgerDirection;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface DebitRequest {
  id: string;
  entityId: string;
  entityType: EntityType;
  entityName: string;
  walletId: string;
  amount: number;
  reason: string;
  status: DebitRequestStatus;
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  processedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  remarks?: string;
}

export interface BulkAdjustmentRow {
  entityId: string;
  entityName: string;
  operationType: 'CREDIT' | 'DEBIT';
  amount: number;
  reference: string;
  reason: string;
  isValid: boolean;
  validationError?: string;
}

export interface WalletFilters {
  searchQuery?: string;
  entityType?: 'ALL' | EntityType;
  status?: 'ALL' | WalletStatus;
  distributorId?: string;
  retailerId?: string;
}

export interface LedgerFilters {
  searchQuery?: string;
  dateRange?: string;
  entityType?: 'ALL' | EntityType;
  direction?: 'ALL' | LedgerDirection;
  entryType?: 'ALL' | LedgerEntryType;
  transactionId?: string;
  referenceId?: string;
}

export interface DashboardSummary {
  availableBalance: number;
  totalPayIn: number;
  totalPayOut: number;
  successfulTransactions: number;
  successRate: number;
  pendingSettlements: number;
  activeMerchants: number;
  activeDistributors: number;
}

export interface TransactionTimelineEvent {
  timestamp: string;
  event: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'INFO';
}

export interface CallbackSummaryInfo {
  callbackReceived: boolean;
  receivedAt?: string;
  processingStatus?: string;
  retryCount?: number;
}

export interface CommissionSnapshot {
  retailerPlanId?: string;
  retailerPlanCode?: string;
  retailerPlanName?: string;
  retailerPlanReference?: string;
  retailerCommissionType?: 'PERCENTAGE' | 'FLAT';
  retailerCommissionRate?: string | number;
  retailerCommissionAmount?: number;

  distributorId?: string;
  distributorName?: string;
  distributorCommissionRate?: string | number;
  distributorCommissionAmount?: number;

  masterDistributorId?: string;
  masterDistributorName?: string;
  masterDistributorCommissionRate?: string | number;
  masterDistributorCommissionAmount?: number;

  grossCommercialRevenue?: number;
  totalHierarchyCommission?: number;
  platformRetainedRevenue?: number;
}

export interface PayInAccountingSnapshot {
  principalAmount: number;
  customerCharge: number;
  gstAmount: number;
  customerTotal: number;
  grossCommercialRevenue: number;
  retailerCommissionAmount: number;
  distributorCommissionAmount: number;
  masterDistributorCommissionAmount: number;
  totalHierarchyCommission: number;
  platformRetainedRevenue: number;
  retailerPrincipalWalletCredit: number;
  retailerCommissionWalletCredit: number;
  retailerWalletCredit: number;
  taxLiability: number;
  settlementPrincipal: number;
  grossSettlementReceivable: number;
  netSettlementAmount: number;
}

export interface PayOutAccountingSnapshot {
  principalAmount: number;
  customerCharge: number;
  gstAmount: number;
  grossCommercialRevenue: number;
  retailerCommissionAmount: number;
  distributorCommissionAmount: number;
  masterDistributorCommissionAmount: number;
  totalHierarchyCommission: number;
  platformRetainedRevenue: number;
  walletPrincipalDebit: number;
  walletFeeDebit: number;
  walletTaxDebit: number;
  totalWalletDebit: number;
  walletCommissionCredit: number;
  netWalletMovement: number;
  taxLiability: number;
  beneficiaryTransferAmount: number;
  settlementAmount: number;
}

export interface Transaction {
  id: string;
  transactionRef: string;
  orderId?: string;
  referenceId?: string;
  utr?: string;
  merchantName: string;
  distributorName?: string;
  distributorId?: string;
  retailerName?: string;
  retailerId?: string;
  masterDistributorId?: string;

  type: 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT';
  amount: number;
  fee: number;
  gst?: number;
  tds?: number;
  netAmount: number;
  status: TransactionStatus;
  paymentMode: 'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'CARD';
  provider?: string;
  service?: string;
  channel?: 'Web' | 'Mobile App' | 'API';
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  beneficiaryName?: string;
  beneficiaryAccount?: string;
  beneficiaryIfsc?: string;
  beneficiaryBank?: string;
  accountNumberMasked?: string;
  failureCode?: string;
  failureReason?: string;
  timeline?: TransactionTimelineEvent[];
  providerResponse?: Record<string, unknown>;
  callbackSummary?: CallbackSummaryInfo;
  commissionSnapshot?: CommissionSnapshot;
  accountingSnapshot?: PayInAccountingSnapshot;
  payOutAccountingSnapshot?: PayOutAccountingSnapshot;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionFilters {
  searchQuery?: string;
  dateRange?: string;
  transactionRef?: string;
  orderId?: string;
  utr?: string;
  type?: 'ALL' | 'PAY_IN' | 'PAY_OUT';
  status?: string;
  merchantId?: string;
  distributorId?: string;
  retailerId?: string;
  providerId?: string;
  serviceId?: string;
  channel?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PayoutRequestInput {
  merchantId: string;
  distributorId?: string;
  retailerId?: string;
  beneficiaryName: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  mobileNumber?: string;
  upiId?: string;
  paymentMode: 'IMPS' | 'NEFT' | 'RTGS' | 'UPI';
  amount: number;
  remarks?: string;
  orderReference?: string;
}

export interface PayInRequestInput {
  merchantId: string;
  distributorId?: string;
  retailerId?: string;
  amount: number;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  orderId?: string;
  service?: string;
  remarks?: string;
}

export interface PayoutChargeBreakdown {
  amount: number;
  fee: number;
  gst: number;
  tds: number;
  totalDebit: number;
}

export interface BusinessEntity {
  id: string;
  code: string;
  name: string;
  type: EntityType;
  parentId?: string;
  parentName?: string;
  parentType?: EntityType;
  email: string;
  mobile: string;
  status: UserStatus;
  kycStatus: KYCStatus;
  businessName: string;
  businessType: string;
  panNumberMasked?: string;
  gstNumber?: string;
  accountNumberMasked?: string;
  bankName?: string;
  ifscCode?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  role?: string;
  lastLoginAt?: string;
  blockedAt?: string;
  blockedBy?: string;
  blockedReason?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EntityMapping {
  id: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  mappedParentId: string;
  mappedParentName: string;
  parentType: EntityType;
  effectiveDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface KYCDocument {
  id: string;
  type: 'PAN' | 'AADHAAR' | 'GST_CERTIFICATE' | 'BUSINESS_PROOF' | 'CANCELLED_CHEQUE';
  title: string;
  documentNumberMasked: string;
  fileUrl?: string;
  uploadedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export interface KYCReviewTimeline {
  timestamp: string;
  event: string;
  user: string;
  remarks?: string;
}

export interface KYCApplication {
  id: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  businessName: string;
  businessType: string;
  panNumberMasked: string;
  gstNumber?: string;
  status: KYCStatus;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  remarks?: string;
  documents: KYCDocument[];
  timeline: KYCReviewTimeline[];
}

export interface MerchantOnboardingInput {
  businessName: string;
  businessType: string;
  panNumber: string;
  gstNumber?: string;
  businessCategory: string;
  contactName: string;
  mobile: string;
  email: string;
  altMobile?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  distributorId?: string;
  retailerId?: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  documents?: KYCDocument[];
}

export interface MerchantOnboardingApplication {
  id: string;
  businessName: string;
  contactName: string;
  mobile: string;
  email: string;
  mappedParentName: string;
  submittedAt: string;
  kycStatus: KYCStatus;
  onboardingStatus: 'DRAFT' | 'SUBMITTED' | 'KYC_PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  documents?: KYCDocument[];
}

export interface UserFilters {
  searchQuery?: string;
  status?: string;
  kycStatus?: string;
  businessType?: string;
  distributorId?: string;
  retailerId?: string;
  role?: string;
  dateRange?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OPERATIONS' | 'FINANCE_MANAGER' | 'SUPPORT';
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
}

export interface KYCRecord {
  id: string;
  merchantName: string;
  businessType: string;
  panNumber: string;
  gstNumber?: string;
  status: KYCStatus;
  submittedAt: string;
  reviewedBy?: string;
}

export interface WalletBalance {
  merchantId: string;
  merchantName: string;
  availableBalance: number;
  lienAmount: number;
  unsettledAmount: number;
  currency: string;
  lastUpdated: string;
}

export interface LogEntry {
  id: string;
  type: 'API' | 'WEBHOOK' | 'CALLBACK' | 'LOGIN' | 'ACTIVITY';
  action: string;
  userOrService: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * PHASE 14 ADMINISTRATION DOMAIN TYPES
 */

export interface AdminUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  roleIds: string[];
  roleNames: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED';
  department: string;
  lastLoginAt?: string | null;
  createdAt: string;
  createdBy: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  isSystemRole: boolean;
  category?: 'SYSTEM' | 'NETWORK' | 'EMPLOYEE';
  assignedUserCount: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionLimit {
  id: string;
  scopeType: 'GLOBAL' | 'DISTRIBUTOR' | 'MERCHANT' | 'RETAILER';
  scopeId?: string;
  scopeName?: string;
  transactionType: 'PAY_IN' | 'PAY_OUT' | 'ALL';
  paymentMode: string;
  minPerTransaction: number;
  maxPerTransaction: number;
  dailyAmountLimit: number;
  dailyCountLimit: number;
  monthlyAmountLimit: number;
  monthlyCountLimit: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISABLED';
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface FeeRule {
  id: string;
  code: string;
  name: string;
  transactionType: 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT';
  entityType: EntityType | 'ALL';
  providerId?: string;
  calculationType: 'FLAT' | 'PERCENTAGE';
  value: number;
  minimumFee: number;
  maximumFee: number;
  gstApplicable: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  effectiveFrom: string;
}

export interface TaxConfigurationItem {
  id: string;
  taxType: 'GST' | 'TDS';
  code: string;
  ratePercentage: number;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface PaymentMasterItem {
  id: string;
  category: 'PAYMENT_MODE' | 'TRANSACTION_TYPE' | 'SETTLEMENT_MODE';
  code: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
}

export interface ReasonCode {
  id: string;
  code: string;
  category:
    | 'TRANSACTION_FAILURE'
    | 'KYC_REJECTION'
    | 'WALLET_ADJUSTMENT'
    | 'SETTLEMENT_FAILURE'
    | 'CHARGEBACK'
    | 'REFUND'
    | 'ACCOUNT_BLOCK';
  label: string;
  description: string;
  requiresRemarks: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BrandingConfig {
  platformName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryBrandColor: string;
  loginPageTitle: string;
  supportText: string;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  accountLockDurationMinutes: number;
  passwordExpiryDays: number;
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  mfaRequired: boolean;
}

export interface PlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    defaultCurrency: string;
    timezone: string;
    dateFormat: string;
    financialYearStartMonth: number;
  };
  transaction: {
    defaultTimeoutMs: number;
    maxRetryCount: number;
    statusCheckIntervalSeconds: number;
    transactionPrefix: string;
    orderPrefix: string;
  };
  settlement: {
    defaultCycle: string;
    cutoffTime: string;
    minimumSettlementAmount: number;
    autoSettlementEnabled: boolean;
    reconciliationRequired: boolean;
  };
  notification: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
    criticalAlertEnabled: boolean;
  };
  branding: BrandingConfig;
  security: SecuritySettings;
}

export interface AdminSummary {
  totalAdminUsers: number;
  activeAdminUsers: number;
  inactiveAdminUsers: number;
  lockedAdminUsers: number;
  superAdminsCount: number;
  totalRoles: number;
  systemRolesCount: number;
  customRolesCount: number;
  activeRolesCount: number;
  configuredPermissionsCount: number;
  activeLimitRules: number;
  activeFeeRules: number;
}

/* ==========================================================================
   Phase 15: Hierarchy, Multi-Role, Retailer Plan & Mock Auth Types
   ========================================================================== */

export type ApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type RetailerApprovalStatus = ApprovalStatus;
export type AccountStatus = 'INACTIVE' | 'ACTIVE' | 'SUSPENDED';
export type PlanStatus = 'ACTIVE' | 'INACTIVE';
export type CommissionType = 'FLAT' | 'PERCENTAGE';
export type CommissionServiceType = 'PAY_IN' | 'PAY_OUT';

export interface ApprovalMetadata {
  approvalStatus: ApprovalStatus;
  submittedAt?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  rejectedByUserId?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvalRemarks?: string;
}

export interface CommissionRule {
  serviceType: CommissionServiceType;
  commissionType: CommissionType;
  value: number;
}

export interface MasterDistributor {
  id: string;
  code: string;
  userId: string;
  name: string;
  businessName: string;
  email: string;
  mobile: string;
  status: AccountStatus;
  walletId: string;
  commissionConfig?: Record<string, any>;
  documents?: KYCDocument[];
  createdAt: string;
  updatedAt?: string;
}

export interface Distributor {
  id: string;
  code: string;
  masterDistributorId: string;
  userId: string;
  name: string;
  businessName: string;
  email: string;
  mobile: string;
  businessType?: string;
  registrationNumber?: string;
  gstNumber?: string;
  panNumberMasked?: string;
  kycStatus?: KYCStatus;
  approvalStatus?: ApprovalStatus;
  status: AccountStatus;
  walletId: string;
  address?: string;
  city?: string;
  state?: string;
    pincode?: string;
    documents?: KYCDocument[];
  commissionConfig?: Record<string, any>;
  createdByUserId?: string;
  createdByRole?: UserRole;
  createdByEntityId?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  rejectedByUserId?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvalRemarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Retailer {
  id: string;
  code: string;
  masterDistributorId: string;
  distributorId: string;
  distributorName?: string;
  distributorCode?: string;
  parentAuthorityType?: string;
  userId: string;
  planId: string;
  name: string;
  businessName: string;
  email: string;
  mobile: string;
  kycStatus: KYCStatus;
  approvalStatus: ApprovalStatus;
  accountStatus: AccountStatus;
  walletId: string;
  address?: string;
  city?: string;
  state?: string;
    pincode?: string;
    documents?: KYCDocument[];
  createdByUserId: string;
  createdByRole: UserRole;
  createdByEntityId: string;
  approvedByUserId?: string;
  approvedAt?: string;
  rejectedByUserId?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvalRemarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RetailerPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  commissionRules: CommissionRule[];
  status: PlanStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  assignedRetailersCount: number;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MockAccount {
  userId: string;
  username: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  entityId?: string;
  approvalStatus?: RetailerApprovalStatus;
  accountStatus?: AccountStatus;
  permissions: string[];
}
