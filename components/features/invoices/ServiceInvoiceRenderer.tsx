'use client';

import React from 'react';
import { Invoice, ServiceInvoiceConfig } from '@/types/domain';
import { MOCK_SERVICE_INVOICE_CONFIGS } from '@/mocks/mockServiceInvoices';
import { Button } from '@/components/ui/Button';
import { Printer, Building2, ShieldCheck } from 'lucide-react';

interface ServiceInvoiceRendererProps {
  invoice: Invoice;
  serviceConfig?: ServiceInvoiceConfig;
}

export function getEffectiveServiceConfig(invoice: Invoice, overrideConfig?: ServiceInvoiceConfig): ServiceInvoiceConfig {
  if (overrideConfig) return overrideConfig;
  if (invoice.serviceConfig) return invoice.serviceConfig;
  const found = MOCK_SERVICE_INVOICE_CONFIGS.find((s) => s.serviceCode === invoice.serviceCode);
  return found || MOCK_SERVICE_INVOICE_CONFIGS[6]!; // Default to Platform Default
}

export const ServiceInvoiceRenderer: React.FC<ServiceInvoiceRendererProps> = ({
  invoice,
  serviceConfig: propConfig,
}) => {
  const config = getEffectiveServiceConfig(invoice, propConfig);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.id} (${config.serviceName})</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
            .header-banner { background-color: ${config.primaryColor}; color: #ffffff; padding: 24px; border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .brand-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; margin: 0 0 4px 0; }
            .brand-subtitle { font-size: 12px; opacity: 0.9; margin: 0; }
            .invoice-tag { text-align: right; }
            .invoice-number { font-size: 20px; font-weight: 700; margin: 0; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
            .box-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${config.primaryColor}; margin: 0 0 8px 0; }
            .data-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
            .table th { background-color: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            .text-right { text-align: right; }
            .totals-container { width: 320px; margin-left: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .grand-total { font-size: 16px; font-weight: 800; color: ${config.primaryColor}; border-top: 2px solid #cbd5e1; padding-top: 8px; margin-top: 8px; }
            .footer-section { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px; font-size: 11px; color: #64748b; }
            .terms { background: #fff; border-left: 3px solid ${config.primaryColor}; padding: 10px 14px; font-size: 11px; margin-bottom: 16px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <h1 class="brand-title">${config.businessName}</h1>
              <p class="brand-subtitle">${config.legalName} &bull; ${config.serviceName}</p>
              <p class="brand-subtitle" style="margin-top:6px">GSTIN: <strong>${config.gstin}</strong> | PAN: <strong>${config.pan}</strong> | SAC: <strong>${config.sacCode}</strong></p>
            </div>
            <div class="invoice-tag">
              <h2 class="invoice-number">${invoice.id}</h2>
              <div style="font-size:12px; margin-top:4px; opacity:0.9">Category: ${invoice.invoiceType.replace(/_/g, ' ')}</div>
              <div style="font-size:12px; opacity:0.9">Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div style="font-size:12px; opacity:0.9">Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="box">
              <div class="box-title">Billed To (Client / Entity)</div>
              <div style="font-size:14px; font-weight:700; color:#0f172a">${invoice.entityName}</div>
              <div>Entity Code: <strong>${invoice.entityCode}</strong> (${invoice.entityType})</div>
              <div>GSTIN: ${invoice.gstin || 'N/A'}</div>
              <div>Address: ${invoice.billingAddress || 'Commercial Billing Address'}</div>
            </div>
            <div class="box">
              <div class="box-title">${config.serviceName} Remittance Bank Details</div>
              <div class="data-row"><span>Beneficiary:</span> <strong>${config.beneficiaryName}</strong></div>
              <div class="data-row"><span>Bank Name:</span> <strong>${config.bankName}</strong></div>
              <div class="data-row"><span>Account No:</span> <strong>${config.accountNumber}</strong></div>
              <div class="data-row"><span>IFSC Code:</span> <strong>${config.ifscCode}</strong></div>
              <div class="data-row"><span>Branch:</span> <span>${config.branchName}</span></div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Service Line Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Taxable Value</th>
                <th class="text-right">GST (${invoice.gstRate}%)</th>
                <th class="text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems
                .map(
                  (item) => `
                <tr>
                  <td>
                    <strong>${item.description}</strong>
                    <div style="font-size:11px; color:#64748b">SAC Code: ${config.sacCode} | Service Code: ${config.serviceCode}</div>
                  </td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${item.rate.toFixed(2)}</td>
                  <td class="text-right">₹${item.taxableAmount.toFixed(2)}</td>
                  <td class="text-right">₹${item.gstAmount.toFixed(2)}</td>
                  <td class="text-right"><strong>₹${item.totalAmount.toFixed(2)}</strong></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <div class="data-row"><span>Taxable Amount:</span> <span>₹${invoice.taxableAmount.toFixed(2)}</span></div>
            <div class="data-row"><span>CGST (${(invoice.gstRate / 2).toFixed(1)}%):</span> <span>₹${invoice.cgstAmount.toFixed(2)}</span></div>
            <div class="data-row"><span>SGST (${(invoice.gstRate / 2).toFixed(1)}%):</span> <span>₹${invoice.sgstAmount.toFixed(2)}</span></div>
            ${invoice.igstAmount > 0 ? `<div class="data-row"><span>IGST (${invoice.gstRate}%):</span> <span>₹${invoice.igstAmount.toFixed(2)}</span></div>` : ''}
            <div class="data-row" style="font-weight:700"><span>Gross Total:</span> <span>₹${invoice.grossAmount.toFixed(2)}</span></div>
            ${invoice.tdsApplicable ? `<div class="data-row" style="color:#e11d48"><span>TDS (${invoice.tdsRate}%):</span> <span>-₹${invoice.tdsAmount.toFixed(2)}</span></div>` : ''}
            <div class="data-row grand-total"><span>Net Receivable:</span> <span>₹${invoice.netReceivable.toFixed(2)}</span></div>
          </div>

          <div class="box" style="margin-bottom:16px">
            <div class="box-title">${config.serviceName} Terms & Conditions</div>
            <div class="terms">${config.termsAndConditions}</div>
          </div>

          <div class="footer-section">
            <div>${config.footerDeclaration}</div>
            <div style="margin-top:4px">For queries regarding this invoice, contact ${config.email} or call ${config.mobile}.</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Bar */}
      <div
        className="rounded-xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight">{config.serviceName}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 uppercase font-mono font-semibold">
                {config.templateStyle}
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              Template: {config.templateName} &bull; SAC Code: {config.sacCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="bg-white text-slate-900 hover:bg-slate-100 border-none font-semibold text-xs"
          >
            Print / Download PDF
          </Button>
        </div>
      </div>

      {/* Styled Invoice View Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 font-sans text-xs">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900" style={{ color: config.primaryColor }}>
              {config.businessName}
            </h2>
            <p className="text-slate-600 font-medium text-xs">{config.legalName}</p>
            <div className="mt-2 text-slate-500 space-y-0.5">
              <p>GSTIN: <strong className="text-slate-800 font-mono">{config.gstin}</strong> | PAN: <strong className="text-slate-800 font-mono">{config.pan}</strong> | SAC: <strong className="text-slate-800 font-mono">{config.sacCode}</strong></p>
              <p>{config.address}, {config.city}, {config.state} {config.pincode}</p>
              <p>Email: {config.email} | Support: {config.mobile}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700 mb-2">
              {invoice.status}
            </span>
            <h3 className="text-lg font-mono font-bold text-slate-900">{invoice.id}</h3>
            <p className="text-slate-500 font-medium mt-1">Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p className="text-slate-500 font-medium">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Client & Bank Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Billed To (Client)</h4>
            <p className="font-bold text-sm text-slate-900">{invoice.entityName}</p>
            <p className="text-slate-600">Code: <span className="font-mono font-semibold">{invoice.entityCode}</span> ({invoice.entityType})</p>
            <p className="text-slate-600">GSTIN: {invoice.gstin || 'N/A'}</p>
            <p className="text-slate-600">{invoice.billingAddress || 'Commercial Billing Address'}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Building2 className="w-3.5 h-3.5" style={{ color: config.primaryColor }} />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{config.serviceName} Bank Account</h4>
            </div>
            <p className="text-slate-700">Beneficiary: <strong className="text-slate-900">{config.beneficiaryName}</strong></p>
            <p className="text-slate-700">Bank: <strong className="text-slate-900">{config.bankName}</strong> ({config.branchName})</p>
            <p className="text-slate-700">Account No: <strong className="font-mono text-slate-900">{config.accountNumber}</strong></p>
            <p className="text-slate-700">IFSC Code: <strong className="font-mono text-slate-900">{config.ifscCode}</strong></p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-300">
                <th className="p-3">Service Line Description</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Taxable Value</th>
                <th className="p-3 text-right">GST ({invoice.gstRate}%)</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">{item.description}</p>
                    <p className="text-[11px] text-slate-500 font-mono">SAC Code: {config.sacCode} | Service Code: {config.serviceCode}</p>
                  </td>
                  <td className="p-3 text-right font-mono">{item.quantity}</td>
                  <td className="p-3 text-right font-mono">₹{item.rate.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">₹{item.taxableAmount.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">₹{item.gstAmount.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{item.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end">
          <div className="w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value:</span>
              <span>₹{invoice.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST ({(invoice.gstRate / 2).toFixed(1)}%):</span>
              <span>₹{invoice.cgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST ({(invoice.gstRate / 2).toFixed(1)}%):</span>
              <span>₹{invoice.sgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
              <span>Gross Total:</span>
              <span>₹{invoice.grossAmount.toFixed(2)}</span>
            </div>
            {invoice.tdsApplicable && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>TDS ({invoice.tdsRate}%):</span>
                <span>-₹{invoice.tdsAmount.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between text-base font-extrabold border-t-2 border-slate-300 pt-2"
              style={{ color: config.primaryColor }}
            >
              <span>Net Receivable:</span>
              <span>₹{invoice.netReceivable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Footer */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div>
            <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-1">{config.serviceName} Terms & Conditions</h5>
            <p className="text-slate-600 whitespace-pre-line text-[11px] leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 font-mono">
              {config.termsAndConditions}
            </p>
          </div>
          <p className="text-center text-slate-500 text-[11px] italic pt-2">
            {config.footerDeclaration}
          </p>
        </div>
      </div>
    </div>
  );
};
