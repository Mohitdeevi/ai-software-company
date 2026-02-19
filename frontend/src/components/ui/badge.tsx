import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
        success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
        danger: 'bg-red-500/15 text-red-400 border border-red-500/20',
        outline: 'border border-white/10 text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
