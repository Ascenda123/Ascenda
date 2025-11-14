import * as React from 'react';
import { Label as RadixLabel } from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.ComponentProps<typeof RadixLabel> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <RadixLabel
    ref={ref}
    className={cn('text-xs font-medium uppercase tracking-[0.2em] text-slate-500', className)}
    {...props}
  />
));
Label.displayName = 'Label';
