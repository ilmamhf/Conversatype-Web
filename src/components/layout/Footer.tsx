import React from 'react';
import { RotateCcw, Keyboard, Globe } from 'lucide-react';

interface FooterProps {
  onRestart: () => void;
  onOpenScenarios: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onRestart, onOpenScenarios }) => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-app)',
        color: 'var(--text-secondary)',
      }}
      className="w-full border-t-2 py-2 px-4 text-xs shrink-0 select-none transition-colors duration-200"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Keyboard Shortcuts Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRestart}
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
              color: 'var(--text-primary)',
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 text-[11px] font-bold hover:brightness-95 transition-all"
          >
            <RotateCcw className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
            <span>Restart</span>
            <kbd
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-app)',
              }}
              className="px-1 py-0.2 text-[9px] border rounded font-mono"
            >
              Tab+Enter
            </kbd>
          </button>

          <button
            onClick={onOpenScenarios}
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
              color: 'var(--text-primary)',
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 text-[11px] font-bold hover:brightness-95 transition-all"
          >
            <Keyboard className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Scenario Menu</span>
            <kbd
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-app)',
              }}
              className="px-1 py-0.2 text-[9px] border rounded font-mono"
            >
              Esc
            </kbd>
          </button>
        </div>

        {/* SEO & English Practice Informational Note */}
        <div
          style={{ color: 'var(--text-muted)' }}
          className="hidden sm:flex items-center gap-1.5 text-[11px]"
        >
          <Globe className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
          <span>Conversational English Typing Simulator</span>
        </div>
      </div>
    </footer>
  );
};
