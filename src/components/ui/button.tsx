import type { ComponentProps } from 'react';
import { Button as RadixButton } from '@radix-ui/themes';
import { cn } from '@/lib/utils';

type RadixButtonProps = ComponentProps<typeof RadixButton>;

type Variant = 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'soft';
type Size = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends Omit<RadixButtonProps, 'variant' | 'size' | 'color'> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default:
    'bg-gradient-to-r from-[#0b1224] via-[#111c32] to-[#0b1224] text-white shadow-[0_28px_60px_rgba(15,23,42,0.25)] hover:from-[#0d1730] hover:via-[#182540] hover:to-[#0d1730] hover:shadow-[0_38px_80px_rgba(15,23,42,0.3)]',
  outline: 'border border-[#E0E0E0] text-[#1C1C1C] hover:bg-[#F5F5F5] shadow-none',
  ghost: 'text-[#666666] hover:bg-[#F5F5F5] shadow-none',
  destructive: 'bg-[#C53030] text-white hover:bg-[#A52626] shadow-[0_18px_45px_rgba(197,48,48,0.35)]',
  secondary: 'bg-[#E9F1FA] text-[#1C1C1C] hover:bg-[#d9e7f7] shadow-none',
  soft: 'bg-[#F6FBFF] text-[#1C1C1C] hover:bg-[#edf5fb] shadow-none'
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  default: 'px-6 py-3 text-sm',
  lg: 'px-7 py-4 text-base',
  icon: 'px-3 py-3 text-sm'
};

export const Button = ({ className, variant = 'default', size = 'default', ...props }: ButtonProps) => {
  const variantClass = variantClasses[variant] ?? variantClasses.default;
  const sizeClass = sizeClasses[size] ?? sizeClasses.default;

  return (
    <RadixButton
      {...props}
      radius="full"
      variant="ghost"
      color="gray"
      className={cn(
        'font-semibold tracking-tight transition-all duration-200 hover:scale-[1.02]',
        variantClass,
        sizeClass,
        className
      )}
    />
  );
};
