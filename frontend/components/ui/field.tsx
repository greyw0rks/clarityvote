import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const fieldBase =
  'w-full border-2 border-ink bg-paper px-3 py-2.5 font-mono text-sm text-ink ' +
  'placeholder:text-ink-3 focus:outline-none focus:bg-paper-2 focus:border-hazard';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, 'resize-none leading-relaxed', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export function Field({
  label, hint, children, count,
}: {
  label: string;
  hint?: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="tele font-bold text-ink">{label}</span>
        {count && <span className="mono text-[0.7rem] text-ink-3">{count}</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 mono text-[0.7rem] text-ink-3">{hint}</p>}
    </label>
  );
}
