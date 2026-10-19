import React from 'react';
import { ScrollTextManagerView } from '@/components/features/administration/ScrollTextManagerView';

export const metadata = {
  title: 'Scroll Text Manager | Bright Spark Admin',
  description: 'Publish real-time scrolling news tickers',
};

export default function TickerPage() {
  return <ScrollTextManagerView />;
}
