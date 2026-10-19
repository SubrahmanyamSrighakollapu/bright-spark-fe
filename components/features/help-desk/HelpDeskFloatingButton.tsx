'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headphones, MessageCircleQuestion } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function HelpDeskFloatingButton() {
  const { session } = useAuth(); const pathname = usePathname();
  if (!session || !['RETAILER', 'DISTRIBUTOR', 'MASTER_DISTRIBUTOR'].includes(session.role) || pathname === '/help-desk') return null;
  return <Link href="/help-desk" aria-label="Open Help Desk" className="group fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-full bg-[#2f6f5e] p-3.5 text-white shadow-[0_12px_35px_rgba(15,76,129,.35)] transition hover:-translate-y-1 hover:bg-[#25594C] focus:outline-none focus:ring-4 focus:ring-[#D4E1AE]">
    <Headphones className="h-5 w-5"/><span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:pr-1 group-hover:opacity-100">Help Desk</span>
    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500"><MessageCircleQuestion className="h-2.5 w-2.5"/></span>
  </Link>;
}
