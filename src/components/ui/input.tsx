import * as React from 'react';
import { TextField } from '@radix-ui/themes';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <TextField.Root className={cn('w-full', className)} size="3" radius="full">
      <TextField.Input ref={ref} type={type} {...props} />
    </TextField.Root>
  );
});
Input.displayName = 'Input';
