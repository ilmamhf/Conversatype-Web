import React from 'react';
import { clsx } from 'clsx';
import { soundService } from '../../lib/audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tactile?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  tactile = true,
  className,
  onClick,
  children,
  style,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundService.playKeyClick();
    if (onClick) onClick(e);
  };

  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all rounded-2xl select-none focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  let customStyle: React.CSSProperties = { ...style };
  let variantClass = '';

  if (variant === 'primary') {
    customStyle = {
      backgroundColor: 'var(--color-brand)',
      color: 'var(--color-brand-text)',
      boxShadow: tactile ? '0 4px 0 0 var(--color-brand-shadow)' : undefined,
      ...customStyle,
    };
    variantClass = tactile ? 'active:translate-y-1 active:shadow-none' : '';
  } else if (variant === 'secondary') {
    customStyle = {
      backgroundColor: 'var(--bg-surface-secondary)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-app)',
      boxShadow: tactile ? '0 4px 0 0 var(--border-strong)' : undefined,
      ...customStyle,
    };
    variantClass = clsx('border-2', tactile && 'active:translate-y-1 active:shadow-none');
  } else if (variant === 'outline') {
    customStyle = {
      borderColor: 'var(--border-strong)',
      color: 'var(--text-primary)',
      backgroundColor: 'transparent',
      ...customStyle,
    };
    variantClass = 'border-2 active:scale-95';
  } else if (variant === 'ghost') {
    customStyle = {
      color: 'var(--text-secondary)',
      backgroundColor: 'transparent',
      ...customStyle,
    };
    variantClass = 'hover:brightness-95 active:scale-95';
  }

  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variantClass, className)}
      style={customStyle}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
