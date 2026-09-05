import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-app)',
          color: 'var(--text-primary)',
        }}
        className={clsx(
          'w-full border-2 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
          widthStyles[maxWidth]
        )}
      >
        {title && (
          <div
            style={{
              borderColor: 'var(--border-app)',
              backgroundColor: 'var(--bg-surface-secondary)',
            }}
            className="flex items-center justify-between px-5 py-3.5 border-b-2"
          >
            <h3 className="text-base font-extrabold flex items-center gap-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{ color: 'var(--text-secondary)' }}
              className="p-1 rounded-xl hover:brightness-95 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
