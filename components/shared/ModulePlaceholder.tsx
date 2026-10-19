import React from 'react';
import { Layers } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface ModulePlaceholderProps {
  title: string;
  moduleCode: string;
  description?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  moduleCode,
  description = 'Operational module interface for Bright Spark operations platform.',
}) => {
  return (
    <PageContainer
      title={title}
      description={description}
      statusBadge={<StatusBadge status="ACTIVE" label="OPERATIONAL" />}
    >
      <Card className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shadow-xs">
          <Layers className="w-7 h-7" />
        </div>

        <div className="space-y-1 max-w-md">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Module endpoint <code className="px-2 py-0.5 bg-slate-100 font-mono text-[var(--primary)] rounded text-[11px]">{moduleCode}</code> is active within the application shell.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
};
