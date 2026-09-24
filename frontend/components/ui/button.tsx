'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'solid' | 'hazard' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 border-2 font-display font-black uppercase ' +
  'tracking-tight transition-none select-none disabled:opacity-35 disabled:cursor-not-allowed ' +
  'active:translate-x-[2px] active:translate-y-[2px] cursor-pointer whitespace-nowrap';

const variants: Record<Variant, string> = {
  solid: 'border-ink bg-ink text-paper hover:bg-hazard hover:border-hazard',
  hazard: 'border-hazard bg-hazard text-paper hover:bg-ink hover:border-ink',
  outline: 'border-ink bg-paper text-ink hover:bg-ink hover:text-paper',
  ghost: 'border-transparent bg-transparent text-ink hover:border-ink',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[0.7rem]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-base',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', size = 'md', ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
);
Button.displayName = 'Button';
