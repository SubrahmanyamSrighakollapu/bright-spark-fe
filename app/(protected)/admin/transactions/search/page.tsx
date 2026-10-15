'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useModal } from '@/hooks/useModal';
import { transactionService } from '@/services/transactionService';
import { Transaction, PaginationState } from '@/types/domain';
import { TransactionTable } from '@/components/features/transactions/TransactionTable';
import { TransactionDetailsDrawer } from '@/components/features/transactions/TransactionDetailsDrawer';
import { Search, RefreshCw } from 'lucide-react';

export default function TransactionSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const detailDrawer = useModal<Transaction>();

  const handleSearch = async (e?: React.FormEvent, page=1, pageSize=pagination.pageSize) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await transactionService.searchTransactions(searchQuery.trim(), undefined, page, pageSize);
      if (res.success && res.data) {
        setResults(res.data.items);
        setPagination(res.data.pagination);

        // If exactly 1 strong match, open drawer automatically
        if (res.data.pagination.totalItems === 1) {
          detailDrawer.open(res.data.items[0]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setHasSearched(false);
    setResults([]);
    setPagination({page:1,pageSize:10,totalItems:0,totalPages:1});
  };

  return (
    <PageContainer
      title="Transaction Search"
      description="Support & Operations search tool for Txn ID, Order ID, UTR, or Mobile Number."
      className="space-y-6"
    >
      {/* Search Input Bar */}
      <Card title="Search Parameters" subtitle="Instant lookup across all operational switches">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter Transaction ID (QSP...), Order ID (ORD...), UTR, or Mobile Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="h-11 text-sm font-mono"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isLoading}
                leftIcon={<Search className="w-4 h-4" />}
                className="h-11 px-6"
              >
                Search
              </Button>

              {hasSearched && (
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={handleClear}
                  className="h-11 px-4"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="text-[11px] text-[var(--text-muted)]">Searches persisted Pay-In and Pay-Out records by transaction ID, order ID, provider reference, UTR/RRN, Retailer, customer, beneficiary, or mobile number.</div>
        </form>
      </Card>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span>
              Search Results ({pagination.totalItems} record{pagination.totalItems === 1 ? '' : 's'} found)
            </span>
            {isLoading && (
              <span className="flex items-center gap-1 text-[var(--primary)]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Searching...
              </span>
            )}
          </div>

          {results.length === 0 && !isLoading ? (
            <EmptyState
              title="No Transaction Found"
              description={`No transaction records match "${searchQuery}". Please check the Transaction ID, Order ID or UTR and try again.`}
              action={
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear Search
                </Button>
              }
            />
          ) : (
            <TransactionTable
              transactions={results}
              pagination={pagination}
              onPageChange={(page) => void handleSearch(undefined,page,pagination.pageSize)}
              onPageSizeChange={(pageSize) => void handleSearch(undefined,1,pageSize)}
              onViewDetails={(tx) => detailDrawer.open(tx)}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* Unified 880px Details Drawer */}
      <TransactionDetailsDrawer
        isOpen={detailDrawer.isOpen}
        onClose={detailDrawer.close}
        transaction={detailDrawer.data}
        onRefresh={() => handleSearch()}
      />
    </PageContainer>
  );
}
