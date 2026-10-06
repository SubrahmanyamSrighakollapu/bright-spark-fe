import React from 'react';
import { InvoiceDetailsView } from '@/components/features/administration/InvoiceDetailsView';

export const metadata = {
  title: 'Invoice Details Configuration | Qin Star Pay Admin',
  description: 'Configure company legal details, GSTIN, logos, and printable invoice terms',
};

export default function InvoiceDetailsPage() {
  return <InvoiceDetailsView />;
}
