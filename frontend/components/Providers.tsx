'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AppProvider } from '@/lib/store';
import { Nav } from './Nav';
import { Footer } from './Footer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <Nav />
      <main className="mx-auto min-h-[70vh] max-w-[1400px]">{children}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            border: '2px solid #0a0a0a',
            borderRadius: 0,
            background: '#f4f4f0',
            color: '#0a0a0a',
            fontFamily: 'var(--font-jbmono), monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        }}
      />
    </AppProvider>
  );
}
