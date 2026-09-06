import { useState, useEffect, useCallback, useRef } from 'react';
import { TypedCharRecord, TypingMetrics, WpmSample } from '../types/typing';
import { SoundPack } from '../types/settings';
import { calculateMetrics } from '../lib/metrics';
import { soundService } from '../lib/audio';

/**
 * Statistical summary passed to the parent dialogue loop upon completing a turn.
 */
export interface SentenceCompletionStats {
  /** Total incorrect keystrokes recorded during this sentence turn. */
  errors: number;
  /** Total characters in the target sentence. */
  totalChars: number;
  /** Characters typed correctly on first evaluation. */
  correctChars: number;
  /** Milliseconds elapsed from the first keystroke to sentence completion. */
  durationMs: number;
  /** Chronological WPM timeline sampled at 500ms intervals. */
  wpmHistory: WpmSample[];
}

interface UseTypingEngineProps {
  /** The target dialogue string the user must type. */
  targetText: string;
  /** Whether the user is currently allowed to type (their turn is active). */
  isActive: boolean;
  /** Active sound pack for acoustic feedback (default: 'thock'). */
  soundPack?: SoundPack;
  /** Callback fired once all characters of targetText have been typed. */
  onSentenceComplete: (stats: SentenceCompletionStats) => void;
}

/**
 * useTypingEngine
 * 
 * Core Monkeytype-grade typing engine hook.
 * 
 * Key Responsibilities:
 * 1. Tracks character-by-character typed history with strict position matching.
 * 2. Provides smart quote normalization (straight quotes match typographic quotes).
 * 3. Handles backspacing and rollback without desynchronizing state.
 * 4. Dispatches acoustic feedback using the injected soundPack.
 * 5. Periodically recalculates live typing speed (WPM/Raw WPM) and accuracy.
 * 6. Coordinates seamlessly with both hardware keyboards (window listener) and
 *    mobile virtual keyboards (via TypingInput component).
 */
export function useTypingEngine({
  targetText,
  isActive,
  soundPack = 'thock',
  onSentenceComplete,
}: UseTypingEngineProps) {
  const [history, setHistory] = useState<TypedCharRecord[]>([]);
  const [errors, setErrors] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<TypingMetrics>({
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    errors: 0,
    totalCharsTyped: 0,
    correctCharsTyped: 0,
    elapsedSeconds: 0,
    wpmHistory: [],
  });

  const wpmHistoryRef = useRef<WpmSample[]>([]);
  const metricsIntervalRef = useRef<number | null>(null);

  // Reset engine whenever target text changes
  useEffect(() => {
    setHistory([]);
    setErrors(0);
    setStartTime(null);
    wpmHistoryRef.current = [];
    setMetrics({
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errors: 0,
      totalCharsTyped: 0,
      correctCharsTyped: 0,
      elapsedSeconds: 0,
      wpmHistory: [],
    });
  }, [targetText]);

  // Periodic metrics updater while typing
  useEffect(() => {
    if (!isActive || !startTime) {
      if (metricsIntervalRef.current) {
        window.clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }
      return;
    }

    metricsIntervalRef.current = window.setInterval(() => {
      const correctCount = history.filter((c) => c.isCorrect).length;
      const totalCount = history.length;
      const now = performance.now();
      const current = calculateMetrics(correctCount, totalCount, errors, startTime, now);

      wpmHistoryRef.current.push({
        second: current.elapsedSeconds,
        wpm: current.wpm,
        rawWpm: current.rawWpm,
        errors,
      });

      setMetrics({
        wpm: current.wpm,
        rawWpm: current.rawWpm,
        accuracy: current.accuracy,
        errors,
        totalCharsTyped: totalCount,
        correctCharsTyped: correctCount,
        elapsedSeconds: current.elapsedSeconds,
        wpmHistory: [...wpmHistoryRef.current],
      });
    }, 500);

    return () => {
      if (metricsIntervalRef.current) {
        window.clearInterval(metricsIntervalRef.current);
      }
    };
  }, [isActive, startTime, history, errors]);

  const handleBackspace = useCallback(() => {
    if (!isActive) return;
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      soundService.playKeyClick(soundPack);
      return prev.slice(0, -1);
    });
  }, [isActive, soundPack]);

  const handleCharTyped = useCallback(
    (typedChar: string) => {
      if (!isActive || !targetText) return;

      const currentIndex = history.length;
      if (currentIndex >= targetText.length) return;

      const expectedChar = targetText[currentIndex];
      // Normalize typographic/smart quotes with standard ASCII equivalents
      // so users on mobile (smart punctuation) or different keyboard layouts aren't penalized
      const isCorrect =
        typedChar === expectedChar ||
        ((typedChar === "'" || typedChar === '’' || typedChar === '`') &&
          (expectedChar === "'" || expectedChar === '’' || expectedChar === '`')) ||
        ((typedChar === '"' || typedChar === '“' || typedChar === '”') &&
          (expectedChar === '"' || expectedChar === '“' || expectedChar === '”'));

      // Start elapsed timer precisely on the user's first keystroke (Monkeytype behavior)
      let effectiveStartTime = startTime;
      if (!effectiveStartTime) {
        effectiveStartTime = performance.now();
        setStartTime(effectiveStartTime);
      }

      const turnErrors = errors + (isCorrect ? 0 : 1);

      // Sound feedback
      if (isCorrect) {
        soundService.playKeyClick(soundPack);
      } else {
        soundService.playError();
        setErrors((err) => err + 1);
      }

      const newRecord: TypedCharRecord = {
        expected: expectedChar,
        typed: typedChar,
        isCorrect,
        timestamp: performance.now(),
      };

      const updatedHistory = [...history, newRecord];
      setHistory(updatedHistory);

      // Check if user completed the sentence
      if (updatedHistory.length === targetText.length) {
        const correctCount = updatedHistory.filter((c) => c.isCorrect).length;
        const totalCount = updatedHistory.length;
        const durationMs = Math.max(performance.now() - effectiveStartTime, 200);

        onSentenceComplete({
          errors: turnErrors,
          totalChars: totalCount,
          correctChars: correctCount,
          durationMs,
          wpmHistory: [...wpmHistoryRef.current],
        });
      }
    },
    [isActive, targetText, history, startTime, errors, onSentenceComplete, soundPack]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || !targetText) return;

      // Bypasses global key capture when typing inside an actual input/textarea.
      // On mobile (and inside TypingInput's hidden buffer), keystrokes and IME composition
      // are handled by onChange/onKeyDown within TypingInput itself to avoid duplicate inputs.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Ignore modifier keys, navigation arrows, and command shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (['Shift', 'CapsLock', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Only single character printable keys
      if (e.key.length !== 1 || e.key === 'Unidentified') return;
      e.preventDefault();
      handleCharTyped(e.key);
    },
    [isActive, targetText, handleBackspace, handleCharTyped]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentIndex = history.length;
  const progressPercent = targetText.length > 0 
    ? Math.min(100, Math.round((currentIndex / targetText.length) * 100)) 
    : 0;

  return {
    history,
    currentIndex,
    metrics,
    progressPercent,
    isComplete: currentIndex >= targetText.length && targetText.length > 0,
    handleCharTyped,
    handleBackspace,
  };
}
