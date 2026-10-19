'use client';

import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { CheckCircle2, Clock3, Download, Printer, RotateCcw, XCircle } from 'lucide-react';
import { Button, Card, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import type { AEPSTransaction } from '@/types/aeps';

const serviceNames = { CASH_WITHDRAWAL: 'Cash Withdrawal', BALANCE_ENQUIRY: 'Balance Enquiry', MINI_STATEMENT: 'Mini Statement', CASH_DEPOSIT: 'Cash Deposit' } as const;
const pdfAmount = (amount?: number) => amount == null ? 'Not applicable' : `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function downloadReceipt(transaction: AEPSTransaction) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 18;

  doc.setFillColor(47, 111, 94);
  doc.roundedRect(margin, y, width - margin * 2, 28, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('BRIGHT SPARK', margin + 7, y + 11);
  doc.setFontSize(10);
  doc.text('AEPS TRANSACTION RECEIPT', margin + 7, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.status, width - margin - 7, y + 15, { align: 'right' });
  y += 39;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(serviceNames[transaction.serviceType], margin, y);
  y += 8;

  const rows: Array<[string, string]> = [
    ['Transaction Reference', transaction.id],
    ['Date & Time', formatDateTime(transaction.createdAt)],
    ['Bank', transaction.bankName],
    ['Customer Aadhaar', transaction.maskedAadhaar],
    ['Customer Mobile', transaction.maskedMobile],
    ['Transaction Amount', pdfAmount(transaction.amount)],
    ['Available Balance', pdfAmount(transaction.customerBankBalance)],
    ['Status', transaction.status],
    ['Response', transaction.responseMessage],
  ];

  rows.forEach(([label, value], index) => {
    if (index % 2 === 0) { doc.setFillColor(246, 248, 250); doc.rect(margin, y - 5, width - margin * 2, 10, 'F'); }
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 4, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(value, width - margin - 4, y, { align: 'right', maxWidth: 105 });
    y += 10;
  });

  if (transaction.statement?.length) {
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Mini Statement', margin, y);
    y += 8;
    doc.setFillColor(47, 111, 94);
    doc.rect(margin, y - 5, width - margin * 2, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('DATE', margin + 3, y);
    doc.text('PARTICULARS', margin + 35, y);
    doc.text('DEBIT', margin + 105, y);
    doc.text('CREDIT', margin + 130, y);
    doc.text('BALANCE', width - margin - 3, y, { align: 'right' });
    y += 9;
    transaction.statement.forEach((entry, index) => {
      if (index % 2 === 0) { doc.setFillColor(246, 248, 250); doc.rect(margin, y - 5, width - margin * 2, 9, 'F'); }
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(entry.date, margin + 3, y);
      doc.text(entry.description, margin + 35, y, { maxWidth: 62 });
      doc.text(entry.debit == null ? '-' : pdfAmount(entry.debit), margin + 105, y);
      doc.text(entry.credit == null ? '-' : pdfAmount(entry.credit), margin + 130, y);
      doc.text(pdfAmount(entry.balance), width - margin - 3, y, { align: 'right' });
      y += 9;
    });
  }

  y += 10;
  doc.setDrawColor(212, 225, 174);
  doc.line(margin, y, width - margin, y);
  y += 8;
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('This is a system-generated receipt and does not require a signature.', width / 2, y, { align: 'center' });
  doc.text('Thank you for using Bright Spark AEPS.', width / 2, y + 5, { align: 'center' });
  doc.save(`${transaction.id}-receipt.pdf`);
}

export function AepsResult({ transaction, onNew }: { transaction: AEPSTransaction; onNew: () => void }) {
  const success = transaction.status === 'SUCCESS'; const failed = transaction.status === 'FAILED';
  const Icon = success ? CheckCircle2 : failed ? XCircle : Clock3;
  return <Card className="overflow-hidden !p-0"><div className={`p-6 text-center ${success ? 'bg-emerald-50' : failed ? 'bg-rose-50' : 'bg-amber-50'}`}><Icon className={`mx-auto h-16 w-16 ${success ? 'text-emerald-600' : failed ? 'text-rose-600' : 'text-amber-600'}`} /><h2 className="mt-3 text-xl font-extrabold text-slate-950">{success ? 'Transaction successful' : failed ? 'Transaction failed' : 'Transaction pending'}</h2><p className="mt-1 text-sm text-slate-600">{transaction.responseMessage}</p><div className="mt-3"><StatusBadge status={transaction.status} /></div></div>
    <div className="grid gap-3 p-5 sm:grid-cols-2">{[['Transaction reference', transaction.id], ['AEPS service', serviceNames[transaction.serviceType]], ['Bank', transaction.bankName], ['Customer identifier', transaction.maskedAadhaar], ['Customer mobile', transaction.maskedMobile], ['Amount', transaction.amount == null ? 'Not applicable' : formatCurrency(transaction.amount)], ['Date and time', formatDateTime(transaction.createdAt)], ['Provider response', transaction.responseMessage]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span><b className="mt-1 block text-sm text-slate-800">{value}</b></div>)}</div>
    {transaction.customerBankBalance != null && <div className="mx-5 mb-5 rounded-xl border border-[#D4E1AE] bg-[#F3F7E9] p-4"><span className="text-xs text-slate-600">Customer bank balance — separate from retailer wallet</span><strong className="mt-1 block text-2xl text-[#2F6F5E]">{formatCurrency(transaction.customerBankBalance)}</strong></div>}
    {transaction.statement && <div className="mx-5 mb-5 overflow-x-auto rounded-xl border border-slate-200"><div className="border-b border-slate-200 bg-slate-50 px-4 py-3"><b className="text-sm text-slate-900">Mini Statement</b><p className="text-[10px] text-slate-500">Recent entries from the customer’s Aadhaar-linked bank account.</p></div><table className="min-w-[620px] w-full text-left text-xs"><thead><tr className="text-slate-500">{['Date', 'Description / Particulars', 'Debit', 'Credit', 'Balance'].map((label) => <th key={label} className="px-4 py-2.5">{label}</th>)}</tr></thead><tbody>{transaction.statement.map((entry) => <tr key={entry.id} className="border-t border-slate-100"><td className="px-4 py-3">{entry.date}</td><td className="px-4 py-3">{entry.description}</td><td className="px-4 py-3 text-rose-700">{entry.debit == null ? '—' : formatCurrency(entry.debit)}</td><td className="px-4 py-3 text-emerald-700">{entry.credit == null ? '—' : formatCurrency(entry.credit)}</td><td className="px-4 py-3 font-bold">{formatCurrency(entry.balance)}</td></tr>)}</tbody></table></div>}
    <div className="border-t border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap justify-center gap-2">{success && <><Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => downloadReceipt(transaction)}>Download PDF Receipt</Button><Button variant="outline" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print</Button></>}<Button leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onNew}>{failed ? 'Retry as New Attempt' : 'New Transaction'}</Button><Link href="/retailer/aeps"><Button variant="ghost">Back to AEPS</Button></Link></div></div></Card>;
}


