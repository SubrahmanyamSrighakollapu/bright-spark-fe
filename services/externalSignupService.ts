import { apiClient } from '@/services/apiClient';
import type { ApiResponse } from '@/types/common';

export type ExternalApplicantRole = 'MASTER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
export interface PublicDocumentRequirement { id:string;code:string;label:string;description?:string;configuration:{required?:boolean;acceptedMimeTypes?:string[];maxSizeMb?:number;applicablePartyTypes?:string[]};sortOrder?:number }
export interface ExternalSignupApplication {
  role: ExternalApplicantRole; fullName:string; businessName:string; email:string; mobile:string; password:string;
  address:string; city:string; state:string; postalCode:string;
  documents: Record<string,File|null>;
}
export interface ExternalSignupResult { reference:string;applicationId:string;status:'PENDING_KYC_REVIEW';role:ExternalApplicantRole;message:string }

export const externalSignupService = {
  getDocumentRequirements:(role:ExternalApplicantRole)=>apiClient.get<ApiResponse<PublicDocumentRequirement[]>>('/public/signup/document-requirements',{params:{role}}),
  async submit(input:ExternalSignupApplication):Promise<ApiResponse<ExternalSignupResult>> {
    const form=new FormData();
    Object.entries(input).forEach(([key,value])=>{if(key!=='documents')form.append(key,String(value));});
    Object.entries(input.documents).forEach(([code,file])=>{if(file)form.append(code,file);});
    return apiClient.upload<ApiResponse<ExternalSignupResult>>('/public/signup',form);
  },
};
