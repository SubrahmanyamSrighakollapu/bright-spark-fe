import { hierarchyService } from '@/services/hierarchyService';
import type { KYCDocument } from '@/types/domain';

export type ExternalApplicantRole = 'DISTRIBUTOR' | 'RETAILER';
export interface ExternalSignupApplication {
  role: ExternalApplicantRole;
  fullName: string;
  businessName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  documents: Record<'AADHAAR' | 'PAN' | 'CANCELLED_CHEQUE' | 'GST_CERTIFICATE', File | null>;
}

const createDocuments = (files: ExternalSignupApplication['documents']): KYCDocument[] =>
  Object.entries(files)
    .filter((entry): entry is [keyof ExternalSignupApplication['documents'], File] => Boolean(entry[1]))
    .map(([type, file]) => ({
      id: `doc_${type.toLowerCase()}_${Date.now()}`,
      type,
      title: file.name,
      documentNumberMasked: 'Submitted by external applicant',
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    }));

class ExternalSignupService {
  submit(application: ExternalSignupApplication): { reference: string } {
    const timestamp = Date.now();
    const suffix = String(timestamp).slice(-6);
    const reference = `QSP-APP-${suffix}`;
    const documents = createDocuments(application.documents);
    const now = new Date().toISOString();

    if (application.role === 'DISTRIBUTOR') {
      hierarchyService.addDistributorRecord({
        id: `dst_ext_${timestamp}`,
        code: `DST-P${suffix}`,
        userId: `usr_pending_${timestamp}`,
        name: application.fullName,
        businessName: application.businessName,
        email: application.email,
        mobile: application.mobile,
        status: 'INACTIVE',
        kycStatus: 'PENDING',
        approvalStatus: 'PENDING_APPROVAL',
        masterDistributorId: 'md_01',
        walletId: `wlt_pending_${timestamp}`,
        createdByUserId: 'external_signup',
        createdByRole: 'DISTRIBUTOR',
        createdByEntityId: 'PUBLIC_PORTAL',
        createdAt: now,
        updatedAt: now,
        documents,
      });
    } else {
      hierarchyService.addRetailerRecord({
        id: `ret_ext_${timestamp}`,
        code: `RET-P${suffix}`,
        userId: `usr_pending_${timestamp}`,
        name: application.fullName,
        businessName: application.businessName,
        email: application.email,
        mobile: application.mobile,
        accountStatus: 'INACTIVE',
        kycStatus: 'PENDING',
        approvalStatus: 'PENDING_APPROVAL',
        masterDistributorId: 'md_01',
        distributorId: 'dst_01',
        planId: 'PLAN_STANDARD',
        walletId: `wlt_pending_${timestamp}`,
        createdByUserId: 'external_signup',
        createdByRole: 'RETAILER',
        createdByEntityId: 'PUBLIC_PORTAL',
        createdAt: now,
        updatedAt: now,
        documents,
      });
    }

    return { reference };
  }
}

export const externalSignupService = new ExternalSignupService();
