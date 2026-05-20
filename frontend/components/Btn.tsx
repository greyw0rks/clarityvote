'use client';

import type { ReactNode, CSSProperties } from 'react';
import { T } from '@/lib/tokens';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle';

interface Props {
  children:  ReactNode;
  onClick?:  () => void;
  variant?:  Variant;
  disabled?: boolean;
  full?:     boolean;
  sm?:       boolean;
  type?:     'button' | 'submit';
}

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: { background: T.g,                       color: T.bg  },
  ghost:   { background: 'transparent',             color: T.tx,  border: `1px solid ${T.bdr}` },
  danger:  { background: 'rgba(240,96,96,.1)',      color: T.red, border: `1px solid #3A1E1E`  },
  subtle:  { background: T.s2,                      color: T.mu,  border: `1px solid ${T.bdr}` },
};

export function Btn({
  children, onClick, variant = 'primary',
  disabled = false, full = false, sm = false, type = 'button',
}: Props) {
  const base: CSSProperties = {
    border:       'none',
    borderRadius: 8,
    fontFamily:   "'DM Sans', sans-serif",
    fontWeight:   600,
    cursor:       disabled ? 'not-allowed' : 'pointer',
    opacity:      disabled ? 0.45 : 1,
    padding:      sm ? '6px 14px' : '10px 22px',
    fontSize:     sm ? 13 : 15,
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent: 'center',
    gap:          7,
    width:        full ? '100%' : undefined,
    transition:   'all .15s',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...VARIANTS[variant] }}>
      {children}
    </button>
  );
}
