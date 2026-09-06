import React, { useRef, useEffect, useState } from 'react';
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
  onCharInput?: (char: string) => void;
  onBackspace?: () => void;
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
  onCharInput,
  onBackspace,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Android Chrome & Mobile Virtual Keyboard Buffer:
   * 
   * Mobile browsers (notably Android Chrome with GBoard / Samsung Keyboard) emit
   * keyCode 229 ("Unidentified") for keydown events during composition. Crucially,
   * if an <input> is empty (""), pressing Backspace on a virtual keyboard produces NO
   * change or input event because there is nothing to delete.
   * 
   * Solution: We prime the hidden input with a 2-space buffer ('  ').
   * - Backspace: val.length becomes < 2 -> we detect (2 - val.length) deletions and trigger onBackspace.
   * - Typed Char: val.length becomes > 2 -> we extract val.slice(2) and trigger onCharInput.
   * - In either case, we reset the buffer back to '  ' synchronously.
   */
  const [inputValue, setInputValue] = useState('  ');

  // Auto-scroll inside typing box if text wraps
  useEffect(() => {
    if (containerRef.current) {
      const activeChar = containerRef.current.querySelector('[data-active="true"]');
      if (activeChar) {
        activeChar.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  // Keep input buffer primed when turn or target text changes
  useEffect(() => {
    setInputValue('  ');
    if (isUserTurn && isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isUserTurn, targetText]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isUserTurn) return;

    // Handle Backspace for hardware keyboards
    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace?.();
      setInputValue('  ');
      return;
    }

    // Single printable character
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && e.key !== 'Unidentified') {
      e.preventDefault();
      onCharInput?.(e.key);
      setInputValue('  ');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserTurn) return;
    const val = e.target.value;

    if (val.length < 2) {
      // User pressed Backspace on mobile keyboard (deleted one or more buffer spaces)
      const deletesCount = 2 - val.length;
      for (let i = 0; i < deletesCount; i++) {
        onBackspace?.();
      }
    } else if (val.length > 2) {
      // User typed character(s) or accepted autocomplete on mobile keyboard
      const addedText = val.slice(2);
      for (const char of addedText) {
        onCharInput?.(char);
      }
    }

    // Synchronously reset buffer back to 2 spaces
    setInputValue('  ');
  };

  const handleSurfaceClick = () => {
    if (isUserTurn && inputRef.current) {
      inputRef.current.focus();
    }
  };

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
      className="border-t px-3 py-2 sm:px-4 sm:py-3.5 rounded-b-3xl shrink-0 transition-colors duration-200"
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
        onClick={handleSurfaceClick}
        style={{
          backgroundColor: 'var(--bg-surface-secondary)',
          borderColor: isUserTurn ? 'var(--color-brand)' : 'var(--border-app)',
        }}
        className={clsx(
          'relative w-full min-h-[58px] sm:min-h-[72px] max-h-[88px] sm:max-h-[110px] p-2.5 sm:p-3 rounded-2xl border-2 transition-all duration-150 overflow-y-auto font-mono text-sm sm:text-base md:text-lg leading-relaxed shadow-inner cursor-text',
          !isUserTurn && 'opacity-60 cursor-not-allowed'
        )}
      >
        {/* Hidden Transparent Input for Mobile Virtual Keyboard & Physical Keyboards */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
          disabled={!isUserTurn}
          aria-label="Conversational typing input"
          className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-text caret-transparent"
        />

        {/* Mobile Tap-to-Type Visual Affordance */}
        {isUserTurn && !isFocused && (
          <div className="absolute right-2.5 bottom-2 sm:hidden z-30 pointer-events-none">
            <span
              style={{
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-brand-text)',
                boxShadow: '0 2px 0 0 var(--color-brand-shadow)',
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse shadow-md"
            >
              Tap to type ⌨️
            </span>
          </div>
        )}

        {isUserTurn ? (
          <div className="whitespace-pre-wrap break-words tracking-wide">
            {renderCharacters()}
          </div>
        ) : (
          <div
            style={{ color: 'var(--text-muted)' }}
            className="flex items-center justify-center h-full text-xs sm:text-sm font-sans italic"
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
