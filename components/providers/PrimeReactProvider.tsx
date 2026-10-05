'use client';

import { PrimeReactProvider as PrimeProvider } from 'primereact/api';
import type { ReactNode } from 'react';

export interface QinStarPrimeReactProviderProps {
  children: ReactNode;
}

/**
 * Application-wide PrimeReact boundary.
 *
 * Qin Star uses PrimeReact 10's unstyled components so the product's existing
 * design tokens remain authoritative and tenant branding can be swapped
 * without changing component code.
 */
export function QinStarPrimeReactProvider({ children }: QinStarPrimeReactProviderProps) {
  return (
    <PrimeProvider value={{
      ripple: false,
      unstyled: true,
      zIndex: { modal: 1200, overlay: 1100, menu: 1100, tooltip: 1300 },
    }}>
      {children}
    </PrimeProvider>
  );
}
