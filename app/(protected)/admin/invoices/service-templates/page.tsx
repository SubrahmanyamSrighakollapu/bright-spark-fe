'use client';

import React, { useEffect, useState } from 'react';
import { FileCode2, Eye, Upload, CheckCircle2, Power } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, Card, EmptyState, Input, Select, Modal, useToast } from '@/components/ui';
import { serviceCategoryService, ServiceCategoryItem } from '@/services/serviceCategoryService';
import { invoiceService, ServiceTemplate } from '@/services/invoiceService';

const SAMPLE_TEMPLATE = `<!doctype html>
<html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;color:#172033;padding:32px}.header{border-bottom:3px solid #174f86;padding-bottom:16px}
.row{display:flex;justify-content:space-between;margin:10px 0}.total{font-size:20px;font-weight:700;border-top:2px solid #ddd;padding-top:14px}
</style></head><body><div class="header"><h1>BRIGHT SPARK</h1><p>Service Invoice {{invoiceNumber}}</p></div>
<div class="row"><span>Date</span><b>{{invoiceDate}}</b></div><div class="row"><span>Transaction</span><b>{{transactionReference}}</b></div>
<div class="row"><span>Customer</span><b>{{customerName}} / {{customerMobile}}</b></div><div class="row"><span>Service</span><b>{{serviceCategory}} - {{serviceProduct}}</b></div>
<div class="row"><span>Payment method</span><b>{{paymentMethod}}</b></div><div class="row"><span>Amount</span><b>INR {{amount}}</b></div>
<div class="row"><span>Service charge</span><b>INR {{charge}}</b></div><div class="row"><span>GST</span><b>INR {{gst}}</b></div>
<div class="row total"><span>Net amount</span><span>INR {{netAmount}}</span></div><p>Status: {{status}}</p></body></html>`;

export default function ServiceTemplatesPage() {
  const { toastSuccess, toastError } = useToast();
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [templateName, setTemplateName] = useState(''); const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [catalogue, configured] = await Promise.all([serviceCategoryService.getCategories(), invoiceService.getServiceTemplates()]);
      setCategories(catalogue.data ?? []); setTemplates(configured.data ?? []);
      if (!categoryId && catalogue.data?.[0]) setCategoryId(catalogue.data[0].id);
    } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to load service templates.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !categoryId) return toastError('Select a service and an invoice template file.');
    setSaving(true);
    try {
      await invoiceService.uploadServiceTemplate({ categoryId, templateName, file });
      toastSuccess('Invoice template saved for the selected service.'); setFile(null); setTemplateName(''); await load();
    } catch (error) { toastError(error instanceof Error ? error.message : 'Unable to save template.'); }
    finally { setSaving(false); }
  };

  const preview = async (id: string) => {
    try { const response = await invoiceService.previewServiceTemplate(id); setPreviewHtml(response.data?.renderedHtml ?? null); }
    catch (error) { toastError(error instanceof Error ? error.message : 'Unable to preview template.'); }
  };
  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE_TEMPLATE], { type: 'text/html' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'bright-spark-invoice-template.html'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <PageContainer title="Service Invoice Templates" description="Configure one invoice template for each admin-configured service category.">
    <div className="space-y-5">
      <Card title="Upload & map template" subtitle="Every service category has one template. Uploading again for the same service replaces its current template.">
        <form onSubmit={save} className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-end">
          <Select label="Service Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} options={categories.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))} required />
          <Input label="Template Name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. Electricity Bill Receipt" required />
          <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Invoice Template File</label><input type="file" accept=".html,.htm,.png,.jpg,.jpeg,text/html,image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[#F3F7E9] file:px-3 file:py-1 file:text-[#2F6F5E]" /></div>
          <div className="lg:col-span-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">Supports PNG/JPG designs up to 5 MB or HTML. HTML files must include <code>{'{{transactionReference}}'}</code>.</p>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={downloadSample} leftIcon={<FileCode2 className="h-4 w-4" />}>Download Sample</Button><Button type="submit" isLoading={saving} leftIcon={<Upload className="h-4 w-4" />}>Upload Template</Button></div>
          </div>
        </form>
      </Card>

      <Card title="Configured templates" subtitle={`${templates.length} service mappings saved`}>
        {loading ? <div className="py-12 text-center text-sm text-slate-500">Loading templates...</div> : templates.length === 0 ? <EmptyState title="No service templates configured" description="Upload the first invoice template for a service above." className="border-0 bg-transparent py-8 shadow-none" /> :
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b bg-slate-50 text-slate-600"><th className="p-3">Service</th><th className="p-3">Template</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{templates.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3"><b>{item.categoryName}</b><div className="text-slate-400">{item.categoryCode}</div></td><td className="p-3"><b>{item.templateName}</b><div className="text-slate-400">{item.fileName}</div></td><td className="p-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${item.isActive?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}><CheckCircle2 className="h-3 w-3"/>{item.isActive?'Active':'Inactive'}</span></td><td className="p-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => void preview(item.id)} leftIcon={<Eye className="h-3.5 w-3"/>}>Preview</Button><Button size="sm" variant="outline" onClick={async()=>{await invoiceService.setServiceTemplateStatus(item.id,!item.isActive);await load();}} leftIcon={<Power className="h-3.5 w-3"/>}>{item.isActive?'Disable':'Enable'}</Button></div></td></tr>)}</tbody></table></div>}
      </Card>
    </div>
    <Modal isOpen={Boolean(previewHtml)} onClose={() => setPreviewHtml(null)} title="Invoice Template Preview" size="xl"><iframe title="Invoice template preview" srcDoc={previewHtml ?? ''} sandbox="" className="h-[65vh] w-full rounded-lg border bg-white" /></Modal>
  </PageContainer>;
}
