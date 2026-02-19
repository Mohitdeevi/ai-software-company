import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white',
          'placeholder:text-gray-500 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 focus:bg-white/[0.07]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50'
            : 'border-white/10 hover:border-white/20',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
