'use client';
/* eslint-disable @next/next/no-img-element -- generated data URLs are not supported by the image optimizer */

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function PaymentQr({ value, size = 176, onReady }: { value: string; size?: number; onReady?: (dataUrl: string) => void }) {
  const [source, setSource] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size * 2, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then((dataUrl) => {
        if (!active) return;
        setSource(dataUrl);
        onReady?.(dataUrl);
      });
    return () => { active = false; };
  }, [value, size, onReady]);

  if (!source) return <div style={{ width: size, height: size }} className="animate-pulse rounded-xl border border-slate-200 bg-slate-100" />;
  return <img src={source} width={size} height={size} alt="Scannable UPI payment QR code" className="rounded-xl border border-slate-200 bg-white" />;
}
