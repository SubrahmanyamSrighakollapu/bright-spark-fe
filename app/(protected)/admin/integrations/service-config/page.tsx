'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useModal } from '@/hooks/useModal';
import { providerService } from '@/services/providerService';
import { ServiceConfiguration } from '@/types/domain';
import { ServiceConfigTable } from '@/components/features/integrations/ServiceConfigTable';
import { EditServiceConfigModal } from '@/components/features/integrations/EditServiceConfigModal';

export default function ServiceConfigPage() {
  const [configs, setConfigs] = useState<ServiceConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const editModal = useModal<ServiceConfiguration>();

  const loadConfigs = () => {
    setIsLoading(true);
    providerService.getServiceConfigs().then((res) => {
      if (res.success && res.data) {
        setConfigs(res.data);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isCancelled = false;
    providerService.getServiceConfigs().then((res) => {
      if (!isCancelled && res.success && res.data) {
        setConfigs(res.data);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSaveConfig = async (id: string, updates: Partial<ServiceConfiguration>) => {
    await providerService.updateServiceConfig(id, updates);
    loadConfigs();
  };

  return (
    <PageContainer
      title="Service Configuration"
      description="Configure which provider supports which Bright Spark service, supported payment modes, and min/max transaction limits."
    >
      <div className="space-y-6">
        <ServiceConfigTable
          data={configs}
          isLoading={isLoading}
          onEditServiceConfig={(cfg) => editModal.open(cfg)}
        />

        <EditServiceConfigModal
          isOpen={editModal.isOpen}
          onClose={editModal.close}
          config={editModal.data}
          onSave={handleSaveConfig}
        />
      </div>
    </PageContainer>
  );
}
