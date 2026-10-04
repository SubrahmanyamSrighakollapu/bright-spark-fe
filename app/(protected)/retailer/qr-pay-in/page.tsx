'use client';

import { useCallback, useState } from 'react';
import { CheckCircle2, Copy, Download, ImageUp, MessageCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { PaymentQr } from '@/components/features/retailer/PaymentQr';
import { Button, Card, Input, Select, StatusBadge, Table, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { merchantPaymentService, QrPayInSubmission } from '@/services/merchantPaymentService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ColumnDefinition } from '@/types/common';

export default function QrPayInPage() {
  const { session } = useAuth();
  const { toastError, toastSuccess, toastInfo } = useToast();
  const retailerId = session?.entityId || 'RET001';
  const accounts = merchantPaymentService.getActiveQrAccounts();
  const [selectedId, setSelectedId] = useState(accounts[0]?.id || '');
  const [payerName, setPayerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [receipt, setReceipt] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [submissions, setSubmissions] = useState(() => merchantPaymentService.getQrSubmissions(retailerId));
  const selected = accounts.find((account) => account.id === selectedId) || accounts[0];

  const upiParams = new URLSearchParams({ pa: selected.upiId, pn: selected.payeeName, cu: 'INR', tn: `QR Pay-In ${retailerId}` });
  if (Number(amount) > 0) upiParams.set('am', Number(amount).toFixed(2));
  const upiUri = `upi://pay?${upiParams.toString()}`;
  const handleQrReady = useCallback((dataUrl: string) => setQrDataUrl(dataUrl), []);

  const copyUpi = async () => { await navigator.clipboard.writeText(selected.upiId); toastSuccess('UPI ID copied.'); };
  const downloadQr = () => { const link = document.createElement('a'); link.href = qrDataUrl; link.download = `${selected.provider.replace(/\s+/g, '-')}-upi-qr.png`; link.click(); };
  const shareQr = async () => {
    const message = `Pay ${selected.payeeName} via UPI\nUPI ID: ${selected.upiId}${amount ? `\nAmount: ${formatCurrency(Number(amount))}` : ''}`;
    try {
      const blob = await (await fetch(qrDataUrl)).blob();
      const file = new File([blob], `${selected.provider}-QR.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${selected.provider} payment QR`, text: message, files: [file] });
        return;
      }
    } catch { /* use WhatsApp text fallback */ }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n\nOpen this UPI payment: ${upiUri}`)}`, '_blank', 'noopener,noreferrer');
    toastInfo('WhatsApp opened. Download the QR first if you also want to attach its image.');
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (payerName.trim().length < 2) return toastError('Enter the customer name.');
    if (!/^[6-9]\d{9}$/.test(mobile)) return toastError('Enter a valid 10-digit mobile number.');
    if (numericAmount < selected.minAmount || numericAmount > selected.maxAmount) return toastError(`Amount must be between ${formatCurrency(selected.minAmount)} and ${formatCurrency(selected.maxAmount)}.`);
    if (utr.trim().length < 8) return toastError('Enter a valid bank UTR/reference.');
    if (!receipt) return toastError('Upload the payment receipt image.');
    try {
      merchantPaymentService.submitQrPayIn({ retailerId, qrAccountId: selected.id, payerName: payerName.trim(), mobile, email: email.trim() || undefined, amount: numericAmount, utr: utr.trim(), receiptName: receipt });
      setSubmissions(merchantPaymentService.getQrSubmissions(retailerId));
      setPayerName(''); setMobile(''); setEmail(''); setAmount(''); setUtr(''); setReceipt('');
      toastSuccess('QR transaction submitted for UTR verification.');
    } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to submit transaction.'); }
  };

  const columns: ColumnDefinition<QrPayInSubmission>[] = [
    { key: 'id', header: 'Submission', render: (row: QrPayInSubmission) => <div><b className="font-mono text-[#0F4C81]">{row.id}</b><small className="block text-slate-500">{formatDateTime(row.createdAt)}</small></div> },
    { key: 'payerName', header: 'Customer' },
    { key: 'utr', header: 'UTR', render: (row: QrPayInSubmission) => <span className="font-mono">{row.utr}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (row: QrPayInSubmission) => <b>{formatCurrency(row.amount)}</b> },
    { key: 'status', header: 'Reconciliation', render: (row: QrPayInSubmission) => <StatusBadge status={row.status} /> },
  ];

  return <PageContainer><div className="mx-auto max-w-7xl space-y-6">
    <FinancialPageHeader title="QR Pay-In" subtitle="Select an active UPI collection account, collect payment, and submit the UTR for reconciliation." statusBadge={<StatusBadge status="ACTIVE" label={`${accounts.length} QR routes live`} />} />
    <Card title="Pay via QR" subtitle="Only active, working QR routes configured for your account are shown.">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Select label="1. Select collection QR" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} options={accounts.map((account) => ({ value: account.id, label: `${account.label} · ${account.provider}` }))} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-center"><PaymentQr value={upiUri} size={224} onReady={handleQrReady} /></div>
            <div className="mt-3 text-center"><b>{selected.provider} QR</b><button onClick={copyUpi} className="mx-auto mt-1 flex items-center gap-1 text-xs font-mono text-[#0F4C81] cursor-pointer"><Copy className="h-3 w-3" />{selected.upiId}</button></div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-slate-700"><b className="block text-[#0F4C81]">{selected.provider} pricing</b><span>{selected.pricing}</span><span className="mt-1 block">Limit: {formatCurrency(selected.minAmount)} – {formatCurrency(selected.maxAmount)}</span></div>
          <div className="grid grid-cols-2 gap-2"><Button variant="outline" disabled={!qrDataUrl} onClick={downloadQr} leftIcon={<Download className="h-4 w-4" />}>Download QR</Button><Button disabled={!qrDataUrl} onClick={shareQr} leftIcon={<MessageCircle className="h-4 w-4" />}>Share</Button></div>
          <a href={upiUri} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-800 md:hidden"><Smartphone className="h-4 w-4" />Open in UPI app</a>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div><h3 className="font-bold text-slate-900">2. Enter payment details</h3><p className="mt-1 text-xs text-slate-500">Submit only after the customer sees a successful payment in their UPI app.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Customer name" required value={payerName} onChange={(e) => setPayerName(e.target.value)} /><Input label="Mobile number" required inputMode="numeric" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} /><Input label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} containerClassName="sm:col-span-2" /><Input label="Amount" required type="number" min={selected.minAmount} max={selected.maxAmount} value={amount} onChange={(e) => setAmount(e.target.value)} helperText="The QR updates automatically with this amount." /><Input label="Bank UTR / reference" required value={utr} onChange={(e) => setUtr(e.target.value)} /></div>
          <label className="block text-xs font-semibold text-slate-700">Receipt image <span className="text-rose-600">*</span><span className="mt-1 flex h-24 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50"><ImageUp className="h-5 w-5 text-[#0F4C81]" /><span>{receipt || 'Drag & drop or browse · JPG, PNG or PDF · max 5 MB'}</span><input type="file" className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={(e) => { const file = e.target.files?.[0]; if (file && file.size > 5 * 1024 * 1024) return toastError('Receipt must be 5 MB or smaller.'); setReceipt(file?.name || ''); }} /></span></label>
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-slate-700"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />The UTR is checked for duplicates and reconciled before this payment is marked verified.</div>
          <Button type="submit" fullWidth size="lg" leftIcon={<CheckCircle2 className="h-4 w-4" />}>Submit QR transaction</Button>
        </form>
      </div>
    </Card>
    <Card title="Recent QR submissions" subtitle="Transactions remain submitted until the UTR is reconciled." noPadding><Table columns={columns} data={submissions} keyExtractor={(row) => row.id} emptyTitle="No QR transactions submitted" emptyDescription="Completed QR payments will appear here after you submit their UTR and receipt." /></Card>
  </div></PageContainer>;
}
