import { MerchantOnboardingApplication, MerchantOnboardingInput, PaginationState } from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockOnboardingApplications } from '@/mocks/mockUsers';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemoryOnboarding: MerchantOnboardingApplication[] = [...mockOnboardingApplications];

export interface OnboardingListResult {
  items: MerchantOnboardingApplication[];
  pagination: PaginationState;
}

export const onboardingService = {
  async getOnboardingApplications(
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<OnboardingListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      const totalItems = inMemoryOnboarding.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const items = inMemoryOnboarding.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<OnboardingListResult>>('/onboarding/applications', {
      params: { page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  async createOnboardingApplication(
    input: MerchantOnboardingInput
  ): Promise<ApiResponse<MerchantOnboardingApplication>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 400));
      const newApp: MerchantOnboardingApplication = {
        id: `onb_app_${Date.now()}`,
        businessName: input.businessName,
        contactName: input.contactName,
        mobile: input.mobile,
        email: input.email,
        mappedParentName: input.distributorId || 'North Zone Dist',
        submittedAt: new Date().toISOString(),
        kycStatus: 'PENDING',
        onboardingStatus: 'SUBMITTED',
        documents: input.documents,
      };

      inMemoryOnboarding.unshift(newApp);

      return {
        success: true,
        data: newApp,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.post<ApiResponse<MerchantOnboardingApplication>>('/onboarding/applications', input);
  },
};
