import React from 'react';
import { AddChargeConfigurationView } from '@/components/features/integrations/AddChargeConfigurationView';

export const metadata = {
  title: 'Charge Configuration | Qin Star Pay Admin',
  description: 'Define processing fee rules and GST tax configurations',
};

export default function ChargeConfigurationPage() {
  return <AddChargeConfigurationView />;
}
