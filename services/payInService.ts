import { Transaction, CommissionSnapshot, PayInAccountingSnapshot, Retailer, WalletAccount } from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { hierarchyService } from './hierarchyService';
import { retailerPlanService } from './retailerPlanService';
import { transactionService } from './transactionService';
import { walletService } from './walletService';
import { ledgerService } from './ledgerService';
import { commissionService } from './commissionService';
import { adminService } from './adminService';
import { APP_CONFIG } from '@/config';

export interface PayInPreviewInput {
  amount: number;
  serviceType?: string;
  paymentMode?: string;
}

export interface PayInAccountingResult {
  // Principal & Inflow
  principalAmount: number;
  customerCharge: number;
  gstAmount: number;
  customerTotal: number;
  chargeRateLabel: string;
  totalDeductions: number;
  actualCreditAmount: number;

  // Commercial Revenue Pool
  grossCommercialRevenue: number;

  // Hierarchy Commissions
  retailerCommissionRate: string;
  retailerCommissionAmount: number;
  distributorCommissionRate: string;
  distributorCommissionAmount: number;
  masterDistributorCommissionRate: string;
  masterDistributorCommissionAmount: number;
  totalHierarchyCommission: number;

  // Platform Margin
  platformRetainedRevenue: number;

  // Retailer Wallet Movements (Separate concepts)
  retailerPrincipalWalletCredit: number;
  retailerCommissionWalletCredit: number;
  retailerWalletCredit: number;
  retailerWalletDebit: number;

  // Tax Liability
  taxLiability: number;

  // Settlement Breakdown
  settlementPrincipal: number;
  settlementFeeComponent: number;
  settlementTaxComponent: number;
  grossSettlementReceivable: number;
  netSettlementAmount: number;

  // Plan Meta
  planName: string;
  planCode: string;

  // Backwards-compatibility aliases for UI components
  amount: number;
  charges: number;
  gst: number;
  totalAmount: number;
}

export interface PayInPreviewResult extends PayInAccountingResult {
  walletEffect: string;
}

export interface PayInExecutionInput {
  customerName?: string;
  customerMobile: string;
  customerReference?: string;
  serviceType: string;
  paymentMode: string;
  amount: number;
  remarks?: string;
  mockScenario?: 'AUTO' | 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface PayInExecutionResult {
  transaction: Transaction;
  preview: PayInPreviewResult;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  message: string;
  walletBalanceAfter?: number;
  earnedCommission?: number;
}

class PayInService {
  /**
   * Calculates explicit financial accounting breakdown for Pay-In
   */
  async calculatePayInPreview(
    retailerId: string,
    input: PayInPreviewInput
  ): Promise<ApiResponse<PayInPreviewResult>> {
    const principalAmount = Number(input.amount) || 0;

    // 1. Resolve Retailer, Distributor, MD & Plan
    const retailer = hierarchyService.getRetailerById(retailerId);
    const planId = retailer?.planId || 'plan_std_01';
    const planRes = await retailerPlanService.getPlanById(planId);
    const plan = planRes.data;

    const planName = plan?.name || 'Standard Retailer Plan';
    const planCode = plan?.code || 'PLAN_STD_01';

    // 2. Retailer Commission Calculation (from assigned plan: 0.25% standard)
    const payInRules = plan?.commissionRules?.filter((r) => r.serviceType === 'PAY_IN') || [];
    const rule = payInRules[0];

    let retailerCommissionRate = '0.25%';
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
      retailerCommissionAmount = +(principalAmount * 0.0025).toFixed(2);
    }

    // 3. Hierarchy Commissions (Distributor: 0.05%, Master Distributor: 0.02%)
    const distributorCommissionRate = '0.05%';
    const distributorCommissionAmount = +(principalAmount * 0.0005).toFixed(2);
    const masterDistributorCommissionRate = '0.02%';
    const masterDistributorCommissionAmount = +(principalAmount * 0.0002).toFixed(2);

    const totalHierarchyCommission = +(
      retailerCommissionAmount +
      distributorCommissionAmount +
      masterDistributorCommissionAmount
    ).toFixed(2);

    // 4. Resolve the effective Pay-In fee from the central Fee & Charge Master.
    const feeRulesRes = await adminService.getFeeRules();
    const activeFeeRule = feeRulesRes.data?.find((feeRule) =>
      feeRule.status === 'ACTIVE' && feeRule.transactionType === 'PAY_IN' &&
      (feeRule.entityType === 'RETAILER' || feeRule.entityType === 'ALL')
    );
    const resolvedFeeRule = activeFeeRule || {
      id: 'FEE_PAYIN_FALLBACK', code: 'FEE_PAYIN_FALLBACK', name: 'Pay-In Fee',
      transactionType: 'PAY_IN' as const, entityType: 'RETAILER' as const,
      calculationType: 'PERCENTAGE' as const, value: 1.75, minimumFee: 0,
      maximumFee: 100000, gstApplicable: true, status: 'ACTIVE' as const,
      effectiveFrom: new Date().toISOString(),
    };
    const feePreview = adminService.calculateFeePreview(principalAmount, resolvedFeeRule);
    const customerCharge = +feePreview.baseFee.toFixed(2);
    const grossCommercialRevenue = customerCharge;

    // GST (18% on Commercial Service Charge)
    const gstAmount = +feePreview.gstAmount.toFixed(2);
    const taxLiability = gstAmount;
    const totalDeductions = +(customerCharge + gstAmount).toFixed(2);
    const actualCreditAmount = Math.max(0, +(principalAmount - totalDeductions).toFixed(2));
    const chargeRateLabel = resolvedFeeRule.calculationType === 'PERCENTAGE' ? `${resolvedFeeRule.value}%` : `₹${resolvedFeeRule.value.toFixed(2)} flat`;

    // Customer Inflow
    const customerTotal = principalAmount;

    // 5. Platform Retained Revenue (Revenue Pool - Hierarchy Commissions)
    // Accounting Invariant: grossCommercialRevenue = retailerCommission + distributorCommission + mdCommission + platformRetainedRevenue
    const platformRetainedRevenue = +(grossCommercialRevenue - totalHierarchyCommission).toFixed(2);

    // 6. Retailer Wallet Movements (Pre-funded / Collected Operational Principal + Earned Commission)
    const retailerPrincipalWalletCredit = actualCreditAmount;
    const retailerCommissionWalletCredit = retailerCommissionAmount;
    const retailerWalletCredit = +(retailerPrincipalWalletCredit + retailerCommissionWalletCredit).toFixed(2);
    const retailerWalletDebit = 0;

    // 7. Settlement Breakdowns
    const settlementPrincipal = principalAmount;
    const settlementFeeComponent = customerCharge;
    const settlementTaxComponent = gstAmount;
    const grossSettlementReceivable = customerTotal;
    const netSettlementAmount = actualCreditAmount;

    const walletEffect = `Wallet credited ₹${retailerWalletCredit.toFixed(2)} after ₹${totalDeductions.toFixed(2)} in fee/tax deductions, including ₹${retailerCommissionAmount.toFixed(2)} commission.`;

    return {
      success: true,
      data: {
        principalAmount,
        customerCharge,
        gstAmount,
        customerTotal,
        chargeRateLabel,
        totalDeductions,
        actualCreditAmount,
        grossCommercialRevenue,
        retailerCommissionRate,
        retailerCommissionAmount,
        distributorCommissionRate,
        distributorCommissionAmount,
        masterDistributorCommissionRate,
        masterDistributorCommissionAmount,
        totalHierarchyCommission,
        platformRetainedRevenue,
        retailerPrincipalWalletCredit,
        retailerCommissionWalletCredit,
        retailerWalletCredit,
        retailerWalletDebit,
        taxLiability,
        settlementPrincipal,
        settlementFeeComponent,
        settlementTaxComponent,
        grossSettlementReceivable,
        netSettlementAmount,
        planName,
        planCode,
        walletEffect,
        // Aliases for UI backwards compatibility
        amount: principalAmount,
        charges: customerCharge,
        gst: gstAmount,
        totalAmount: customerTotal,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Executes Pay-In transaction with central limit validation & atomic financial posting
   */
  async executeMockPayInTransaction(
    retailerId: string,
    input: PayInExecutionInput
  ): Promise<ApiResponse<PayInExecutionResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 400)); // Simulated latency

      // 1. Central Transaction Limit Validation (Service-level)
      const limitValidation = adminService.validateTransactionLimit({
        entityType: 'RETAILER',
        entityId: retailerId,
        transactionType: 'PAY_IN',
        paymentMode: input.paymentMode,
        amount: input.amount,
      });

      if (!limitValidation.allowed) {
        return {
          success: false,
          data: null as unknown as PayInExecutionResult,
          error: {
            code: 'TRANSACTION_LIMIT_EXCEEDED',
            message: limitValidation.reason || 'Transaction limit validation failed.',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // 2. Resolve Retailer and Hierarchy Entities
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

      const distributor = hierarchyService.getDistributorById(retailer.distributorId);
      const masterDistributor = hierarchyService.getMasterDistributorById(retailer.masterDistributorId);

      // 3. Compute Financial Breakdown & Accounting
      const previewRes = await this.calculatePayInPreview(retailerId, {
        amount: input.amount,
        serviceType: input.serviceType,
        paymentMode: input.paymentMode,
      });

      if (!previewRes.success || !previewRes.data) {
        return {
          success: false,
          data: null as unknown as PayInExecutionResult,
          error: { code: 'PREVIEW_FAILED', message: 'Failed to compute transaction preview.' },
          timestamp: new Date().toISOString(),
        };
      }

      const preview = previewRes.data;

      // 4. Resolve Mock Status Outcome
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

      // 5. Generate Clear Mock References
      const timestampSuffix = Date.now().toString().slice(-6);
      const transactionRef = `QSP2026${timestampSuffix}`;
      const utr = status === 'SUCCESS' ? `QSPUTR${timestampSuffix}` : undefined;
      const providerRef = `PRVREF${timestampSuffix}`;
      const orderId = input.customerReference || `ORD_IN_${timestampSuffix}`;

      // 6. Build Immutable Commission & Accounting Snapshots
      const commissionSnapshot: CommissionSnapshot = {
        retailerPlanId: retailer.planId,
        retailerPlanCode: preview.planCode,
        retailerPlanName: preview.planName,
        retailerCommissionType: 'PERCENTAGE',
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

      const accountingSnapshot: PayInAccountingSnapshot = {
        principalAmount: preview.principalAmount,
        customerCharge: preview.customerCharge,
        gstAmount: preview.gstAmount,
        customerTotal: preview.customerTotal,
        grossCommercialRevenue: preview.grossCommercialRevenue,
        retailerCommissionAmount: preview.retailerCommissionAmount,
        distributorCommissionAmount: preview.distributorCommissionAmount,
        masterDistributorCommissionAmount: preview.masterDistributorCommissionAmount,
        totalHierarchyCommission: preview.totalHierarchyCommission,
        platformRetainedRevenue: preview.platformRetainedRevenue,
        retailerPrincipalWalletCredit: preview.retailerPrincipalWalletCredit,
        retailerCommissionWalletCredit: preview.retailerCommissionWalletCredit,
        retailerWalletCredit: preview.retailerWalletCredit,
        taxLiability: preview.taxLiability,
        settlementPrincipal: preview.settlementPrincipal,
        grossSettlementReceivable: preview.grossSettlementReceivable,
        netSettlementAmount: preview.netSettlementAmount,
      };

      // 7. Construct Transaction Model
      const nowIso = new Date().toISOString();
      const newTx: Transaction = {
        id: `tx_payin_${Date.now()}`,
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
        type: 'PAY_IN',
        amount: preview.principalAmount,
        fee: preview.customerCharge,
        gst: preview.gstAmount,
        netAmount: preview.actualCreditAmount,
        status,
        paymentMode: (input.paymentMode as any) || 'UPI',
        provider: 'Qin Star Pay Mock Gateway',
        service: input.serviceType || 'UPI Pay-In Collection',
        channel: 'Web',
        customerName: input.customerName || 'Walk-in Customer',
        customerMobile: input.customerMobile,
        failureReason: status === 'FAILED' ? 'Transaction could not be completed at payment gateway.' : undefined,
        commissionSnapshot,
        accountingSnapshot,
        createdAt: nowIso,
        updatedAt: nowIso,
        timeline: [
          {
            timestamp: new Date().toLocaleTimeString(),
            event: 'Pay-In Initiated',
            description: `Collection request initialized for ₹${preview.principalAmount.toLocaleString('en-IN')}`,
            status: 'COMPLETED',
          },
          {
            timestamp: new Date().toLocaleTimeString(),
            event: 'Gateway Processing',
            description: 'Processing Pay-In transaction...',
            status: 'COMPLETED',
          },
          {
            timestamp: new Date().toLocaleTimeString(),
            event: status === 'SUCCESS' ? 'Payment Cleared' : status === 'PENDING' ? 'Awaiting Customer Confirmation' : 'Payment Failed',
            description: status === 'SUCCESS' ? 'Payment clearance confirmed' : status === 'PENDING' ? 'Payment pending customer authorization' : 'Transaction could not be completed at payment gateway.',
            status: status === 'SUCCESS' ? 'COMPLETED' : status === 'PENDING' ? 'PENDING' : 'FAILED',
          },
        ],
      };

      // 8. Insert into Centralized Memory Transactions Store
      (transactionService as any).createMockPayinRequest({
        orderId: newTx.orderId,
        merchantId: newTx.merchantName,
        distributorId: newTx.distributorId,
        retailerId: newTx.retailerId,
        amount: newTx.amount,
        service: newTx.service,
        customerName: newTx.customerName,
        customerMobile: newTx.customerMobile,
      });

      // 9. Atomic Financial Posting Orchestration (SUCCESS ONLY)
      let walletBalanceAfter: number | undefined;
      if (status === 'SUCCESS') {
        walletBalanceAfter = await this.postSuccessfulPayIn(retailer, newTx, preview, nowIso);
      }

      const message =
        status === 'SUCCESS'
          ? 'Pay-In transaction completed successfully.'
          : status === 'PENDING'
          ? 'Pay-In transaction submitted and pending clearance.'
          : 'Pay-In transaction failed at payment gateway.';

      return {
        success: true,
        data: {
          transaction: newTx,
          preview,
          status,
          message,
          walletBalanceAfter,
          earnedCommission: status === 'SUCCESS' ? preview.retailerCommissionAmount : 0,
        },
        timestamp: nowIso,
      };
    }

    return {
      success: false,
      data: null as unknown as PayInExecutionResult,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Single Centralized Orchestration for Successful Pay-In Financial Posting
   * Posts separate transparent ledger entries for Principal and Commission.
   */
  private async postSuccessfulPayIn(
    retailer: Retailer,
    transaction: Transaction,
    accounting: PayInAccountingResult,
    nowIso: string
  ): Promise<number | undefined> {
    let walletBalanceAfter: number | undefined;

    try {
      // Wallet Update (Principal + Retailer Commission)
      const wltRes = await walletService.getRetailerWallet(retailer.id);
      if (wltRes.success && wltRes.data) {
        const currentWallet = wltRes.data;
        const openingBalance = currentWallet.availableBalance;
        const principalCredit = accounting.retailerPrincipalWalletCredit;
        const commissionCredit = accounting.retailerCommissionWalletCredit;
        
        const balanceAfterPrincipal = +(openingBalance + principalCredit).toFixed(2);
        const finalClosingBalance = +(balanceAfterPrincipal + commissionCredit).toFixed(2);

        // Update Wallet Account
        currentWallet.availableBalance = finalClosingBalance;
        currentWallet.ledgerBalance = +(currentWallet.ledgerBalance + principalCredit + commissionCredit).toFixed(2);
        currentWallet.updatedAt = nowIso;
        walletBalanceAfter = finalClosingBalance;

        // Ledger Entry 1: Principal Credit
        ledgerService.addMockLedgerEntry({
          walletId: currentWallet.walletId,
          entityId: retailer.id,
          entityType: 'RETAILER',
          entityName: retailer.name,
          transactionId: transaction.id,
          referenceId: transaction.transactionRef,
          entryType: 'PAY_IN',
          direction: 'CREDIT',
          openingBalance: openingBalance,
          amount: principalCredit,
          closingBalance: balanceAfterPrincipal,
          description: `Pay-In collection principal credit (Ref: ${transaction.transactionRef})`,
          createdBy: retailer.name,
        });

        // Ledger Entry 2: Separate Commission Credit
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
            openingBalance: balanceAfterPrincipal,
            amount: commissionCredit,
            closingBalance: finalClosingBalance,
            description: `Pay-In commission credit (${accounting.retailerCommissionRate} on ₹${accounting.principalAmount.toLocaleString('en-IN')})`,
            createdBy: retailer.name,
          });
        }
      }
    } catch (err) {
      console.error('Failed atomic postSuccessfulPayIn orchestration:', err);
    }

    return walletBalanceAfter;
  }
}

export const payInService = new PayInService();
