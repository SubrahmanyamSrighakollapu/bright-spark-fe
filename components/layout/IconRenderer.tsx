import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  ShieldCheck,
  Wallet,
  Landmark,
  BarChart3,
  RotateCcw,
  Receipt,
  Bell,
  Plug,
  Terminal,
  Settings,
  Circle,
  Network,
  Globe,
  UserCheck,
  Radio,
  Layers,
  Shield,
  Percent,
  CreditCard,
  FileText,
  QrCode,
  BadgeIndianRupee,
  Link2,
} from 'lucide-react';

export interface IconRendererProps {
  name?: string;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  ShieldCheck,
  Wallet,
  Landmark,
  BarChart3,
  RotateCcw,
  Receipt,
  Bell,
  Plug,
  Terminal,
  Settings,
  Network,
  Globe,
  UserCheck,
  Radio,
  Layers,
  Shield,
  Percent,
  CreditCard,
  FileText,
  QrCode,
  BadgeIndianRupee,
  Link2,
};

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-4 h-4' }) => {
  if (!name) return null;
  const IconComponent = iconMap[name] || Circle;
  return <IconComponent className={className} />;
};
