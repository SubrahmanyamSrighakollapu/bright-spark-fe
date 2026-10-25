import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/transactions', destination: '/admin/transactions', permanent: false },
      { source: '/transactions/:path*', destination: '/admin/transactions/:path*', permanent: false },
      { source: '/wallet', destination: '/admin/wallet', permanent: false },
      { source: '/wallet/:path*', destination: '/admin/wallet/:path*', permanent: false },
      { source: '/reports', destination: '/admin/reports', permanent: false },
      { source: '/reports/:path*', destination: '/admin/reports/:path*', permanent: false },
      { source: '/logs', destination: '/admin/logs', permanent: false },
      { source: '/logs/:path*', destination: '/admin/logs/:path*', permanent: false },
      { source: '/integrations', destination: '/admin/integrations', permanent: false },
      { source: '/integrations/:path*', destination: '/admin/integrations/:path*', permanent: false },
      { source: '/administration', destination: '/admin/administration', permanent: false },
      { source: '/administration/:path*', destination: '/admin/administration/:path*', permanent: false },
      { source: '/invoices', destination: '/admin/invoices', permanent: false },
      { source: '/invoices/:path*', destination: '/admin/invoices/:path*', permanent: false },
      { source: '/chargebacks', destination: '/admin/chargebacks', permanent: false },
      { source: '/chargebacks/:path*', destination: '/admin/chargebacks/:path*', permanent: false },
      { source: '/kyc', destination: '/admin/kyc', permanent: false },
      { source: '/kyc/:path*', destination: '/admin/kyc/:path*', permanent: false },
      { source: '/users', destination: '/admin/users', permanent: false },
      { source: '/users/:path*', destination: '/admin/users/:path*', permanent: false },
      { source: '/settlements', destination: '/admin/settlements', permanent: false },
      { source: '/settlements/:path*', destination: '/admin/settlements/:path*', permanent: false },
      { source: '/notifications', destination: '/admin/notifications', permanent: false },
      { source: '/notifications/:path*', destination: '/admin/notifications/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
