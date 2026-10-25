import type { Metadata } from 'next';
import './marketing.css';
import './fintech.css';

export const metadata: Metadata = {
  title: {
    default: 'Bright Spark',
    template: '%s | Bright Spark',
  },
  description: 'Connected digital payment services and financial operations for growing business networks.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="marketing-site">{children}</div>;
}
