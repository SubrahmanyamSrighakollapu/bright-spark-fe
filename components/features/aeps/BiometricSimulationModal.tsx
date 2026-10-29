'use client';

import { useState } from 'react';
import { Fingerprint, Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import { Button, Modal, StatusBadge } from '@/components/ui';
import type { AEPSBiometricState } from '@/types/aeps';
import { captureFingerprint } from '@/services/aepsRdService';

interface Props { isOpen: boolean; deviceName: string; title?: string; subject?: 'retailer' | 'customer'; wadh?: string; onSuccess: (pidData: string) => void; onFailure?: (message: string) => void; onClose: () => void; }

export function BiometricSimulationModal({ isOpen, deviceName, title = 'Customer Biometric Authentication', subject = 'customer', wadh, onSuccess, onFailure, onClose }: Props) {
  const [state, setState] = useState<AEPSBiometricState>('DEVICE_READY');
  const [error, setError] = useState('');
  const capture = async () => {
    setState('CAPTURING');
    setError('');
    try {
      const pidData = await captureFingerprint(wadh);
      setState('CAPTURE_SUCCESS');
      window.setTimeout(() => { setState('DEVICE_READY'); onSuccess(pidData); }, 350);
    } catch (captureError) {
      const message = captureError instanceof Error ? captureError.message : 'Fingerprint capture failed';
      setError(message); setState('CAPTURE_FAILED'); onFailure?.(message);
    }
  };
  const close = () => { setState('CANCELLED'); onClose(); };

  return <Modal isOpen={isOpen} onClose={close} title={title} description={`Place the ${subject}’s finger on the selected registered device to continue.`} size="md"
    footer={<><Button variant="ghost" onClick={close}>Cancel</Button>{state === 'CAPTURE_FAILED' && <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => { setState('DEVICE_READY'); setError(''); }}>Retry Capture</Button>}{state !== 'CAPTURING' && state !== 'CAPTURE_SUCCESS' && <Button onClick={() => void capture()}>Capture Fingerprint</Button>}</>}>
    <div className="space-y-5 text-center">
      <div className={`mx-auto grid h-28 w-28 place-items-center rounded-full border-4 ${state === 'CAPTURE_FAILED' ? 'border-rose-200 bg-rose-50 text-rose-600' : state === 'CAPTURE_SUCCESS' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-[#D4E1AE] bg-[#F3F7E9] text-[#2F6F5E]'}`}>
        {state === 'CAPTURING' ? <Loader2 className="h-14 w-14 animate-spin" /> : state === 'CAPTURE_FAILED' ? <ShieldAlert className="h-14 w-14" /> : <Fingerprint className={`h-16 w-16 ${state === 'DEVICE_READY' ? 'animate-pulse' : ''}`} />}
      </div>
      <div><StatusBadge status={state === 'CAPTURE_SUCCESS' ? 'SUCCESS' : state === 'CAPTURE_FAILED' ? 'FAILED' : 'PENDING'} label={state.replaceAll('_', ' ')} /><h4 className="mt-3 font-bold text-slate-900">{state === 'CAPTURING' ? 'Capturing fingerprint…' : state === 'CAPTURE_SUCCESS' ? 'Fingerprint captured successfully' : state === 'CAPTURE_FAILED' ? 'Fingerprint capture failed' : 'Registered device ready'}</h4><p className="mt-1 text-sm text-slate-500">{deviceName || 'Select a registered device before continuing.'}</p></div>
      {error && <p className="rounded-lg bg-rose-50 p-3 text-left text-xs text-rose-700">{error}</p>}
      <div className="rounded-xl border border-[#D4E1AE] bg-[#F3F7E9] p-3 text-left text-xs leading-5 text-[#245448]"><b>Biometric guidance:</b> keep the finger steady on the registered device until capture is completed.</div>
    </div>
  </Modal>;
}



