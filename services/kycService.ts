import { KYCApplication, PaginationState } from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockKYCApplications } from '@/mocks/mockUsers';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemoryKYC: KYCApplication[] = [...mockKYCApplications];

export interface KYCListResult {
  items: KYCApplication[];
  pagination: PaginationState;
}

export const kycService = {
  async getKYCApplications(
    status = 'ALL',
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<KYCListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      let filtered = [...inMemoryKYC];
      if (status !== 'ALL') {
        if (status === 'PROCESSING') {
          filtered = filtered.filter((a) => a.status === 'PROCESSING' || a.status === 'PENDING' || a.status === 'UNDER_REVIEW');
        } else {
          filtered = filtered.filter((a) => a.status === status);
        }
      }
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<KYCListResult>>('/kyc/applications', {
      params: { status, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  async getKYCApplicationById(id: string): Promise<ApiResponse<KYCApplication | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const app = inMemoryKYC.find((a) => a.id === id || a.entityId === id) || null;
      return {
        success: !!app,
        data: app,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<KYCApplication>>(`/kyc/applications/${id}`);
  },

  async verifyDocument(appId: string, docId: string): Promise<ApiResponse<KYCApplication>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      const app = inMemoryKYC.find((a) => a.id === appId);
      if (app) {
        const doc = app.documents.find((d) => d.id === docId);
        if (doc) {
          doc.status = 'VERIFIED';
          doc.rejectionReason = undefined;
          app.timeline.push({
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            event: `${doc.type} Document Verified`,
            user: 'Anjali Sharma',
            remarks: `Marked ${doc.title} as verified`,
          });
        }
        return { success: true, data: { ...app }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as KYCApplication, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<KYCApplication>>(`/kyc/applications/${appId}/docs/${docId}/verify`);
  },

  async rejectDocument(appId: string, docId: string, reason: string): Promise<ApiResponse<KYCApplication>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      const app = inMemoryKYC.find((a) => a.id === appId);
      if (app) {
        const doc = app.documents.find((d) => d.id === docId);
        if (doc) {
          doc.status = 'REJECTED';
          doc.rejectionReason = reason;
          app.timeline.push({
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            event: `${doc.type} Document Rejected`,
            user: 'Anjali Sharma',
            remarks: reason,
          });
        }
        return { success: true, data: { ...app }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as KYCApplication, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<KYCApplication>>(`/kyc/applications/${appId}/docs/${docId}/reject`, { reason });
  },

  async approveKYC(appId: string, remarks?: string): Promise<ApiResponse<KYCApplication>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const app = inMemoryKYC.find((a) => a.id === appId);
      if (app) {
        app.status = 'APPROVED';
        app.reviewedAt = new Date().toISOString();
        app.reviewedBy = 'Anjali Sharma';
        app.remarks = remarks || 'KYC Documents Verified and Approved';
        app.timeline.push({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          event: 'KYC Approved',
          user: 'Anjali Sharma',
          remarks: app.remarks,
        });
        return { success: true, data: { ...app }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as KYCApplication, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<KYCApplication>>(`/kyc/applications/${appId}/approve`, { remarks });
  },

  async rejectKYC(appId: string, reason: string): Promise<ApiResponse<KYCApplication>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const app = inMemoryKYC.find((a) => a.id === appId);
      if (app) {
        app.status = 'REJECTED';
        app.reviewedAt = new Date().toISOString();
        app.reviewedBy = 'Anjali Sharma';
        app.remarks = reason;
        app.timeline.push({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          event: 'KYC Rejected',
          user: 'Anjali Sharma',
          remarks: reason,
        });
        return { success: true, data: { ...app }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as KYCApplication, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<KYCApplication>>(`/kyc/applications/${appId}/reject`, { reason });
  },

  async blockKYC(appId: string, reason: string): Promise<ApiResponse<KYCApplication>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const app = inMemoryKYC.find((a) => a.id === appId);
      if (app) {
        app.status = 'BLOCKED';
        app.reviewedAt = new Date().toISOString();
        app.reviewedBy = 'Anjali Sharma';
        app.remarks = `BLOCKED: ${reason}`;
        app.timeline.push({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          event: 'Entity KYC Blocked',
          user: 'Anjali Sharma',
          remarks: reason,
        });
        return { success: true, data: { ...app }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as KYCApplication, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<KYCApplication>>(`/kyc/applications/${appId}/block`, { reason });
  },

  async unblockKYC(appId: string): Promise<ApiResponse<KYCApplication>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const app = inMemoryKYC.find((a) => a.id === appId);
      if (app) {
        app.status = 'PROCESSING';
        app.reviewedAt = new Date().toISOString();
        app.reviewedBy = 'Anjali Sharma';
        app.remarks = 'Unblocked and moved back to Processing';
        app.timeline.push({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          event: 'Entity Unblocked',
          user: 'Anjali Sharma',
          remarks: 'Status set back to Processing',
        });
        return { success: true, data: { ...app }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as KYCApplication, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<KYCApplication>>(`/kyc/applications/${appId}/unblock`);
  },
};
