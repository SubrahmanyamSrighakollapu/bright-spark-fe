import { Transaction, CommissionSnapshot, PayOutAccountingSnapshot, Retailer, WalletAccount } from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { hierarchyService } from './hierarchyService';
import { retailerPlanService } from './retailerPlanService';
import { transactionService } from './transactionService';
import { walletService } from './walletService';
import { ledgerService } from './ledgerService';
import { commissionService } from './commissionService';
import { adminService } from './adminService';
import { APP_CONFIG } from '@/config';

export interface PayOutPreviewInput {
  amount: number;
  paymentMode: string;
  serviceType?: string;
  beneficiaryAccount?: string;
  beneficiaryIfsc?: string;
}

export interface PayOutAccountingResult {
  principalAmount: number;
  customerCharge: number;
  gstAmount: number;
  grossCommercialRevenue: number;

  retailerCommissionRate: string;
  retailerCommissionAmount: number;
  distributorCommissionRate: string;
  distributorCommissionAmount: number;
  masterDistributorCommissionRate: string;
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

  planName: string;
  planCode: string;

  availableBalance: number;
  holdBalance: number;
  isWalletSufficient: boolean;
  shortfall: number;
  projectedBalanceAfter: number;

  // Aliases for UI backwards compatibility
  amount: number;
  charges: number;
  gst: number;
  totalAmount: number;
}

export interface PayOutPreviewResult extends PayOutAccountingResult {
  walletEffect: string;
}

export interface PayOutExecutionInput {
  beneficiaryName: string;
  beneficiaryMobile?: string;
  beneficiaryAccount: string;
  beneficiaryIfsc: string;
  bankName?: string;
  paymentMode: string;
  amount: number;
  serviceType?: string;
  beneficiaryReference?: string;
  remarks?: string;
  mockScenario?: 'AUTO' | 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface PayOutExecutionResult {
  transaction: Transaction;
  preview: PayOutPreviewResult;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  message: string;
  walletBalanceAfter?: number;
  earnedCommission?: number;
  maskedAccount: string;
}

class PayOutService {
  /** Generates a retailer-safe, unique disbursement reference. */
  generateDisbursementReference(): string {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
      : Math.random().toString(36).slice(2, 8).toUpperCase();
    return `QSPD-${date}-${time}-${random}`;
  }

  /**
   * Helper to mask bank account number (e.g. XXXXXX1234)
   */
  maskAccountNumber(accNum: string): string {
    const clean = accNum.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    const visible = clean.slice(-4);
    const maskedPart = 'X'.repeat(Math.max(6, clean.length - 4));
    return `${maskedPart}${visible}`;
  }

  /**
   * Calculates explicit financial accounting breakdown for Pay-Out
   */
  async calculatePayOutPreview(
    retailerId: string,
    input: PayOutPreviewInput
  ): Promise<ApiResponse<PayOutPreviewResult>> {
    const principalAmount = Number(input.amount) || 0;

    // 1. Resolve Retailer, Distributor, MD & Plan
    const retailer = hierarchyService.getRetailerById(retailerId);
    const planId = retailer?.planId || 'plan_std_01';
    const planRes = await retailerPlanService.getPlanById(planId);
    const plan = planRes.data;

    const planName = plan?.name || 'Standard Retailer Plan';
    const planCode = plan?.code || 'PLAN_STD_01';

    // 2. Resolve Pay-Out Commercial Fee (Flat ₹20.00 charge per transaction for IMPS/NEFT/RTGS/UPI)
    const customerCharge = principalAmount > 0 ? 20.0 : 0;
    const grossCommercialRevenue = customerCharge;

    // 3. GST (18% on Pay-Out Service Charge)
    const gstAmount = +(customerCharge * 0.18).toFixed(2); // ₹ 3.60
    const taxLiability = gstAmount;

    // 4. Retailer Pay-Out Commission Calculation (Standard ₹3.50 flat commission per payout)
    const payOutRules = plan?.commissionRules?.filter((r) => r.serviceType === 'PAY_OUT') || [];
    const rule = payOutRules[0];

    let retailerCommissionRate = '₹ 3.50';
    let retailerCommissionAmount = 0;

    if (rule) {
      if (rule.commissionType === 'PERCENTAGE') {
        retailerCommissionRate = `${rule.value}%`;
        retailerCommissionAmount = +(principalAmount * (rule.value / 100)).toFixed(2);
      } else {
        retailerCommissionRate = `₹ ${rule.value.toFixed(2)}`;
        retailerCommissionAmount = rule.value;
      }
    } else {
      retailerCommissionAmount = 3.5;
    }

    // 5. Hierarchy Commissions (Distributor: ₹ 1.50, MD: ₹ 0.50)
    const distributorCommissionRate = '₹ 1.50';
    const distributorCommissionAmount = 1.5;
    const masterDistributorCommissionRate = '₹ 0.50';
    const masterDistributorCommissionAmount = 0.5;

    const totalHierarchyCommission = +(
      retailerCommissionAmount +
      distributorCommissionAmount +
      masterDistributorCommissionAmount
    ).toFixed(2); // ₹ 5.50

    // 6. Platform Retained Revenue (₹20.00 Revenue Pool - ₹5.50 Hierarchy Commissions = +₹14.50)
    const platformRetainedRevenue = +(grossCommercialRevenue - totalHierarchyCommission).toFixed(2);

    // 7. Wallet Debits (Retailer bears Principal, Service Charge, and GST)
    const walletPrincipalDebit = principalAmount;
    const walletFeeDebit = customerCharge;
    const walletTaxDebit = gstAmount;
    const totalWalletDebit = +(walletPrincipalDebit + walletFeeDebit + walletTaxDebit).toFixed(2);
    const walletCommissionCredit = retailerCommissionAmount;
    const netWalletMovement = -(totalWalletDebit - walletCommissionCredit);

    // 8. Wallet Sufficiency Check
    const wltRes = await walletService.getRetailerWallet(retailerId);
    const availableBalance = wltRes.data?.availableBalance || 0;
    const holdBalance = wltRes.data?.holdBalance || 0;

    const isWalletSufficient = availableBalance >= totalWalletDebit;
    const shortfall = isWalletSufficient ? 0 : +(totalWalletDebit - availableBalance).toFixed(2);
    const projectedBalanceAfter = +(availableBalance - totalWalletDebit + walletCommissionCredit).toFixed(2);

    // 9. Settlement Amounts
    const beneficiaryTransferAmount = principalAmount;
    const settlementAmount = principalAmount;

    const walletEffect = `Total Wallet Debit (-₹${totalWalletDebit.toFixed(2)}) [Principal: ₹${principalAmount.toFixed(2)}, Fee: ₹${customerCharge.toFixed(2)}, GST: ₹${gstAmount.toFixed(2)}], Commission Earned (+₹${retailerCommissionAmount.toFixed(2)})`;

    return {
      success: true,
      data: {
        principalAmount,
        customerCharge,
        gstAmount,
        grossCommercialRevenue,
        retailerCommissionRate,
        retailerCommissionAmount,
        distributorCommissionRate,
        distributorCommissionAmount,
        masterDistributorCommissionRate,
        masterDistributorCommissionAmount,
        totalHierarchyCommission,
        platformRetainedRevenue,
        walletPrincipalDebit,
        walletFeeDebit,
        walletTaxDebit,
        totalWalletDebit,
        walletCommissionCredit,
        netWalletMovement,
        taxLiability,
        beneficiaryTransferAmount,
        settlementAmount,
        planName,
        planCode,
        availableBalance,
        holdBalance,
        isWalletSufficient,
        shortfall,
        projectedBalanceAfter,
        walletEffect,
        // Aliases
        amount: principalAmount,
        charges: customerCharge,
        gst: gstAmount,
        totalAmount: totalWalletDebit,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Executes Pay-Out transaction with central limit, wallet sufficiency & atomic financial posting
   */
  async executeMockPayOutTransaction(
    retailerId: string,
    input: PayOutExecutionInput
  ): Promise<ApiResponse<PayOutExecutionResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 450)); // Simulated processing delay

      // 1. Retailer Account Eligibility Check
      const retailer = hierarchyService.getRetailerById(retailerId) || {
        id: retailerId,
        userId: 'usr_ret_001',
        code: 'RET001',
        name: 'Metro Store #01',
        businessName: 'Metro Store Retail Solutions',
        distributorId: 'dst_001',
        masterDistributorId: 'md_001',
        planId: 'plan_std_01',
        email: 'ret001@qinstarpay.com',
        mobile: '9860066666',
        kycStatus: 'APPROVED',
        approvalStatus: 'APPROVED',
        accountStatus: 'ACTIVE',
        walletId: 'wlt_ret_001',
        createdByUserId: 'usr_dst_01',
        createdByRole: 'DISTRIBUTOR' as const,
        createdByEntityId: 'dst_001',
        createdAt: new Date().toISOString(),
      };

      if (retailer.approvalStatus !== 'APPROVED' || retailer.accountStatus !== 'ACTIVE') {
        return {
          success: false,
          data: null as unknown as PayOutExecutionResult,
          error: {
            code: 'RETAILER_NOT_ELIGIBLE',
            message: 'Your account is not eligible to perform Pay-Out disbursements.',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // 2. RTGS Special Minimum Transfer Rule
      if (input.paymentMode === 'RTGS' && input.amount < 200000) {
        return {
          success: false,
          data: null as unknown as PayOutExecutionResult,
          error: {
            code: 'RTGS_MINIMUM_REQUIRED',
            message: 'RTGS disbursements require a minimum transfer amount of ₹2,00,000.',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // 3. Central Transaction Limit Validation (Service-level)
      const limitValidation = adminService.validateTransactionLimit({
        entityType: 'RETAILER',
        entityId: retailerId,
        transactionType: 'PAY_OUT',
        paymentMode: input.paymentMode,
        amount: input.amount,
      });

      if (!limitValidation.allowed) {
        return {
          success: false,
          data: null as unknown as PayOutExecutionResult,
          error: {
            code: 'TRANSACTION_LIMIT_EXCEEDED',
            message: limitValidation.reason || 'Transaction limit validation failed.',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // 4. Calculate Pay-Out Financial Preview & Wallet Check
      const previewRes = await this.calculatePayOutPreview(retailerId, {
        amount: input.amount,
        paymentMode: input.paymentMode,
        serviceType: input.serviceType,
        beneficiaryAccount: input.beneficiaryAccount,
        beneficiaryIfsc: input.beneficiaryIfsc,
      });

      if (!previewRes.success || !previewRes.data) {
        return {
          success: false,
          data: null as unknown as PayOutExecutionResult,
          error: { code: 'PREVIEW_FAILED', message: 'Failed to compute Pay-Out accounting preview.' },
          timestamp: new Date().toISOString(),
        };
      }

      const preview = previewRes.data;

      // 5. Service-Level Wallet Sufficiency Validation
      if (!preview.isWalletSufficient) {
        return {
          success: false,
          data: null as unknown as PayOutExecutionResult,
          error: {
            code: 'INSUFFICIENT_WALLET_BALANCE',
            message: `Insufficient wallet balance. Required: ₹${preview.totalWalletDebit.toLocaleString('en-IN')}, Available: ₹${preview.availableBalance.toLocaleString('en-IN')}, Shortfall: ₹${preview.shortfall.toLocaleString('en-IN')}.`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      const distributor = hierarchyService.getDistributorById(retailer.distributorId);
      const masterDistributor = hierarchyService.getMasterDistributorById(retailer.masterDistributorId);

      // 6. Resolve Mock Status Outcome
      let status: 'SUCCESS' | 'PENDING' | 'FAILED' = 'SUCCESS';
      if (input.mockScenario === 'SUCCESS') {
        status = 'SUCCESS';
      } else if (input.mockScenario === 'PENDING') {
        status = 'PENDING';
      } else if (input.mockScenario === 'FAILED') {
        status = 'FAILED';
      } else {
        const rand = Math.random();
        status = rand < 0.85 ? 'SUCCESS' : rand < 0.95 ? 'PENDING' : 'FAILED';
      }

      // 7. Generate Clear References & Masked Account
      const timestampSuffix = Date.now().toString().slice(-6);
      const transactionRef = `QSP2026${timestampSuffix}`;
      const utr = status === 'SUCCESS' ? `QSPUTR${timestampSuffix}` : undefined;
      const providerRef = `PRVREF${timestampSuffix}`;
      const orderId = input.beneficiaryReference?.startsWith('QSPD-')
        ? input.beneficiaryReference
        : this.generateDisbursementReference();
      const maskedAccount = this.maskAccountNumber(input.beneficiaryAccount);

      // 8. Build Snapshots
      const commissionSnapshot: CommissionSnapshot = {
        retailerPlanId: retailer.planId,
        retailerPlanCode: preview.planCode,
        retailerPlanName: preview.planName,
        retailerCommissionType: 'FLAT',
        retailerCommissionRate: preview.retailerCommissionRate,
        retailerCommissionAmount: preview.retailerCommissionAmount,

        distributorId: retailer.distributorId,
        distributorName: distributor?.name || 'North Zone Distributor',
        distributorCommissionRate: preview.distributorCommissionRate,
        distributorCommissionAmount: preview.distributorCommissionAmount,

        masterDistributorId: retailer.masterDistributorId,
        masterDistributorName: masterDistributor?.name || 'Apex Master Group',
        masterDistributorCommissionRate: preview.masterDistributorCommissionRate,
        masterDistributorCommissionAmount: preview.masterDistributorCommissionAmount,

        grossCommercialRevenue: preview.grossCommercialRevenue,
        totalHierarchyCommission: preview.totalHierarchyCommission,
        platformRetainedRevenue: preview.platformRetainedRevenue,
      };

      const payOutAccountingSnapshot: PayOutAccountingSnapshot = {
        principalAmount: preview.principalAmount,
        customerCharge: preview.customerCharge,
        gstAmount: preview.gstAmount,
        grossCommercialRevenue: preview.grossCommercialRevenue,
        retailerCommissionAmount: preview.retailerCommissionAmount,
        distributorCommissionAmount: preview.distributorCommissionAmount,
        masterDistributorCommissionAmount: preview.masterDistributorCommissionAmount,
        totalHierarchyCommission: preview.totalHierarchyCommission,
        platformRetainedRevenue: preview.platformRetainedRevenue,
        walletPrincipalDebit: preview.walletPrincipalDebit,
        walletFeeDebit: preview.walletFeeDebit,
        walletTaxDebit: preview.walletTaxDebit,
        totalWalletDebit: preview.totalWalletDebit,
        walletCommissionCredit: preview.walletCommissionCredit,
        netWalletMovement: preview.netWalletMovement,
        taxLiability: preview.taxLiability,
        beneficiaryTransferAmount: preview.beneficiaryTransferAmount,
        settlementAmount: preview.settlementAmount,
      };

      // 9. Construct Transaction Model
      const nowIso = new Date().toISOString();
      const newTx: Transaction = {
        id: `tx_payout_${Date.now()}`,
        transactionRef,
        orderId,
        referenceId: providerRef,
        utr,
        merchantName: retailer.businessName || retailer.name,
        distributorName: distributor?.name || 'North Zone Distributor',
        distributorId: retailer.distributorId,
        retailerName: retailer.name,
        retailerId: retailer.id,
        masterDistributorId: retailer.masterDistributorId,
        type: 'PAY_OUT',
        amount: preview.principalAmount,
        fee: preview.customerCharge,
        gst: preview.gstAmount,
        netAmount: preview.totalWalletDebit,
        status,
        paymentMode: (input.paymentMode as any) || 'IMPS',
        provider: 'Qin Star Pay Mock Gateway',
        service: input.serviceType || 'Bank Account Disbursement',
        channel: 'Web',
        beneficiaryName: input.beneficiaryName,
        beneficiaryAccount: input.beneficiaryAccount,
        accountNumberMasked: maskedAccount,
        beneficiaryIfsc: input.beneficiaryIfsc,
        beneficiaryBank: input.bankName || 'State Bank of India',
        customerMobile: input.beneficiaryMobile,
        failureReason: status === 'FAILED' ? 'Transaction could not be completed at bank gateway.' : undefined,
        commissionSnapshot,
        payOutAccountingSnapshot,
        createdAt: nowIso,
        updatedAt: nowIso,
        timeline: [
          {
            timestamp: new Date().toLocaleTimeString(),
            event: 'Pay-Out Initiated',
            description: `Disbursement request created for ₹${preview.principalAmount.toLocaleString('en-IN')} to ${maskedAccount}`,
            status: 'COMPLETED',
          },
          {
            timestamp: new Date().toLocaleTimeString(),
            event: 'Gateway Processing',
            description: 'Processing Pay-Out transaction...',
            status: 'COMPLETED',
          },
          {
            timestamp: new Date().toLocaleTimeString(),
            event: status === 'SUCCESS' ? 'Disbursement Cleared' : status === 'PENDING' ? 'Awaiting Bank Clearance' : 'Disbursement Failed',
            description: status === 'SUCCESS' ? 'Funds transferred to beneficiary account' : status === 'PENDING' ? 'Pay-Out submitted and pending bank clearance' : 'Transaction could not be completed at bank gateway.',
            status: status === 'SUCCESS' ? 'COMPLETED' : status === 'PENDING' ? 'PENDING' : 'FAILED',
          },
        ],
      };

      // 10. Insert into Centralized Memory Transactions Store
      (transactionService as any).createMockPayinRequest({
        orderId: newTx.orderId,
        merchantId: newTx.merchantName,
        distributorId: newTx.distributorId,
        retailerId: newTx.retailerId,
        amount: newTx.amount,
        service: newTx.service,
        customerName: newTx.beneficiaryName,
        customerMobile: newTx.customerMobile,
      });

      // 11. Atomic Financial Posting Orchestration
      let walletBalanceAfter: number | undefined;
      if (status === 'SUCCESS') {
        walletBalanceAfter = await this.postSuccessfulPayOut(retailer, newTx, preview, nowIso);
      } else if (status === 'PENDING') {
        walletBalanceAfter = await this.postPendingPayOut(retailer, newTx, preview, nowIso);
      } else if (status === 'FAILED') {
        walletBalanceAfter = await this.postFailedPayOut(retailer, newTx, preview, nowIso);
      }

      const message =
        status === 'SUCCESS'
          ? 'Pay-Out transaction completed successfully.'
          : status === 'PENDING'
          ? 'Pay-Out submitted and pending bank clearance.'
          : 'Pay-Out transaction failed at bank gateway.';

      return {
        success: true,
        data: {
          transaction: newTx,
          preview,
          status,
          message,
          walletBalanceAfter,
          earnedCommission: status === 'SUCCESS' ? preview.retailerCommissionAmount : 0,
          maskedAccount,
        },
        timestamp: nowIso,
      };
    }

    return {
      success: false,
      data: null as unknown as PayOutExecutionResult,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Orchestrates Successful Pay-Out Financial Posting (Dual Ledger Transparency)
   */
  private async postSuccessfulPayOut(
    retailer: Retailer,
    transaction: Transaction,
    accounting: PayOutAccountingResult,
    nowIso: string
  ): Promise<number | undefined> {
    let walletBalanceAfter: number | undefined;

    try {
      const wltRes = await walletService.getRetailerWallet(retailer.id);
      if (wltRes.success && wltRes.data) {
        const currentWallet = wltRes.data;
        const openingBalance = currentWallet.availableBalance;
        const totalDebit = accounting.totalWalletDebit;
        const commissionCredit = accounting.walletCommissionCredit;

        const balanceAfterDebit = +(openingBalance - totalDebit).toFixed(2);
        const finalBalance = +(balanceAfterDebit + commissionCredit).toFixed(2);

        // Update Wallet Account
        currentWallet.availableBalance = finalBalance;
        currentWallet.ledgerBalance = +(currentWallet.ledgerBalance - totalDebit + commissionCredit).toFixed(2);
        currentWallet.updatedAt = nowIso;
        walletBalanceAfter = finalBalance;

        // Ledger Entry 1: Principal Debit
        ledgerService.addMockLedgerEntry({
          walletId: currentWallet.walletId,
          entityId: retailer.id,
          entityType: 'RETAILER',
          entityName: retailer.name,
          transactionId: transaction.id,
          referenceId: transaction.transactionRef,
          entryType: 'PAY_OUT',
          direction: 'DEBIT',
          openingBalance,
          amount: accounting.walletPrincipalDebit,
          closingBalance: +(openingBalance - accounting.walletPrincipalDebit).toFixed(2),
          description: `Pay-Out principal disbursement to ${transaction.accountNumberMasked || transaction.beneficiaryAccount} (Ref: ${transaction.transactionRef})`,
          createdBy: retailer.name,
        });

        // Ledger Entry 2: Service Fee Debit
        if (accounting.walletFeeDebit > 0) {
          ledgerService.addMockLedgerEntry({
            walletId: currentWallet.walletId,
            entityId: retailer.id,
            entityType: 'RETAILER',
            entityName: retailer.name,
            transactionId: transaction.id,
            referenceId: transaction.transactionRef,
            entryType: 'CHARGE',
            direction: 'DEBIT',
            openingBalance: +(openingBalance - accounting.walletPrincipalDebit).toFixed(2),
            amount: accounting.walletFeeDebit,
            closingBalance: +(openingBalance - accounting.walletPrincipalDebit - accounting.walletFeeDebit).toFixed(2),
            description: `Pay-Out service processing fee (${transaction.paymentMode})`,
            createdBy: retailer.name,
          });
        }

        // Ledger Entry 3: GST Debit
        if (accounting.walletTaxDebit > 0) {
          ledgerService.addMockLedgerEntry({
            walletId: currentWallet.walletId,
            entityId: retailer.id,
            entityType: 'RETAILER',
            entityName: retailer.name,
            transactionId: transaction.id,
            referenceId: transaction.transactionRef,
            entryType: 'TAX',
            direction: 'DEBIT',
            openingBalance: +(openingBalance - accounting.walletPrincipalDebit - accounting.walletFeeDebit).toFixed(2),
            amount: accounting.walletTaxDebit,
            closingBalance: balanceAfterDebit,
            description: `GST (18%) on Pay-Out service fee`,
            createdBy: retailer.name,
          });
        }

        // Ledger Entry 4: Separate Commission Credit
        if (commissionCredit > 0) {
          ledgerService.addMockLedgerEntry({
            walletId: currentWallet.walletId,
            entityId: retailer.id,
            entityType: 'RETAILER',
            entityName: retailer.name,
            transactionId: transaction.id,
            referenceId: transaction.transactionRef,
            entryType: 'WALLET_CREDIT',
            direction: 'CREDIT',
            openingBalance: balanceAfterDebit,
            amount: commissionCredit,
            closingBalance: finalBalance,
            description: `Pay-Out commission credit (${accounting.retailerCommissionRate})`,
            createdBy: retailer.name,
          });
        }
      }
    } catch (err) {
      console.error('Failed atomic postSuccessfulPayOut orchestration:', err);
    }

    return walletBalanceAfter;
  }

  /**
   * Orchestrates Pending Pay-Out (Places funds on HOLD to prevent double spending)
   */
  private async postPendingPayOut(
    retailer: Retailer,
    transaction: Transaction,
    accounting: PayOutAccountingResult,
    nowIso: string
  ): Promise<number | undefined> {
    let walletBalanceAfter: number | undefined;

    try {
      const wltRes = await walletService.getRetailerWallet(retailer.id);
      if (wltRes.success && wltRes.data) {
        const currentWallet = wltRes.data;
        const openingBalance = currentWallet.availableBalance;
        const totalDebit = accounting.totalWalletDebit;
        const closingAvailable = +(openingBalance - totalDebit).toFixed(2);

        // Decrease available balance, increase hold balance
        currentWallet.availableBalance = closingAvailable;
        currentWallet.holdBalance = +(currentWallet.holdBalance + totalDebit).toFixed(2);
        currentWallet.updatedAt = nowIso;
        walletBalanceAfter = closingAvailable;

        // Ledger Entry: Hold Reservation
        ledgerService.addMockLedgerEntry({
          walletId: currentWallet.walletId,
          entityId: retailer.id,
          entityType: 'RETAILER',
          entityName: retailer.name,
          transactionId: transaction.id,
          referenceId: transaction.transactionRef,
          entryType: 'HOLD',
          direction: 'DEBIT',
          openingBalance,
          amount: totalDebit,
          closingBalance: closingAvailable,
          description: `Pay-Out funds placed on hold pending bank clearance (Ref: ${transaction.transactionRef})`,
          createdBy: retailer.name,
        });
      }
    } catch (err) {
      console.error('Failed atomic postPendingPayOut orchestration:', err);
    }

    return walletBalanceAfter;
  }

  /**
   * Orchestrates Failed Pay-Out (Zero debit / releases hold if present)
   */
  private async postFailedPayOut(
    retailer: Retailer,
    transaction: Transaction,
    accounting: PayOutAccountingResult,
    nowIso: string
  ): Promise<number | undefined> {
    const wltRes = await walletService.getRetailerWallet(retailer.id);
    return wltRes.data?.availableBalance;
  }

  /**
   * Idempotent Finalization Helper for Pending Pay-Out Lifecycle Transitions (PENDING -> SUCCESS / FAILED)
   */
  async finalizePendingPayOut(
    transactionId: string,
    targetStatus: 'SUCCESS' | 'FAILED',
    operatorName: string = 'System Automation'
  ): Promise<ApiResponse<{ transaction: Transaction; walletBalanceAfter: number }>> {
    const txRes = await transactionService.getTransactionById(transactionId);
    const transaction = txRes.data;

    if (!transaction) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Pay-Out transaction record not found.' },
        timestamp: new Date().toISOString(),
      };
    }

    if (transaction.type !== 'PAY_OUT') {
      return {
        success: false,
        error: { code: 'INVALID_TYPE', message: 'Transaction is not a Pay-Out disbursement.' },
        timestamp: new Date().toISOString(),
      };
    }

    const retailerId = transaction.retailerId || 'RET001';

    // Idempotency Guard
    if (transaction.status !== 'PENDING') {
      const wltRes = await walletService.getRetailerWallet(retailerId);
      return {
        success: true,
        data: {
          transaction,
          walletBalanceAfter: wltRes.data?.availableBalance || 0,
        },
        timestamp: new Date().toISOString(),
      };
    }

    const retailer = hierarchyService.getRetailerById(retailerId);
    const wltRes = await walletService.getRetailerWallet(retailerId);
    const currentWallet = wltRes.data;

    if (!retailer || !currentWallet) {
      return {
        success: false,
        error: { code: 'WALLET_ERROR', message: 'Retailer wallet account not resolved.' },
        timestamp: new Date().toISOString(),
      };
    }

    const previewRes = await this.calculatePayOutPreview(retailerId, {
      amount: transaction.amount,
      paymentMode: transaction.paymentMode || 'IMPS',
    });
    const accounting = previewRes.data;
    const totalDebit = accounting?.totalWalletDebit || +(transaction.amount + (transaction.fee || 20) + (transaction.gst || 3.6)).toFixed(2);
    const commissionCredit = accounting?.walletCommissionCredit || 3.5;
    const nowIso = new Date().toISOString();

    if (targetStatus === 'SUCCESS') {
      // 1. Release Hold reservation and finalize debit without double-spending Available
      currentWallet.holdBalance = Math.max(0, +(currentWallet.holdBalance - totalDebit).toFixed(2));
      currentWallet.ledgerBalance = +(currentWallet.ledgerBalance - totalDebit + commissionCredit).toFixed(2);
      const openingAvail = currentWallet.availableBalance;
      const closingAvail = +(currentWallet.availableBalance + commissionCredit).toFixed(2);
      currentWallet.availableBalance = closingAvail;
      currentWallet.updatedAt = nowIso;

      // 2. Update Transaction Status & Generate UTR
      transaction.status = 'SUCCESS';
      transaction.utr = transaction.utr || `QSPUTR${Date.now().toString().slice(-6)}`;
      transaction.updatedAt = nowIso;

      // 3. Post Commission Credit Entry to Ledger
      ledgerService.addMockLedgerEntry({
        walletId: currentWallet.walletId,
        entityId: retailer.id,
        entityType: 'RETAILER',
        entityName: retailer.name,
        transactionId: transaction.id,
        referenceId: transaction.transactionRef,
        entryType: 'WALLET_CREDIT',
        direction: 'CREDIT',
        openingBalance: openingAvail,
        amount: commissionCredit,
        closingBalance: closingAvail,
        description: `Pending Pay-Out finalized successfully. Commission credited (${accounting?.retailerCommissionRate || '₹ 3.50'})`,
        createdBy: operatorName,
      });

      return {
        success: true,
        data: {
          transaction,
          walletBalanceAfter: closingAvail,
        },
        timestamp: nowIso,
      };
    } else {
      // FAILED Transition: Release reserved Hold back to Available
      currentWallet.holdBalance = Math.max(0, +(currentWallet.holdBalance - totalDebit).toFixed(2));
      const openingAvail = currentWallet.availableBalance;
      const closingAvail = +(currentWallet.availableBalance + totalDebit).toFixed(2);
      currentWallet.availableBalance = closingAvail;
      currentWallet.updatedAt = nowIso;

      // Update Transaction Status
      transaction.status = 'FAILED';
      transaction.failureReason = 'Disbursement failed at bank gateway. Reserved funds released to available wallet.';
      transaction.updatedAt = nowIso;

      // Post Release Entry to Ledger
      ledgerService.addMockLedgerEntry({
        walletId: currentWallet.walletId,
        entityId: retailer.id,
        entityType: 'RETAILER',
        entityName: retailer.name,
        transactionId: transaction.id,
        referenceId: transaction.transactionRef,
        entryType: 'RELEASE',
        direction: 'CREDIT',
        openingBalance: openingAvail,
        amount: totalDebit,
        closingBalance: closingAvail,
        description: `Hold released for failed Pay-Out transaction ${transaction.transactionRef}`,
        createdBy: operatorName,
      });

      return {
        success: true,
        data: {
          transaction,
          walletBalanceAfter: closingAvail,
        },
        timestamp: nowIso,
      };
    }
  }
}

export const payOutService = new PayOutService();
