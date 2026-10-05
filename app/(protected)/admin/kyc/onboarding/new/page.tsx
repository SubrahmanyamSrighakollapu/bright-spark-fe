'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { MerchantOnboardingWizard } from '@/components/features/onboarding/MerchantOnboardingWizard';
import { ArrowLeft } from 'lucide-react';

export default function NewMerchantOnboardingPage() {
  return (
    <PageContainer
      title="New Retailer Onboarding"
      description="Register a new commercial retailer account and initiate KYC verification."
      actions={
        <Link href="/admin/kyc/onboarding">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Onboarding List
          </Button>
        </Link>
      }
      className="space-y-6"
    >
      <MerchantOnboardingWizard />
    </PageContainer>
  );
}
