import { ApiResponse } from '@/types/common';

export interface HeadlineAlertItem {
  id: string;
  title: string;
  text: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'PROMOTION' | 'CRITICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  badgeText?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

const STORAGE_KEY = 'qin_star_pay_headline_alerts_v1';

export const INITIAL_HEADLINE_ALERTS: HeadlineAlertItem[] = [
  {
    id: 'hl_001',
    title: 'Pay-In Festival Offer',
    text: 'Special Pay-In Festival Offer: Earn +0.15% instant margin bonus on all UPI Pay-In collections above ₹2,000 today!',
    type: 'PROMOTION',
    priority: 'HIGH',
    badgeText: 'FESTIVAL OFFER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hl_002',
    title: 'Sub-3s Settlement Upgrade',
    text: 'Instant Wallet Settlement: Auto-settlement processing time is now sub-3 seconds across all partner banks.',
    type: 'INFO',
    priority: 'MEDIUM',
    badgeText: 'SYSTEM UPGRADE',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hl_003',
    title: 'Banking Holiday Notice',
    text: 'Banking Schedule: NEFT & RTGS settlement windows will process in standard 1-hour batch cycles during bank holidays.',
    type: 'WARNING',
    priority: 'MEDIUM',
    badgeText: 'BANKING NOTICE',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hl_004',
    title: 'Account Security Advisory',
    text: 'Security Alert: Never share your OTP, PIN or Login Password with anyone. Qin Star Pay team will never ask for credentials.',
    type: 'CRITICAL',
    priority: 'HIGH',
    badgeText: 'SECURITY ALERT',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hl_005',
    title: 'Multi-Category Pay-In Live',
    text: 'New Feature: Grocery, Tourism, and Fashion application collections are now active with Admin pre-configured product prices!',
    type: 'PROMOTION',
    priority: 'MEDIUM',
    badgeText: 'NEW FEATURE',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

function loadFromStorage(): HeadlineAlertItem[] {
  if (typeof window === 'undefined') return INITIAL_HEADLINE_ALERTS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HEADLINE_ALERTS));
      return INITIAL_HEADLINE_ALERTS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load headline alerts:', err);
    return INITIAL_HEADLINE_ALERTS;
  }
}

function saveToStorage(items: HeadlineAlertItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('qin_headline_alerts_updated'));
  } catch (err) {
    console.error('Failed to save headline alerts:', err);
  }
}

export const headlineAlertService = {
  async getHeadlines(): Promise<ApiResponse<HeadlineAlertItem[]>> {
    await new Promise((res) => setTimeout(res, 50));
    return {
      success: true,
      data: loadFromStorage(),
      timestamp: new Date().toISOString(),
    };
  },

  async getActiveHeadlines(): Promise<ApiResponse<HeadlineAlertItem[]>> {
    await new Promise((res) => setTimeout(res, 50));
    const items = loadFromStorage();
    const active = items.filter((item) => item.status === 'ACTIVE');
    return {
      success: true,
      data: active,
      timestamp: new Date().toISOString(),
    };
  },

  async createHeadline(
    data: Omit<HeadlineAlertItem, 'id' | 'createdAt'>
  ): Promise<ApiResponse<HeadlineAlertItem>> {
    await new Promise((res) => setTimeout(res, 150));
    const items = loadFromStorage();
    const newId = `hl_${Date.now().toString().slice(-5)}`;

    const newItem: HeadlineAlertItem = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    saveToStorage(items);

    return {
      success: true,
      data: newItem,
      timestamp: new Date().toISOString(),
    };
  },

  async updateHeadline(
    id: string,
    updates: Partial<Omit<HeadlineAlertItem, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<HeadlineAlertItem>> {
    await new Promise((res) => setTimeout(res, 150));
    const items = loadFromStorage();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      return { success: false, data: null as any, message: 'Headline alert not found', timestamp: new Date().toISOString() };
    }

    items[idx] = {
      ...items[idx],
      ...updates,
    };
    saveToStorage(items);

    return { success: true, data: items[idx], timestamp: new Date().toISOString() };
  },

  async toggleHeadlineStatus(id: string): Promise<ApiResponse<HeadlineAlertItem>> {
    await new Promise((res) => setTimeout(res, 100));
    const items = loadFromStorage();
    const item = items.find((i) => i.id === id);
    if (!item) {
      return { success: false, data: null as any, message: 'Headline alert not found', timestamp: new Date().toISOString() };
    }

    item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    saveToStorage(items);

    return { success: true, data: { ...item }, timestamp: new Date().toISOString() };
  },

  async deleteHeadline(id: string): Promise<ApiResponse<boolean>> {
    await new Promise((res) => setTimeout(res, 100));
    let items = loadFromStorage();
    items = items.filter((i) => i.id !== id);
    saveToStorage(items);

    return { success: true, data: true, timestamp: new Date().toISOString() };
  },

  async resetToDefaults(): Promise<ApiResponse<HeadlineAlertItem[]>> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HEADLINE_ALERTS));
      window.dispatchEvent(new Event('qin_headline_alerts_updated'));
    }
    return { success: true, data: INITIAL_HEADLINE_ALERTS, timestamp: new Date().toISOString() };
  },
};
