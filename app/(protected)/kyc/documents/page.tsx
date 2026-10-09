'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Eye, FileCheck2, FileUp, RefreshCw, ShieldAlert } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { kycService, type KYCDocumentRequirement } from '@/services/kycService';
import type { KYCApplication, KYCDocument } from '@/types/domain';

export default function MyKycDocumentsPage() {
  const [requirements, setRequirements] = useState<KYCDocumentRequirement[]>([]);
  const [application, setApplication] = useState<KYCApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [requirementResponse, applicationResponse] = await Promise.all([
        kycService.getRequirements(), kycService.getMyApplication(),
      ]);
      setRequirements(requirementResponse.data ?? []);
      if (!applicationResponse.data) throw new Error('KYC application data was not returned');
      setApplication(applicationResponse.data);
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Unable to load KYC onboarding');
    } finally { setLoading(false); }
  }, [toastError]);

  useEffect(() => { void load(); }, [load]);

  const documentsByType = useMemo(() => new Map((application?.documents ?? []).map((doc) => [doc.type, doc])), [application]);
  const editable = !application || ['PENDING', 'REJECTED'].includes(application.status);
  const requiredComplete = requirements.filter((item) => item.configuration.required).every((item) => documentsByType.has(item.code as KYCDocument['type']));

  const upload = async (requirement: KYCDocumentRequirement, file?: File) => {
    if (!file) return;
    const maxSize = (requirement.configuration.maxSizeMb ?? 5) * 1024 * 1024;
    if (file.size > maxSize) return toastError(`File must be within ${requirement.configuration.maxSizeMb ?? 5} MB`);
    if (requirement.configuration.acceptedMimeTypes?.length && !requirement.configuration.acceptedMimeTypes.includes(file.type)) return toastError('Upload a PDF, JPG or PNG file');
    setBusyCode(requirement.code);
    try {
      const response = await kycService.uploadDocument(requirement.code, file);
      if (!response.data) throw new Error('Uploaded document was not returned');
      setApplication(response.data);
      toastSuccess(`${requirement.label} uploaded successfully`);
    } catch (error) { toastError(error instanceof Error ? error.message : 'Upload failed'); }
    finally { setBusyCode(null); }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const response = await kycService.submitMyApplication();
      if (!response.data) throw new Error('Submitted application was not returned');
      setApplication(response.data);
      toastSuccess('KYC application submitted for review');
    } catch (error) { toastError(error instanceof Error ? error.message : 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <PageContainer title="KYC & Onboarding" description="Upload the documents configured for your account and track their verification status."
      actions={<Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => void load()} isLoading={loading}>Refresh</Button>}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Application</p><div className="mt-3"><StatusBadge status={application?.status ?? 'PENDING'} /></div><p className="mt-2 text-xs text-slate-500">{application?.remarks || 'Complete the required documents and submit for review.'}</p></Card>
        <Card><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Required documents</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{requirements.filter((item) => item.configuration.required).length}</p><p className="text-xs text-slate-500">Configured from the KYC document lookup</p></Card>
        <Card><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Uploaded</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{application?.documents.length ?? 0}</p><p className="text-xs text-slate-500">Files securely linked to this application</p></Card>
      </div>

      {loading ? <Card><div className="py-12 text-center text-sm text-slate-500">Loading document requirements…</div></Card> : (
        <Card title="Document checklist" subtitle="Accepted formats and maximum size are controlled by each document lookup.">
          <div className="divide-y divide-slate-100">
            {requirements.map((requirement) => {
              const document = documentsByType.get(requirement.code as KYCDocument['type']);
              return <div key={requirement.id} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${document ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{document ? <FileCheck2 className="h-5 w-5" /> : <FileUp className="h-5 w-5" />}</span>
                  <div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-900">{requirement.label}</p>{requirement.configuration.required && <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">REQUIRED</span>}{document && <StatusBadge status={document.status} size="sm" />}</div><p className="mt-1 text-xs text-slate-500">{document ? `${(document as KYCDocument & { fileName?: string }).fileName ?? 'Uploaded file'} • Uploaded ${new Date(document.uploadedAt).toLocaleDateString()}` : requirement.description}</p>{document?.rejectionReason && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-700"><ShieldAlert className="h-3.5 w-3.5" />{document.rejectionReason}</p>}</div>
                </div>
                <div className="flex shrink-0 gap-2">{document && <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />} onClick={() => void kycService.openDocument(document.id)}>View</Button>}{editable && <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"><FileUp className="h-4 w-4" />{busyCode === requirement.code ? 'Uploading…' : document ? 'Replace' : 'Upload'}<input className="hidden" type="file" accept={requirement.configuration.acceptedMimeTypes?.includes('application/pdf') ? '.pdf,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png'} disabled={busyCode !== null} onChange={(event) => { void upload(requirement, event.target.files?.[0]); event.currentTarget.value = ''; }} /></label>}</div>
              </div>;
            })}
          </div>
        </Card>
      )}

      {editable && <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center"><div className="flex gap-3">{requiredComplete ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />}<div><p className="font-bold text-slate-900">{requiredComplete ? 'Ready for submission' : 'Complete all required uploads'}</p><p className="text-xs text-slate-600">After submission, files are locked until the reviewer returns the application.</p></div></div><Button onClick={() => void submit()} disabled={!requiredComplete || busyCode !== null} isLoading={submitting} leftIcon={<FileCheck2 className="h-4 w-4" />}>Submit for KYC review</Button></div>}
    </PageContainer>
  );
}
