"use client";

import React, { ReactNode } from 'react';
import { DataTable, type DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnDefinition } from '@/types/common';
import { cn } from '@/utils/cn';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export interface TableProps<T extends object> {
  columns: ColumnDefinition<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  actionHeader?: ReactNode;
  renderActions?: (row: T) => ReactNode;
}

export function Table<T extends object>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching the current query.',
  onRowClick,
  className,
  actionHeader = 'Actions',
  renderActions,
}: TableProps<T>) {
  void keyExtractor;
  if (isLoading) return <LoadingSkeleton variant="table" count={5} />;
  if (!data?.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="min-h-[280px] rounded-none border-0 bg-transparent shadow-none"
      />
    );
  }

  const rowIndex = (row: T) => data.indexOf(row);
  const alignment = (align?: ColumnDefinition<T>['align']) =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <DataTable
      value={data}
      rowHover
      onRowClick={onRowClick ? (event: DataTableRowClickEvent) => onRowClick(event.data as T) : undefined}
      className={cn('qs-datatable w-full overflow-auto bg-transparent', onRowClick && 'qs-datatable-clickable', className)}
      tableClassName="w-full border-collapse text-left text-sm"
      unstyled
    >
      {columns.map((col) => (
        <Column
          key={col.key}
          field={col.key}
          header={col.header}
          sortable={col.sortable}
          style={{ width: col.width, minWidth: col.minWidth }}
          headerClassName={cn('sticky top-0 z-10 bg-slate-50 px-4 py-3 font-semibold select-none whitespace-nowrap shadow-[inset_0_-1px_0_#e2e8f0]', alignment(col.align), col.headerClassName)}
          bodyClassName={cn('px-4 py-3.5 align-middle text-xs font-normal tabular-nums', alignment(col.align), col.className)}
          body={(row: T) => {
            const index = rowIndex(row);
            const value = (row as Record<string, unknown>)[col.key];
            return col.render ? col.render(row, index) : (value as ReactNode) ?? '-';
          }}
        />
      ))}
      {renderActions && (
        <Column
          header={actionHeader}
          headerClassName="sticky top-0 z-10 bg-slate-50 px-4 py-3 text-right font-semibold select-none whitespace-nowrap shadow-[inset_0_-1px_0_#e2e8f0]"
          bodyClassName="px-4 py-3 text-right align-middle"
          body={(row: T) => (
            <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
              {renderActions(row)}
            </div>
          )}
        />
      )}
    </DataTable>
  );
}
