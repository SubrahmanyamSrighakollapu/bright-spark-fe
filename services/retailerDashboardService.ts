import { Retailer, WalletAccount, Transaction, RetailerPlan } from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { hierarchyService } from './hierarchyService';
import { transactionService } from './transactionService';
import { walletService } from './walletService';
import { commissionService } from './commissionService';
import { retailerPlanService } from './retailerPlanService';
import { APP_CONFIG } from '@/config';

export interface RetailerDashboardSummary {
  retailer: Retailer;
  parentDistributor?: {
    id: string;
    code: string;
    name: string;
  };
  parentMasterDistributor?: {
    id: string;
    code: string;
    name: string;
  };
  plan?: RetailerPlan | null;
  wallet: WalletAccount;
  transactionSummary: {
    todayCount: number;
    todayPayInVolume: number;
    todayPayOutVolume: number;
    successfulCount: number;
    pendingCount: number;
    failedCount: number;
    successRate: number;
  };
  commissionSummary: {
    todayCommission: number;
    yesterdayCommission: number;
    thisMonthCommission: number;
    previousMonthCommission: number;
    pendingCommission: number;
    creditedCommission: number;
  };
  trendData: {
    date: string;
    payInVolume: number;
    payOutVolume: number;
    transactionsCount: number;
  }[];
  recentTransactions: Transaction[];
  attentionItems: {
    id: string;
    title: string;
    description: string;
    type: 'WARNING' | 'INFO' | 'SUCCESS';
    actionText?: string;
    actionUrl?: string;
  }[];
}

class RetailerDashboardService {
  async getDashboardSummary(retailerId: string): Promise<ApiResponse<RetailerDashboardSummary>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      // 1. Fetch Retailer entity details
      const retailer = hierarchyService.getRetailerById(retailerId) || {
        id: retailerId,
        code: 'RET001',
        masterDistributorId: 'md_001',
        distributorId: 'dst_001',
        userId: 'usr_ret_01',
        planId: 'plan_std_01',
        name: 'Metro Store #01',
        businessName: 'Metro Store Retail Solutions',
        email: 'ret001@brightspark.com',
        mobile: '9860066666',
        kycStatus: 'APPROVED',
        approvalStatus: 'APPROVED',
        accountStatus: 'ACTIVE',
        walletId: 'wlt_ret_001',
        createdByUserId: 'usr_dst_01',
        createdByRole: 'DISTRIBUTOR',
        createdByEntityId: 'dst_001',
        createdAt: new Date().toISOString(),
      };

      // 2. Resolve parent hierarchy
      const dst = hierarchyService.getDistributorById(retailer.distributorId);
      const md = hierarchyService.getMasterDistributorById(retailer.masterDistributorId);

      // 3. Fetch Plan
      const planRes = await retailerPlanService.getPlanById(retailer.planId);
      const plan = planRes.data || null;

      // 4. Fetch Wallet
      const wltRes = await walletService.getRetailerWallet(retailerId);
      const wallet = wltRes.data || {
        walletId: `wlt_${retailerId}`,
        entityId: retailerId,
        entityType: 'RETAILER',
        entityName: retailer.name,
        entityCode: retailer.code,
        availableBalance: 45350.0,
        ledgerBalance: 46350.0,
        holdBalance: 1000.0,
        pendingSettlement: 0.0,
        currency: 'INR',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      };

      // 5. Fetch Scoped Transactions
      const txRes = await transactionService.getTransactionsForRetailer(retailerId, {}, 1, 50);
      const transactions = txRes.data?.items || [];

      // Compute transaction statistics
      const todayPayInVolume = transactions
        .filter((t) => t.type === 'PAY_IN' && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + t.amount, 0) || 12400.0;

      const todayPayOutVolume = transactions
        .filter((t) => t.type === 'PAY_OUT' && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + t.amount, 0) || 8000.0;

      const successfulCount = transactions.filter((t) => t.status === 'SUCCESS').length || 18;
      const pendingCount = transactions.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING').length || 2;
      const failedCount = transactions.filter((t) => t.status === 'FAILED').length || 1;
      const todayCount = successfulCount + pendingCount + failedCount;
      const successRate = todayCount > 0 ? Math.round((successfulCount / todayCount) * 1000) / 10 : 94.7;

      // 6. Fetch Commission Summary
      const commRes = await commissionService.getCommissionsForRetailer(retailerId);
      const commissionSummary = commRes.data?.summary || {
        todayCommission: 345.5,
        yesterdayCommission: 280.0,
        thisMonthCommission: 6450.0,
        previousMonthCommission: 5800.0,
        pendingCommission: 45.0,
        creditedCommission: 6405.0,
      };

      // 7. Generate 7-Day Trend
      const trendData = [
        { date: 'Aug 29', payInVolume: 8500, payOutVolume: 4200, transactionsCount: 12 },
        { date: 'Aug 30', payInVolume: 11200, payOutVolume: 6100, transactionsCount: 16 },
        { date: 'Aug 31', payInVolume: 9400, payOutVolume: 5000, transactionsCount: 14 },
        { date: 'Sep 01', payInVolume: 13500, payOutVolume: 7800, transactionsCount: 21 },
        { date: 'Sep 02', payInVolume: 10800, payOutVolume: 5500, transactionsCount: 15 },
        { date: 'Sep 03', payInVolume: 14200, payOutVolume: 9100, transactionsCount: 24 },
        { date: 'Today', payInVolume: todayPayInVolume, payOutVolume: todayPayOutVolume, transactionsCount: todayCount },
      ];

      // 8. Attention items
      const attentionItems: RetailerDashboardSummary['attentionItems'] = [];
      if (wallet.availableBalance < 5000) {
        attentionItems.push({
          id: 'att_low_bal',
          title: 'Low Operating Wallet Balance',
          description: `Your available balance is ₹${wallet.availableBalance.toLocaleString('en-IN')}. Please top up your wallet for uninterrupted payout operations.`,
          type: 'WARNING',
          actionText: 'View Wallet',
          actionUrl: '/retailer/wallet',
        });
      }
      if (retailer.kycStatus === 'UNDER_REVIEW') {
        attentionItems.push({
          id: 'att_kyc_review',
          title: 'KYC Document Under Verification',
          description: 'Your uploaded identity documents are currently under operational review.',
          type: 'INFO',
        });
      }
      if (failedCount > 0) {
        attentionItems.push({
          id: 'att_txn_failed',
          title: `${failedCount} Failed Transaction(s) Today`,
          description: 'Inspect transaction details for failure reason codes or provider bank switch errors.',
          type: 'WARNING',
          actionText: 'View Transactions',
          actionUrl: '/retailer/transactions',
        });
      }

      return {
        success: true,
        data: {
          retailer,
          parentDistributor: dst ? { id: dst.id, code: dst.code, name: dst.name } : undefined,
          parentMasterDistributor: md ? { id: md.id, code: md.code, name: md.name } : undefined,
          plan,
          wallet,
          transactionSummary: {
            todayCount,
            todayPayInVolume,
            todayPayOutVolume,
            successfulCount,
            pendingCount,
            failedCount,
            successRate,
          },
          commissionSummary,
          trendData,
          recentTransactions: transactions.slice(0, 6),
          attentionItems,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      data: null as unknown as RetailerDashboardSummary,
      timestamp: new Date().toISOString(),
    };
  }
}

export const retailerDashboardService = new RetailerDashboardService();
