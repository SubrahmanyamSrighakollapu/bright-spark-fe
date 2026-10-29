import { apiClient } from './apiClient';
import type { AEPSAgentState, AEPSEligibility, AEPSTransaction, AEPSServiceType } from '@/types/aeps';

type ApiResponse<T> = { success: true; data: T };
async function deviceContext() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return { mobileDeviceId: 'bright-spark-web', latitude: 0, longitude: 0 };
  let mobileDeviceId = localStorage.getItem('bright-spark-aeps-device-id');
  if (!mobileDeviceId) { mobileDeviceId = `web-${crypto.randomUUID()}`; localStorage.setItem('bright-spark-aeps-device-id', mobileDeviceId); }
  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true, timeout: 7000, maximumAge: 60_000 });
  });
  return { mobileDeviceId, latitude: position?.coords.latitude ?? 0, longitude: position?.coords.longitude ?? 0 };
}

export type AepsOnboardingInput = {
  name: string; mobile: string; email: string; pan: string; aadhaar: string; dob: string; agentCode: string;
  address: string; state: string; city: string; pin: string; bankName: string; accountNumber: string; ifsc: string;
  shopName: string; shopAddress: string; isPhysicalVerified: boolean;
};

export const aepsService = {
  context: deviceContext,
  async session() { return (await apiClient.get<ApiResponse<{ enabled: boolean; provider: string; agent: AEPSAgentState }>>('/aeps/session')).data; },
  async onboard(input: AepsOnboardingInput) { return (await apiClient.post<ApiResponse<{ onboardingStatus: string; message: string }>>('/aeps/agent/onboard', { ...input, ...await deviceContext(), transactionId: `BSP-ONB-${Date.now()}` })).data; },
  async onboardingStatus() { return (await apiClient.post<ApiResponse<{ onboardingStatus: string; message: string }>>('/aeps/agent/onboarding-status')).data; },
  async loadAgent() { return (await apiClient.post<ApiResponse<AEPSEligibility>>('/aeps/agent/load', await deviceContext())).data; },
  async kyc(pidData: string, wadh?: string) { return (await apiClient.post<ApiResponse<{ completed: boolean; message: string }>>('/aeps/agent/kyc', { ...await deviceContext(), bioType: '0', pidData, wadh })).data; },
  async daily2fa(pidData: string) { return (await apiClient.post<ApiResponse<{ completed: boolean; message: string }>>('/aeps/agent/daily-2fa', { ...await deviceContext(), bioType: '0', pidData })).data; },
  async generateOtp(input: { amount: number; bankIin: string; mobile: string; aadhaar: string }) { return (await apiClient.post<ApiResponse<{ otpReference?: string; message: string }>>('/aeps/otp', { ...input, ...await deviceContext(), transactionId: `BSP-OTP-${Date.now()}` })).data; },
  async transact(input: { serviceType: Exclude<AEPSServiceType, 'CASH_DEPOSIT'>; amount?: number; bankName: string; bankIin: string; mobile: string; aadhaar: string; pidData: string; otpReference?: string }) {
    return (await apiClient.post<ApiResponse<AEPSTransaction>>('/aeps/transactions', { ...input, ...await deviceContext(), bioType: '0', transactionId: `BSPAEPS-${Date.now()}` })).data;
  },
  async transactions() { return (await apiClient.get<ApiResponse<AEPSTransaction[]>>('/aeps/transactions')).data; },
};
