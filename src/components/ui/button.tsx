import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-iris via-sunrise/80 to-cyan text-white shadow-glow-sm hover:-translate-y-0.5 hover:shadow-glow-lg',
        outline:
          'border border-white/20 bg-white/5 text-white/90 backdrop-blur hover:border-white/40 hover:-translate-y-0.5',
        ghost: 'text-white/80 hover:text-white hover:bg-white/5',
        destructive: 'bg-red-600 text-white hover:bg-red-500/90',
        secondary: 'bg-white text-night hover:bg-sand hover:text-night',
        soft: 'bg-iris/15 text-iris hover:bg-iris/25'
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
