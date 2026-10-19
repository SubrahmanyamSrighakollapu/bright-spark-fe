import React from 'react';
import { PrivacyPolicyView } from '@/components/features/website/PrivacyPolicyView';

export const metadata = {
  title: 'Privacy Policy | Bright Spark Admin',
  description: 'Edit and publish platform data collection and privacy terms',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
