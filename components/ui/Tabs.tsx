'use client';

import React from 'react';
import { TabMenu, type TabMenuTabChangeEvent } from 'primereact/tabmenu';
import type { MenuItem } from 'primereact/menuitem';
import { TabItem } from '@/types/common';
import { cn } from '@/utils/cn';

export interface TabsProps { items: TabItem[]; activeTab: string; onChange: (tabId: string) => void; variant?: 'line' | 'pills'; className?: string; }

export const Tabs: React.FC<TabsProps> = ({ items, activeTab, onChange, variant = 'line', className }) => {
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeTab));
  const model: MenuItem[] = items.map((tab) => ({
    label: tab.label,
    disabled: tab.disabled,
    template: (_item: MenuItem, options: { onClick: (event: React.MouseEvent<HTMLElement>) => void }) => {
      const selected = activeTab === tab.id;
      return (
        <button
          type="button"
          role="tab"
          aria-selected={selected}
          disabled={tab.disabled}
          onClick={options.onClick}
          className={cn('inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap select-none cursor-pointer', tab.disabled && 'opacity-40 cursor-not-allowed', variant === 'line' ? selected ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border-b-2 border-transparent' : selected ? 'bg-white text-[var(--text-primary)] shadow-xs rounded-[var(--radius-sm)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[var(--radius-sm)]')}
        >
          {tab.icon && <span className="h-4 w-4 shrink-0">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge !== undefined && <span className={cn('rounded-full px-1.5 text-[10px] font-bold', selected ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'bg-slate-200 text-slate-600')}>{tab.badge}</span>}
        </button>
      );
    },
  }));

  return <TabMenu model={model} activeIndex={activeIndex} onTabChange={(event: TabMenuTabChangeEvent) => onChange(items[event.index].id)} className={cn('qs-tabmenu overflow-x-auto no-scrollbar', variant === 'line' ? 'border-b border-[var(--border)]' : 'rounded-[var(--radius-md)] bg-[var(--bg-secondary)] p-1', className)} unstyled />;
};
