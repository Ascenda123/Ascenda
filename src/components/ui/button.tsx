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

const variantMap: Record<Variant, { color: RadixButtonProps['color']; variant: RadixButtonProps['variant'] }> = {
  default: { color: 'gray', variant: 'solid' },
  outline: { color: 'gray', variant: 'outline' },
  ghost: { color: 'gray', variant: 'ghost' },
  destructive: { color: 'red', variant: 'solid' },
  secondary: { color: 'jade', variant: 'soft' },
  soft: { color: 'gray', variant: 'soft' }
};

const sizeMap: Record<Size, RadixButtonProps['size']> = {
  sm: '2',
  default: '3',
  lg: '4',
  icon: '2'
};

export const Button = ({ className, variant = 'default', size = 'default', ...props }: ButtonProps) => {
  const mappedVariant = variantMap[variant] ?? variantMap.default;
  const mappedSize = sizeMap[size] ?? '3';

  return (
    <RadixButton
      {...props}
      radius="full"
      size={mappedSize}
      variant={mappedVariant.variant}
      color={mappedVariant.color}
      highContrast
      className={cn('font-semibold tracking-tight transition-all duration-200', className)}
    />
  );
};
