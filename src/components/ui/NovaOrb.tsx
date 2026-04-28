'use client';

import { cn } from '@/lib/utils';

interface NovaOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
};

const glowSizeMap = {
  sm: 'shadow-[0_0_10px_rgba(124,92,252,0.4)]',
  md: 'shadow-[0_0_20px_rgba(124,92,252,0.5)]',
  lg: 'shadow-[0_0_40px_rgba(124,92,252,0.6)]',
};

export function NovaOrb({ size = 'md', className, animate = true }: NovaOrbProps) {
  return (
    <div
      className={cn(
        'relative rounded-full',
        sizeMap[size],
        className
      )}
    >
      {/* Outer glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          glowSizeMap[size],
          animate && 'animate-[pulse-glow_3s_ease-in-out_infinite]',
          'bg-gradient-to-br from-[#7C5CFC] to-[#00D4FF]'
        )}
      />

      {/* Inner orb */}
      <div
        className={cn(
          'absolute inset-[2px] rounded-full',
          'bg-gradient-to-br from-[#9B7FFF] via-[#7C5CFC] to-[#5A3FD6]',
          animate && 'animate-[orb-rotate_4s_linear_infinite]',
          'before:absolute before:inset-0 before:rounded-full',
          'before:bg-gradient-to-tl before:from-white/20 before:to-transparent'
        )}
      >
        {/* Highlight */}
        <div
          className={cn(
            'absolute top-[15%] left-[20%] w-[35%] h-[25%]',
            'rounded-full bg-white/30 blur-[1px]',
            animate && 'animate-[highlight-shimmer_3s_ease-in-out_infinite]'
          )}
        />
      </div>
    </div>
  );
}
