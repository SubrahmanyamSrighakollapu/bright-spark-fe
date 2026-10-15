import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/types/common';

export type ExternalApplicantRole = 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
export interface ExternalSignupApplication {
  role: ExternalApplicantRole; fullName:string; businessName:string; email:string; mobile:string; password:string;
  address:string; city:string; state:string; postalCode:string;
  documents: Record<'ID_PROOF'|'PAN'|'ADDRESS_PROOF'|'BANK_PROOF'|'PROFILE_PHOTO'|'GST_CERTIFICATE',File|null>;
}
export interface ExternalSignupResult { reference:string;applicationId:string;status:'PENDING_KYC_REVIEW';role:ExternalApplicantRole;message:string }

export const externalSignupService = {
  async submit(input:ExternalSignupApplication):Promise<ApiResponse<ExternalSignupResult>> {
    const form=new FormData();
    Object.entries(input).forEach(([key,value])=>{if(key!=='documents')form.append(key,String(value));});
    const names:Record<keyof ExternalSignupApplication['documents'],string>={ID_PROOF:'idProof',PAN:'pan',ADDRESS_PROOF:'addressProof',BANK_PROOF:'bankProof',PROFILE_PHOTO:'profilePhoto',GST_CERTIFICATE:'gstCertificate'};
    Object.entries(input.documents).forEach(([key,file])=>{if(file)form.append(names[key as keyof typeof names],file);});
    return apiClient.upload<ApiResponse<ExternalSignupResult>>('/public/signup',form);
  },
};
