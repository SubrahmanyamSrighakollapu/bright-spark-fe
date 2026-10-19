'use client';

import { AEPS_BANKS, AEPS_MINI_STATEMENT } from '@/mocks/mockAeps';
import type { AEPSCustomerInput, AEPSTransaction, AEPSServiceType } from '@/types/aeps';

const delay = (milliseconds: number) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
export const maskAadhaar = (value: string) => `XXXX XXXX ${value.replace(/\D/g, '').slice(-4).padStart(4, 'X')}`;
export const maskMobile = (value: string) => `XXXXXX${value.replace(/\D/g, '').slice(-4).padStart(4, 'X')}`;

function successfulResult(serviceType: AEPSServiceType): { message: string; balance?: number } {
  if (serviceType === 'CASH_WITHDRAWAL') return { message: 'Cash withdrawal successful', balance: 8356.74 };
  if (serviceType === 'BALANCE_ENQUIRY') return { message: 'Bank balance retrieved successfully', balance: 8356.74 };
  return { message: 'Mini statement retrieved successfully', balance: 1356.74 };
}

export const aepsMockService = {
  async authenticate(success: boolean): Promise<{ success: boolean; message: string; authenticatedAt?: string }> {
    await delay(650);
    return success
      ? { success: true, message: 'Retailer AEPS authentication successful', authenticatedAt: new Date().toISOString() }
      : { success: false, message: 'Retailer authentication failed. Please retry the fingerprint capture.' };
  },

  async process(serviceType: AEPSServiceType, input: AEPSCustomerInput): Promise<AEPSTransaction> {
    await delay(900);
    const bank = AEPS_BANKS.find((item) => item.id === input.bankId);
    if (!bank) throw new Error('Select a bank.');
    const result = successfulResult(serviceType);
    return {
      id: `BSPAEPS-${Date.now()}`,
      serviceType,
      bankId: bank.id,
      bankName: bank.name,
      maskedAadhaar: maskAadhaar(input.aadhaar),
      maskedMobile: maskMobile(input.mobile),
      amount: serviceType === 'CASH_WITHDRAWAL' ? input.amount : undefined,
      status: 'SUCCESS',
      responseMessage: result.message,
      customerBankBalance: result.balance,
      statement: serviceType === 'MINI_STATEMENT' ? AEPS_MINI_STATEMENT : undefined,
      createdAt: new Date().toISOString(),
    };
  },
};

