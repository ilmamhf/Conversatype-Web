import React, { useRef, useEffect } from 'react';
import { TypedCharRecord, TypingMetrics } from '../../types/typing';
import { CaretStyle } from '../../types/settings';
import { Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface TypingInputProps {
  targetText: string;
  history: TypedCharRecord[];
  currentIndex: number;
  isUserTurn: boolean;
  isNpcTyping: boolean;
  metrics: TypingMetrics;
  progressPercent: number;
  caretStyle?: CaretStyle;
}

export const TypingInput: React.FC<TypingInputProps> = ({
  targetText,
  history,
  currentIndex,
  isUserTurn,
  isNpcTyping,
  metrics,
  progressPercent,
  caretStyle = 'line',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside typing box if text wraps
  useEffect(() => {
    if (containerRef.current) {
      const activeChar = containerRef.current.querySelector('[data-active="true"]');
      if (activeChar) {
        activeChar.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  const renderCharacters = () => {
    if (!targetText) return null;

    return targetText.split('').map((char, index) => {
      const typed = history[index];
      const isPast = index < currentIndex;
      const isCurrent = index === currentIndex && isUserTurn;

      let charStyle: React.CSSProperties = { color: 'var(--char-pending)' };
      let displayChar = char;

      if (isPast && typed) {
        if (typed.isCorrect) {
          charStyle = { color: 'var(--char-correct)', fontWeight: 600 };
        } else {
          charStyle = {
            backgroundColor: 'var(--char-incorrect-bg)',
            color: 'var(--char-incorrect-text)',
            borderRadius: '3px',
            fontWeight: 700,
            textDecoration: 'underline',
          };
          displayChar = typed.typed === ' ' ? '␣' : typed.typed;
        }
      }

      const isSpace = char === ' ';

      return (
        <span
          key={index}
          data-active={isCurrent}
          style={charStyle}
          className={clsx(
            'relative inline-block transition-colors font-mono whitespace-pre select-none',
            isSpace && 'min-w-[0.55em]'
          )}
        >
          {isCurrent && (
            <span
              style={{ backgroundColor: 'var(--caret-color)' }}
              className={clsx(
                'absolute pointer-events-none animate-caret z-10',
                caretStyle === 'line' && 'left-0 top-1 bottom-1 w-[2.5px] rounded-full',
                caretStyle === 'block' && 'inset-0 opacity-40 rounded',
                caretStyle === 'underline' && 'left-0 right-0 -bottom-0.5 h-[3px] rounded-full'
              )}
            />
          )}
          {displayChar}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-app)',
      }}
      className="border-t px-4 py-3 sm:py-3.5 rounded-b-3xl shrink-0 transition-colors duration-200"
    >
      {/* Top Status & Live Metrics Header */}
      <div className="flex items-center justify-between text-xs mb-2 font-semibold select-none">
        <div className="flex items-center gap-2">
          {isUserTurn ? (
            <span
              style={{
                backgroundColor: 'rgba(88, 204, 2, 0.15)',
                color: 'var(--color-brand)',
                borderColor: 'var(--color-brand)',
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold"
            >
              <span
                style={{ backgroundColor: 'var(--color-brand)' }}
                className="w-2 h-2 rounded-full animate-ping"
              />
              Your Turn to Type
            </span>
          ) : isNpcTyping ? (
            <span
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-app)',
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold"
            >
              NPC is replying...
            </span>
          ) : (
            <span
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-app)',
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold"
            >
              Waiting...
            </span>
          )}
        </div>

        {/* Live Metrics Pill Bar */}
        {isUserTurn && (
          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <div className="flex items-center gap-1 text-amber-500">
              <Zap className="w-3.5 h-3.5" />
              <span>{metrics.wpm} WPM</span>
            </div>
            <div
              style={{ color: 'var(--char-correct)' }}
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.accuracy}%</span>
            </div>
            {metrics.errors > 0 && (
              <div className="flex items-center gap-1 text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{metrics.errors} ERR</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Typing Surface */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: 'var(--bg-surface-secondary)',
          borderColor: isUserTurn ? 'var(--color-brand)' : 'var(--border-app)',
        }}
        className={clsx(
          'relative w-full min-h-[72px] max-h-[110px] p-3 rounded-2xl border-2 transition-all duration-150 overflow-y-auto font-mono text-base md:text-lg leading-relaxed shadow-inner',
          !isUserTurn && 'opacity-60 cursor-not-allowed'
        )}
      >
        {isUserTurn ? (
          <div className="whitespace-pre-wrap break-words tracking-wide">
            {renderCharacters()}
          </div>
        ) : (
          <div
            style={{ color: 'var(--text-muted)' }}
            className="flex items-center justify-center h-full text-sm font-sans italic"
          >
            {isNpcTyping ? 'NPC is drafting a response...' : 'Prepare for next message...'}
          </div>
        )}
      </div>

      {/* Sentence Progress Bar */}
      {isUserTurn && (
        <div
          style={{ backgroundColor: 'var(--border-app)' }}
          className="w-full h-1.5 rounded-full mt-2 overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all duration-100 ease-out"
            style={{
              backgroundColor: 'var(--color-brand)',
              width: `${progressPercent}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
