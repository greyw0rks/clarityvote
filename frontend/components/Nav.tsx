'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { APP_NAME } from '@/lib/config';
import { trunc } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { Button } from './ui/button';

const LINKS = [
  { href: '/proposals', label: 'PROPOSALS' },
  { href: '/delegation', label: 'DELEGATION' },
  { href: '/timelock', label: 'TIMELOCK' },
];

export function Nav() {
  const { connected, address, network, connect, disconnect } = useApp();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-[1400px] items-stretch">
        <Link
          href="/"
          className="flex items-center gap-2 border-r-2 border-ink px-5 macro text-xl hover:bg-ink hover:text-paper"
        >
          {APP_NAME}<span className="text-hazard">®</span>
        </Link>

        <nav className="flex items-stretch">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex items-center border-r-2 border-ink px-4 font-mono text-[0.7rem] font-bold uppercase tracking-widest',
                  active ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-2',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 px-4">
          <span className="hidden items-center gap-1.5 border-2 border-ink px-2 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-widest sm:inline-flex">
            <span className={cn('h-2 w-2', network === 'mainnet' ? 'bg-hazard' : 'bg-ink', 'blink')} />
            {network}
          </span>
          {connected ? (
            <button
              onClick={disconnect}
              className="border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-widest hover:bg-hazard hover:border-hazard hover:text-paper"
              title="Disconnect"
            >
              {trunc(address, 5)}
            </button>
          ) : (
            <Button size="sm" onClick={connect}>CONNECT</Button>
          )}
        </div>
      </div>
    </header>
  );
}
