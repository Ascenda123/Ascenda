'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const blobTransition = {
  duration: 14,
  repeat: Infinity,
  ease: 'easeInOut' as const
};

interface AnimatedBlobBannerProps {
  className?: string;
  variant?: 'cool' | 'warm';
}

export const AnimatedBlobBanner = ({ className, variant = 'cool' }: AnimatedBlobBannerProps) => {
  const isWarm = variant === 'warm';
  const overlays = [
    {
      className: 'h-[420px] w-[420px]',
      from: { x: -40, y: -20, scale: 0.9 },
      to: { x: 40, y: 30, scale: 1.1 },
      background: isWarm ? '#f9f1eb' : '#f5f5f7'
    },
    {
      className: 'h-[520px] w-[520px]',
      from: { x: 20, y: 40, scale: 1.05 },
      to: { x: -30, y: -25, scale: 0.95 },
      background: isWarm ? '#fdf4e8' : '#ffffff'
    }
  ];

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute inset-0">
        {overlays.map((overlay, index) => (
          <motion.div
            key={overlay.className}
            className={cn(
              'absolute left-1/2 top-1/3 -translate-x-1/2 rounded-[45%] blur-[120px] opacity-60',
              overlay.className
            )}
            initial={overlay.from}
            animate={overlay.to}
            transition={{ ...blobTransition, delay: index * 2 }}
            style={{ background: overlay.background }}
          />
        ))}
      </div>
    </div>
  );
};
