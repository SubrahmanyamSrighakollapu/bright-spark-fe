import { ApiResponse } from '@/types/common';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

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

export interface ScrollTickerItem {
  id: string;
  scrollText: string;
  speed: 'Slow' | 'Normal' | 'Fast';
  targetAudience: 'All Users' | 'Distributors Only' | 'Retailers Only';
  isActive: boolean;
  createdAt: string;
}

export interface NoticeBoardItem {
  id: string;
  noticeTitle: string;
  noticeContent: string;
  noticeType: 'Information' | 'Important' | 'Urgent Alert';
  publishDate: string;
  expiryDate: string;
  createdAt: string;
}

const STORAGE_KEY = 'qin_star_pay_headline_alerts_v1';
const TICKERS_KEY = 'qin_star_pay_tickers_v1';
const NOTICES_KEY = 'qin_star_pay_notices_v1';

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
];

export const INITIAL_TICKERS: ScrollTickerItem[] = [
  {
    id: 'ticker_1',
    scrollText: '🌾 Notice: Kharif Harvest Paddy procurement settlement rates updated today across all APMC mandis.',
    speed: 'Normal',
    targetAudience: 'All Users',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticker_2',
    scrollText: '⚡ Special Bonus: Instant Wallet Payout service fee reduced to ₹5 for high-volume Retailers.',
    speed: 'Fast',
    targetAudience: 'Retailers Only',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ticker_3',
    scrollText: '⚠️ Scheduled Banking Gateway Maintenance tonight from 02:00 AM to 03:30 AM IST.',
    speed: 'Slow',
    targetAudience: 'Distributors Only',
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_NOTICES: NoticeBoardItem[] = [
  {
    id: 'notice_1',
    noticeTitle: 'New Banking Beneficiary Addition Guideline Update',
    noticeContent: 'All Master Distributors & Retailers must verify Aadhaar OTP before binding new beneficiary bank accounts for instant payout operations.',
    noticeType: 'Important',
    publishDate: '2026-09-20T00:00:00Z',
    expiryDate: '2026-10-31T23:59:59Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice_2',
    noticeTitle: 'GST Tax Clearance Statement Submission Deadline',
    noticeContent: 'Quarterly GST reconciliation statements are due by 5th October 2026 for all Super Distributor accounts.',
    noticeType: 'Urgent Alert',
    publishDate: '2026-09-22T00:00:00Z',
    expiryDate: '2026-10-05T23:59:59Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice_3',
    noticeTitle: 'Platform Upgrade v3.4 Deployment Briefing',
    noticeContent: 'Enhanced UI components and real-time wallet settlement features are now live across all portal sections.',
    noticeType: 'Information',
    publishDate: '2026-09-25T00:00:00Z',
    expiryDate: '2026-12-31T23:59:59Z',
    createdAt: new Date().toISOString(),
  },
];

function getStored<T>(key: string, defaults: T): T {
  if (typeof window === 'undefined') return defaults;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  } catch (err) {
    return defaults;
  }
}

function saveStored<T>(key: string, value: T, eventName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (eventName) window.dispatchEvent(new Event(eventName));
  } catch (err) {
    console.error(`Failed to save storage key ${key}:`, err);
  }
}

export const headlineAlertService = {
  // --- Headlines ---
  async getHeadlines(): Promise<ApiResponse<HeadlineAlertItem[]>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.get<ApiResponse<any[]>>('/headlines?category=HEADLINE');
        if (response && response.data) {
          const items: HeadlineAlertItem[] = response.data.map((h: any) => ({
            id: h.id,
            title: h.title,
            text: h.message || h.text || '',
            type: h.category === 'NOTICE_BOARD' ? 'WARNING' : h.category === 'TICKER' ? 'PROMOTION' : 'INFO',
            priority: 'HIGH',
            badgeText: h.code || h.category,
            status: h.isActive ? 'ACTIVE' : 'INACTIVE',
            createdAt: h.createdAt || new Date().toISOString(),
          }));
          return { success: true, data: items, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('Backend /headlines API fallback:', err);
      }
    }
    return { success: true, data: getStored(STORAGE_KEY, INITIAL_HEADLINE_ALERTS), timestamp: new Date().toISOString() };
  },

  async getActiveHeadlines(): Promise<ApiResponse<HeadlineAlertItem[]>> {
    const res = await this.getHeadlines();
    if (res.success && res.data) {
      return {
        success: true,
        data: res.data.filter((item) => item.status === 'ACTIVE'),
        timestamp: new Date().toISOString(),
      };
    }
    return res;
  },

  async createHeadline(data: Omit<HeadlineAlertItem, 'id' | 'createdAt'>): Promise<ApiResponse<HeadlineAlertItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/headlines', {
          category: 'HEADLINE',
          title: data.title,
          message: data.text,
          isActive: data.status === 'ACTIVE',
        });
        if (res.success && res.data) {
          const newItem: HeadlineAlertItem = {
            id: res.data.id,
            title: res.data.title,
            text: res.data.message,
            type: data.type,
            priority: data.priority,
            badgeText: data.badgeText,
            status: res.data.isActive ? 'ACTIVE' : 'INACTIVE',
            createdAt: new Date().toISOString(),
          };
          return { success: true, data: newItem, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('API error, using local storage:', err);
      }
    }
    const items = getStored(STORAGE_KEY, INITIAL_HEADLINE_ALERTS);
    const newItem: HeadlineAlertItem = { ...data, id: `hl_${Date.now()}`, createdAt: new Date().toISOString() };
    items.unshift(newItem);
    saveStored(STORAGE_KEY, items, 'qin_headline_alerts_updated');
    return { success: true, data: newItem, timestamp: new Date().toISOString() };
  },

  async updateHeadline(id: string, updates: Partial<Omit<HeadlineAlertItem, 'id' | 'createdAt'>>): Promise<ApiResponse<HeadlineAlertItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/headlines/${id}`, {
          ...(updates.title && { title: updates.title }),
          ...(updates.text && { message: updates.text }),
          ...(updates.status && { isActive: updates.status === 'ACTIVE' }),
        });
        if (res.success) {
          const items = getStored(STORAGE_KEY, INITIAL_HEADLINE_ALERTS);
          const idx = items.findIndex((i) => i.id === id);
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...updates };
            saveStored(STORAGE_KEY, items, 'qin_headline_alerts_updated');
          }
          return { success: true, data: items[idx] || updates as any, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    const items = getStored(STORAGE_KEY, INITIAL_HEADLINE_ALERTS);
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      saveStored(STORAGE_KEY, items, 'qin_headline_alerts_updated');
      return { success: true, data: items[idx], timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as any, message: 'Not found', timestamp: new Date().toISOString() };
  },

  async toggleHeadlineStatus(id: string): Promise<ApiResponse<HeadlineAlertItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/headlines/${id}/status`, {});
        if (res.success) {
          const items = getStored(STORAGE_KEY, INITIAL_HEADLINE_ALERTS);
          const item = items.find((i) => i.id === id);
          if (item) {
            item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            saveStored(STORAGE_KEY, items, 'qin_headline_alerts_updated');
            return { success: true, data: item, timestamp: new Date().toISOString() };
          }
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    const items = getStored(STORAGE_KEY, INITIAL_HEADLINE_ALERTS);
    const item = items.find((i) => i.id === id);
    if (item) {
      item.status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      saveStored(STORAGE_KEY, items, 'qin_headline_alerts_updated');
      return { success: true, data: item, timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as any, message: 'Not found', timestamp: new Date().toISOString() };
  },

  async deleteHeadline(id: string): Promise<ApiResponse<boolean>> {
    if (!APP_CONFIG.useMockData) {
      try {
        await apiClient.delete(`/headlines/${id}`);
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    let items = getStored(STORAGE_KEY, INITIAL_HEADLINE_ALERTS);
    items = items.filter((i) => i.id !== id);
    saveStored(STORAGE_KEY, items, 'qin_headline_alerts_updated');
    return { success: true, data: true, timestamp: new Date().toISOString() };
  },

  // --- Scroll Text Tickers ---
  async getTickers(): Promise<ApiResponse<ScrollTickerItem[]>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.get<ApiResponse<any[]>>('/headlines?category=TICKER');
        if (response && response.data) {
          const items: ScrollTickerItem[] = response.data.map((t: any) => ({
            id: t.id,
            scrollText: t.message || t.title || '',
            speed: t.configuration?.speed || 'Normal',
            targetAudience: t.configuration?.targetAudience || 'All Users',
            isActive: Boolean(t.isActive),
            createdAt: t.createdAt || new Date().toISOString(),
          }));
          return { success: true, data: items, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('Backend /headlines?category=TICKER fallback:', err);
      }
    }
    return { success: true, data: getStored(TICKERS_KEY, INITIAL_TICKERS), timestamp: new Date().toISOString() };
  },

  async createTicker(data: Omit<ScrollTickerItem, 'id' | 'createdAt'>): Promise<ApiResponse<ScrollTickerItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/headlines', {
          category: 'TICKER',
          title: data.scrollText.slice(0, 50),
          message: data.scrollText,
          speed: data.speed,
          targetAudience: data.targetAudience,
          isActive: data.isActive,
        });
        if (res.success && res.data) {
          const newItem: ScrollTickerItem = {
            id: res.data.id,
            scrollText: data.scrollText,
            speed: data.speed,
            targetAudience: data.targetAudience,
            isActive: data.isActive,
            createdAt: new Date().toISOString(),
          };
          return { success: true, data: newItem, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    const items = getStored(TICKERS_KEY, INITIAL_TICKERS);
    const newItem: ScrollTickerItem = { ...data, id: `ticker_${Date.now()}`, createdAt: new Date().toISOString() };
    items.unshift(newItem);
    saveStored(TICKERS_KEY, items, 'qin_tickers_updated');
    return { success: true, data: newItem, timestamp: new Date().toISOString() };
  },

  async updateTicker(id: string, updates: Partial<Omit<ScrollTickerItem, 'id' | 'createdAt'>>): Promise<ApiResponse<ScrollTickerItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/headlines/${id}`, {
          ...(updates.scrollText && { title: updates.scrollText.slice(0, 50), message: updates.scrollText }),
          ...(updates.speed && { speed: updates.speed }),
          ...(updates.targetAudience && { targetAudience: updates.targetAudience }),
          ...(updates.isActive !== undefined && { isActive: updates.isActive }),
        });
        if (res.success) {
          const items = getStored(TICKERS_KEY, INITIAL_TICKERS);
          const idx = items.findIndex((t) => t.id === id);
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...updates };
            saveStored(TICKERS_KEY, items, 'qin_tickers_updated');
          }
          return { success: true, data: items[idx] || updates as any, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    const items = getStored(TICKERS_KEY, INITIAL_TICKERS);
    const idx = items.findIndex((t) => t.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      saveStored(TICKERS_KEY, items, 'qin_tickers_updated');
      return { success: true, data: items[idx], timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as any, message: 'Ticker not found', timestamp: new Date().toISOString() };
  },

  async toggleTickerStatus(id: string): Promise<ApiResponse<ScrollTickerItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/headlines/${id}/status`, {});
        if (res.success) {
          const items = getStored(TICKERS_KEY, INITIAL_TICKERS);
          const item = items.find((t) => t.id === id);
          if (item) {
            item.isActive = !item.isActive;
            saveStored(TICKERS_KEY, items, 'qin_tickers_updated');
            return { success: true, data: item, timestamp: new Date().toISOString() };
          }
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    const items = getStored(TICKERS_KEY, INITIAL_TICKERS);
    const item = items.find((t) => t.id === id);
    if (item) {
      item.isActive = !item.isActive;
      saveStored(TICKERS_KEY, items, 'qin_tickers_updated');
      return { success: true, data: item, timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as any, message: 'Not found', timestamp: new Date().toISOString() };
  },

  async deleteTicker(id: string): Promise<ApiResponse<boolean>> {
    if (!APP_CONFIG.useMockData) {
      try {
        await apiClient.delete(`/headlines/${id}`);
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    let items = getStored(TICKERS_KEY, INITIAL_TICKERS);
    items = items.filter((t) => t.id !== id);
    saveStored(TICKERS_KEY, items, 'qin_tickers_updated');
    return { success: true, data: true, timestamp: new Date().toISOString() };
  },

  // --- Notice Board ---
  async getNotices(): Promise<ApiResponse<NoticeBoardItem[]>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.get<ApiResponse<any[]>>('/headlines?category=NOTICE_BOARD');
        if (response && response.data) {
          const items: NoticeBoardItem[] = response.data.map((n: any) => ({
            id: n.id,
            noticeTitle: n.title,
            noticeContent: n.message || '',
            noticeType: n.configuration?.noticeType || 'Information',
            publishDate: n.configuration?.publishDate || new Date().toISOString().split('T')[0],
            expiryDate: n.configuration?.expiryDate || new Date().toISOString().split('T')[0],
            createdAt: n.createdAt || new Date().toISOString(),
          }));
          return { success: true, data: items, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('Backend /headlines?category=NOTICE_BOARD fallback:', err);
      }
    }
    return { success: true, data: getStored(NOTICES_KEY, INITIAL_NOTICES), timestamp: new Date().toISOString() };
  },

  async createNotice(data: Omit<NoticeBoardItem, 'id' | 'createdAt'>): Promise<ApiResponse<NoticeBoardItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/headlines', {
          category: 'NOTICE_BOARD',
          title: data.noticeTitle,
          message: data.noticeContent,
          noticeType: data.noticeType,
          publishDate: data.publishDate,
          expiryDate: data.expiryDate,
          isActive: true,
        });
        if (res.success && res.data) {
          const newItem: NoticeBoardItem = {
            id: res.data.id,
            noticeTitle: data.noticeTitle,
            noticeContent: data.noticeContent,
            noticeType: data.noticeType,
            publishDate: data.publishDate,
            expiryDate: data.expiryDate,
            createdAt: new Date().toISOString(),
          };
          return { success: true, data: newItem, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    const items = getStored(NOTICES_KEY, INITIAL_NOTICES);
    const newItem: NoticeBoardItem = { ...data, id: `notice_${Date.now()}`, createdAt: new Date().toISOString() };
    items.unshift(newItem);
    saveStored(NOTICES_KEY, items, 'qin_notices_updated');
    return { success: true, data: newItem, timestamp: new Date().toISOString() };
  },

  async updateNotice(id: string, updates: Partial<Omit<NoticeBoardItem, 'id' | 'createdAt'>>): Promise<ApiResponse<NoticeBoardItem>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/headlines/${id}`, {
          ...(updates.noticeTitle && { title: updates.noticeTitle }),
          ...(updates.noticeContent && { message: updates.noticeContent }),
          ...(updates.noticeType && { noticeType: updates.noticeType }),
          ...(updates.publishDate && { publishDate: updates.publishDate }),
          ...(updates.expiryDate && { expiryDate: updates.expiryDate }),
        });
        if (res.success) {
          const items = getStored(NOTICES_KEY, INITIAL_NOTICES);
          const idx = items.findIndex((n) => n.id === id);
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...updates };
            saveStored(NOTICES_KEY, items, 'qin_notices_updated');
          }
          return { success: true, data: items[idx] || updates as any, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    const items = getStored(NOTICES_KEY, INITIAL_NOTICES);
    const idx = items.findIndex((n) => n.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      saveStored(NOTICES_KEY, items, 'qin_notices_updated');
      return { success: true, data: items[idx], timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as any, message: 'Notice not found', timestamp: new Date().toISOString() };
  },

  async deleteNotice(id: string): Promise<ApiResponse<boolean>> {
    if (!APP_CONFIG.useMockData) {
      try {
        await apiClient.delete(`/headlines/${id}`);
      } catch (err) {
        console.warn('API error:', err);
      }
    }
    let items = getStored(NOTICES_KEY, INITIAL_NOTICES);
    items = items.filter((n) => n.id !== id);
    saveStored(NOTICES_KEY, items, 'qin_notices_updated');
    return { success: true, data: true, timestamp: new Date().toISOString() };
  },

  async resetToDefaults(): Promise<ApiResponse<HeadlineAlertItem[]>> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HEADLINE_ALERTS));
      localStorage.setItem(TICKERS_KEY, JSON.stringify(INITIAL_TICKERS));
      localStorage.setItem(NOTICES_KEY, JSON.stringify(INITIAL_NOTICES));
      window.dispatchEvent(new Event('qin_headline_alerts_updated'));
      window.dispatchEvent(new Event('qin_tickers_updated'));
      window.dispatchEvent(new Event('qin_notices_updated'));
    }
    return { success: true, data: INITIAL_HEADLINE_ALERTS, timestamp: new Date().toISOString() };
  },
};
