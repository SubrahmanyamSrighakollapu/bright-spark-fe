/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Copy, ExternalLink, Link2, Plus, Share2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { FinancialPageHeader } from '@/components/features/financial/FinancialPageHeader';
import { Button, Card, Input, StatusBadge, useToast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { merchantPaymentService, type PaymentLink } from '@/services/merchantPaymentService';
import { formatCurrency } from '@/utils/formatters';

export default function PaymentLinksPage() {
  const { session } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const retailerId = session?.entityId || 'RET001';
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [description, setDescription] = useState('Customer payment');
  const [amount, setAmount] = useState('');
  const [expiry, setExpiry] = useState('2027-12-31');

  const load = () => setLinks(merchantPaymentService.getLinks(retailerId));
  useEffect(() => load(), [retailerId]);

  const getUrl = (token: string) => typeof window === 'undefined'
    ? `/pay/${token}`
    : `${window.location.origin}/pay/${token}`;

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toastSuccess('Payment link copied.');
  };

  const share = async (link: PaymentLink) => {
    const paymentUrl = getUrl(link.token);
    const text = `${link.description}${link.fixedAmount ? ` - ${formatCurrency(link.fixedAmount)}` : ''}\nPay securely: ${paymentUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: link.description, text, url: paymentUrl });
        return;
      } catch { /* user cancelled or browser rejected; use WhatsApp fallback */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const create = (event: FormEvent) => {
    event.preventDefault();
    if (!description.trim()) return toastError('Enter a payment purpose.');
    if (amount && Number(amount) <= 0) return toastError('Enter a valid fixed amount.');
    merchantPaymentService.createLink({
      retailerId,
      businessName: session?.name || 'Metro Store #01',
      description: description.trim(),
      fixedAmount: amount ? Number(amount) : undefined,
      expiresAt: new Date(`${expiry}T23:59:59`).toISOString(),
    });
    setAmount('');
    load();
    toastSuccess('Secure hosted payment link created.');
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-7xl space-y-6">
        <FinancialPageHeader
          title="Payment Links"
          subtitle="Create and share hosted checkout links. UPI QR collections are managed separately under QR Pay-In."
          statusBadge={<StatusBadge status="ACTIVE" label="Hosted checkout" />}
        />

        <Card title="Create payment link" subtitle="Use a fixed amount for an invoice, or leave it blank so the customer can enter the amount.">
          <form onSubmit={create} className="grid gap-4 md:grid-cols-4">
            <Input label="Payment purpose" required value={description} onChange={(event) => setDescription(event.target.value)} />
            <Input label="Fixed amount (optional)" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <Input label="Expires on" type="date" required value={expiry} onChange={(event) => setExpiry(event.target.value)} />
            <Button type="submit" className="self-end" leftIcon={<Plus className="h-4 w-4" />}>Create Link</Button>
          </form>
        </Card>

        <Card title="Active payment links" subtitle="Copy, share through WhatsApp or open the hosted customer checkout." noPadding>
          {links.length === 0 ? (
            <div className="py-14 text-center text-slate-500"><Link2 className="mx-auto mb-3 h-10 w-10" /><p>No payment links created yet.</p></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {links.map((link) => {
                const paymentUrl = getUrl(link.token);
                return (
                  <div key={link.token} className="grid gap-4 p-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(320px,1.4fr)_auto] lg:items-center">
                    <div className="min-w-0"><div className="flex items-center gap-2"><b className="truncate text-sm text-slate-900">{link.description}</b><StatusBadge status={link.status} /></div><p className="mt-1 text-xs text-slate-500">{link.fixedAmount ? `Fixed collection · ${formatCurrency(link.fixedAmount)}` : 'Open amount · customer enters value'}</p><p className="mt-1 text-[10px] text-slate-400">Expires {new Date(link.expiresAt).toLocaleDateString('en-IN')}</p></div>
                    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600"><p className="truncate" title={paymentUrl}>{paymentUrl}</p></div>
                    <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => copy(paymentUrl)} leftIcon={<Copy className="h-4 w-4" />}>Copy</Button><Button size="sm" variant="outline" onClick={() => share(link)} leftIcon={<Share2 className="h-4 w-4" />}>Share</Button><a href={`/pay/${link.token}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" leftIcon={<ExternalLink className="h-4 w-4" />}>Open</Button></a></div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-slate-700"><Link2 className="h-5 w-5 shrink-0 text-[#0F4C81]" /><p>A payment link opens the hosted customer checkout and processes payment through the configured gateway. For direct UPI QR scanning, UTR entry and receipt verification, use the separate <b>QR Pay-In</b> module.</p></div>
      </div>
    </PageContainer>
  );
}
