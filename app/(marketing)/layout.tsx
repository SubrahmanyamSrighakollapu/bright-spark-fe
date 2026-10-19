import type { Metadata } from 'next';
import './marketing.css';

export const metadata: Metadata = {
  title: {
    default: 'Bright Spark Travel',
    template: '%s | Bright Spark Travel',
  },
  description: 'Discover travel experiences, destinations, stays, tours, and services with Bright Spark.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="marketing-site">{children}</div>;
}
