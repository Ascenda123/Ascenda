import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-white shadow-[0_15px_35px_rgba(15,23,42,0.2)] hover:-translate-y-0.5 hover:bg-slate-800',
        outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
        ghost: 'text-slate-900 hover:bg-slate-50',
        destructive: 'bg-red-600 text-white hover:bg-red-500/90',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        soft: 'bg-slate-900/5 text-slate-900 hover:bg-slate-900/10'
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 rounded-xl px-3',
        lg: 'h-12 rounded-3xl px-8 text-base',
        icon: 'h-10 w-10 rounded-2xl'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = ({ className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
};

export { buttonVariants };
