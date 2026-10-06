'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/domain';
import { PayOutPreviewResult } from '@/services/payOutService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Button, StatusBadge } from '@/components/ui';
import { Printer, Copy, Check, ShieldCheck, Store, UserCheck, ArrowUpRight, CreditCard } from 'lucide-react';

interface PayOutReceiptProps {
  transaction: Transaction;
  preview?: PayOutPreviewResult;
  retailerName?: string;
  retailerCode?: string;
  businessName?: string;
}

export const PayOutReceipt: React.FC<PayOutReceiptProps> = ({
  transaction,
  preview,
  retailerName = 'Metro Store #01',
  retailerCode = 'RET001',
  businessName = 'Metro Store Retail Solutions',
}) => {
  const [copyType, setCopyType] = useState<'RETAILER' | 'BENEFICIARY'>('RETAILER');
  const [copied, setCopied] = useState(false);

  const isSuccess = transaction.status === 'SUCCESS';
  const charges = transaction.fee || preview?.customerCharge || preview?.charges || 0;
  const gst = transaction.gst || preview?.gstAmount || preview?.gst || 0;
  const totalDebit = preview?.totalWalletDebit || preview?.totalAmount || transaction.netAmount || (transaction.amount + charges + gst);
  const commission = preview?.retailerCommissionAmount || 3.5;
  const maskedAccount = transaction.accountNumberMasked || transaction.beneficiaryAccount || 'N/A';

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
=== QIN STAR PAY - PAY-OUT DISBURSEMENT RECEIPT ===
Txn ID: ${transaction.transactionRef}
Disbursement Reference: ${transaction.orderId}
Date: ${formatDateTime(transaction.createdAt)}
Status: ${transaction.status}
Retailer: ${retailerName} (${retailerCode})
Beneficiary: ${transaction.beneficiaryName || 'N/A'}
Bank Account: ${maskedAccount}
IFSC: ${transaction.beneficiaryIfsc || 'N/A'}
Bank: ${transaction.beneficiaryBank || 'N/A'}
Payment Mode: ${transaction.paymentMode || 'IMPS'}
---------------------------------------------------
Transfer Amount: ${formatCurrency(transaction.amount)}
Processing Fee: ${formatCurrency(charges)}
GST (18%): ${formatCurrency(gst)}
Total Wallet Debit: ${formatCurrency(totalDebit)}
${transaction.utr ? `UTR / Ref: ${transaction.utr}` : ''}
================================-------------------
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Copy Selector & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 print:hidden">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setCopyType('RETAILER')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              copyType === 'RETAILER'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retailer Copy
          </button>
          <button
            type="button"
            onClick={() => setCopyType('BENEFICIARY')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              copyType === 'BENEFICIARY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Beneficiary Copy
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied!' : 'Copy Summary'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Printable Receipt Container */}
      <div className="p-6 rounded-2xl border border-slate-300 bg-white shadow-md text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-700 text-lg tracking-tight">QIN STAR PAY</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 border text-slate-700">
                {copyType === 'RETAILER' ? 'Retailer Copy' : 'Beneficiary Copy'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Pay-Out Disbursement Receipt</p>
          </div>

          <div className="text-right">
            <StatusBadge status={transaction.status} label={transaction.status} size="sm" />
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              {formatDateTime(transaction.createdAt)}
            </p>
          </div>
        </div>

        {/* Counter & Beneficiary Details */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-indigo-600" /> Retailer Counter
            </p>
            <p className="font-bold text-slate-900">{retailerName}</p>
            <p className="text-slate-500 font-mono text-[11px]">Code: {retailerCode}</p>
            <p className="text-slate-500 text-[11px] truncate">{businessName}</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Beneficiary Details
            </p>
            <p className="font-semibold text-slate-900">{transaction.beneficiaryName || 'Beneficiary Customer'}</p>
            <p className="text-slate-700 font-mono text-[11px] font-bold">Account: {maskedAccount}</p>
            <p className="text-slate-500 font-mono text-[11px]">IFSC: {transaction.beneficiaryIfsc || 'N/A'}</p>
            <p className="text-slate-500 text-[11px]">{transaction.beneficiaryBank || 'State Bank of India'}</p>
          </div>
        </div>

        {/* Transaction Metadata Table */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-bold text-indigo-600">{transaction.transactionRef}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Disbursement Reference:</span>
            <span className="font-bold text-[#0F4C81]">{transaction.orderId}</span>
          </div>
          {transaction.utr && (
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">UTR / Bank Ref:</span>
              <span className="font-bold text-emerald-700">{transaction.utr}</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Service Category:</span>
            <span className="font-semibold text-slate-800">{transaction.service || 'Bank Account Disbursement'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Disbursement Mode:</span>
            <span className="font-semibold text-slate-800">{transaction.paymentMode || 'IMPS'}</span>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Transfer Amount (Beneficiary Receives):</span>
            <span className="font-mono font-semibold text-slate-900">{formatCurrency(transaction.amount)}</span>
          </div>
          {copyType === 'RETAILER' && (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Processing Fee:</span>
                <span className="font-mono">{formatCurrency(charges)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%):</span>
                <span className="font-mono">{formatCurrency(gst)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-300">
                <span>Total Wallet Debit:</span>
                <span className="font-mono text-lg text-rose-700">-{formatCurrency(totalDebit)}</span>
              </div>

              {isSuccess && (
                <div className="mt-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Retailer Commission Earned:
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">+{formatCurrency(commission)}</span>
                </div>
              )}
            </>
          )}

          {copyType === 'BENEFICIARY' && (
            <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-300">
              <span>Total Disbursed Amount:</span>
              <span className="font-mono text-lg text-emerald-700">{formatCurrency(transaction.amount)}</span>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-0.5">
          <p className="flex items-center justify-center gap-1 font-semibold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized Qin Star Pay Disbursement Receipt
          </p>
          <p>Funds dispatched safely via banking switch network.</p>
        </div>
      </div>
    </div>
  );
};
