import React from 'react';
import { PaymentGatewaySetupView } from '@/components/features/integrations/PaymentGatewaySetupView';

export const metadata = {
  title: 'Gateway Setup & Mapping | Qin Star Pay Admin',
  description: 'Map payment methods to gateways and configure provider API credentials',
};

export default function GatewaySetupPage() {
  return <PaymentGatewaySetupView />;
}
