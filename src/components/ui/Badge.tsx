import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'brand' | 'amber' | 'blue' | 'purple' | 'slate' | 'red';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'slate',
  size = 'md',
  children,
  className,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-bold',
  };

  const variantStyles = {
    brand: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    blue: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
    red: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full tracking-wide uppercase',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
