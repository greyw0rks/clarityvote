import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Nav }         from '@/components/Nav';
import { Footer }      from '@/components/Footer';

export const metadata: Metadata = {
  title:       'ClarityVote',
  description: 'On-chain governance for Stacks communities',
  icons:       { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppProvider>
          <Nav />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
