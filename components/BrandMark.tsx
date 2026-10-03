"use client";
import type { CSSProperties } from 'react';

type BrandMarkProps = {
  className?: string;
  size?: 'inline' | 'nav' | 'hero' | 'footer';
  variant?: 'light' | 'dark';
};

const sizes: Record<NonNullable<BrandMarkProps['size']>, string> = {
  inline: 'text-[0.95em] tracking-[0.05em] px-0.5',
  nav: 'text-xl tracking-[0.08em]',
  hero: 'text-[clamp(3.4rem,13vw,10rem)] tracking-[0.06em]',
  footer: 'text-[clamp(3.5rem,16vw,14rem)] tracking-[0.06em]',
};

export default function BrandMark({
  className = '',
  size = 'nav',
  variant = 'light',
}: BrandMarkProps) {
  const isInline = size === 'inline';
  const textColor = isInline
    ? (variant === 'dark' ? '#f6eed9' : '#1a1620')
    : (variant === 'dark' ? '#f6eed9' : '#1a1620');
  
  const shadowColor = '#e8542b';
  const glowColor = 'rgba(232,84,43,0.2)';

  const style: CSSProperties = {
    color: textColor,
    textShadow: isInline ? 'none' : `2.5px 3.5px 0 ${shadowColor}, 0 0 24px ${glowColor}`,
    transform: isInline ? 'none' : 'rotate(-3deg)',
    display: 'inline-block',
    fontStyle: 'italic',
    fontWeight: 800,
  };

  return (
    <span
      aria-label="STEAD"
      className={`brand-mark relative font-serif leading-none select-none ${sizes[size]} ${className}`}
      style={style}
    >
      STEAD
    </span>
  );
}
