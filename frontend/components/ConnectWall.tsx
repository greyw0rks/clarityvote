'use client';

import { useApp } from '@/lib/store';
import { Button } from './ui/button';

export function ConnectWall({ message = 'CONNECT A STACKS WALLET TO CONTINUE' }: { message?: string }) {
  const { connect } = useApp();
  return (
    <div className="border-2 border-ink bg-paper-2 p-8 text-center">
      <div className="macro text-2xl">WALLET REQUIRED</div>
      <p className="mx-auto mt-2 max-w-md mono text-[0.7rem] uppercase tracking-widest text-ink-3">
        {message}
      </p>
      <Button className="mt-5" onClick={connect}>CONNECT WALLET »</Button>
    </div>
  );
}
