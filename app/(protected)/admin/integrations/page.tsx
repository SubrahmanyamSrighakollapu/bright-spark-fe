import React from 'react';
import { AddPaymentGatewayView } from '@/components/features/integrations/AddPaymentGatewayView';

export const metadata = {
  title: 'Add Payment Gateway | Bright Spark Admin',
  description: 'Register and manage payment processing gateway providers',
};

export default function IntegrationsPage() {
  return <AddPaymentGatewayView />;
}
