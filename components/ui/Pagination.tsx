'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  currentPage: number; totalPages: number; totalItems?: number; pageSize?: number;
  onPageChange: (page: number) => void; onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[]; className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems = 0, pageSize = 10, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100], className }) => {
  const pages = Math.max(1, totalPages);
  const page = Math.min(Math.max(1, currentPage), pages);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const visiblePages = Array.from({ length: Math.min(5, pages) }, (_, index) => {
    const first = Math.min(Math.max(1, page - 2), Math.max(1, pages - 4));
    return first + index;
  });

  return (
    <div className={cn('flex w-full flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <p className="text-xs font-semibold text-slate-700">Showing <span className="font-extrabold text-slate-950">{start}–{end}</span> of <span className="font-extrabold text-slate-950">{totalItems}</span> records</p>
        <p className="mt-0.5 text-[10px] text-slate-400">Page {page} of {pages}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">Rows per page
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>}
        <nav className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="Pagination">
          <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
          {visiblePages.map((number) => <button type="button" key={number} onClick={() => onPageChange(number)} aria-current={number === page ? 'page' : undefined} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-extrabold transition ${number === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-blue-700'}`}>{number}</button>)}
          <button type="button" disabled={page === pages} onClick={() => onPageChange(page + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
        </nav>
      </div>
    </div>
  );
};
