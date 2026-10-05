'use client';

import React from 'react';
import { Paginator, type PaginatorPageChangeEvent } from 'primereact/paginator';
import { cn } from '@/utils/cn';

export interface PaginationProps { currentPage: number; totalPages: number; totalItems?: number; pageSize?: number; onPageChange: (page: number) => void; onPageSizeChange?: (size: number) => void; pageSizeOptions?: number[]; className?: string; }

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, pageSize = 10, onPageChange, onPageSizeChange, pageSizeOptions = [10, 25, 50, 100], className }) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safeTotalItems = totalItems ?? safeTotalPages * pageSize;
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;
  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    if (event.rows !== pageSize) onPageSizeChange?.(event.rows);
    onPageChange(event.page + 1);
  };

  return (
    <div className={cn('w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xs text-xs text-[var(--text-secondary)]', className)}>
      <div className="tabular-nums font-medium">
        {totalItems !== undefined ? <>Showing <strong className="text-[var(--text-primary)]">{startItem}</strong> to <strong className="text-[var(--text-primary)]">{endItem}</strong> of <strong className="text-[var(--text-primary)]">{totalItems}</strong> entries</> : <>Page <strong>{currentPage}</strong> of <strong>{safeTotalPages}</strong></>}
      </div>
      <Paginator
        first={(currentPage - 1) * pageSize}
        rows={pageSize}
        totalRecords={safeTotalItems}
        rowsPerPageOptions={onPageSizeChange ? pageSizeOptions : undefined}
        onPageChange={handlePageChange}
        template={onPageSizeChange ? 'RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'}
        className="qs-paginator"
        unstyled
      />
    </div>
  );
};
