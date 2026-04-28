'use client';

import { useMemo } from 'react';

interface StarfieldProps {
  count?: number;
  className?: string;
}

export function Starfield({ count = 60, className = '' }: StarfieldProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() > 0.85 ? 'star-large' : '',
      duration: `${2 + Math.random() * 5}s`,
      delay: `${Math.random() * 5}s`,
      opacity: 0.15 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.size}`}
          style={{
            left: star.left,
            top: star.top,
            '--twinkle-duration': star.duration,
            '--twinkle-delay': star.delay,
            opacity: star.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
