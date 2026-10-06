import React from 'react';
import { TermsAndConditionsView } from '@/components/features/website/TermsAndConditionsView';

export const metadata = {
  title: 'Terms & Conditions | Qin Star Pay Admin',
  description: 'Maintain legal user service agreements and platform usage terms',
};

export default function TermsPage() {
  return <TermsAndConditionsView />;
}
