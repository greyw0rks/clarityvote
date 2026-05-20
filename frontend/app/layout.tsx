import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Nav }         from '@/components/Nav';
import { Footer }      from '@/components/Footer';

export const metadata: Metadata = {
  title:       'ClarityVote',
  description: 'On-chain governance for Stacks communities',
  icons:       { icon: '/Clarity.png' },
  other: {
        // Talent Protocol verification (update with your actual meta tag)
        "talentapp:project_verification": "58af170fae777e79fc0e01e03c00bd9541433dfd37c89bdaeeed0f2bbe1974c08e482e302c2245a1ce19a272e5f03518dd0937be64631738bb6b17757896488b",
      },
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
