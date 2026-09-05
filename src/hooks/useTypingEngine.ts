import { useState, useEffect, useCallback, useRef } from 'react';
import { TypedCharRecord, TypingMetrics, WpmSample } from '../types/typing';
import { calculateMetrics } from '../lib/metrics';
import { soundService } from '../lib/audio';

export interface SentenceCompletionStats {
  errors: number;
  totalChars: number;
  correctChars: number;
  durationMs: number;
  wpmHistory: WpmSample[];
}

interface UseTypingEngineProps {
  targetText: string;
  isActive: boolean;
  onSentenceComplete: (stats: SentenceCompletionStats) => void;
}

export function useTypingEngine({ targetText, isActive, onSentenceComplete }: UseTypingEngineProps) {
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || !targetText) return;

      // Ignore meta keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (['Shift', 'CapsLock', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        setHistory((prev) => {
          if (prev.length === 0) return prev;
          soundService.playKeyClick();
          return prev.slice(0, -1);
        });
        return;
      }

      // Only single character printable keys
      if (e.key.length !== 1) return;
      e.preventDefault();

      const currentIndex = history.length;
      if (currentIndex >= targetText.length) return;

      const expectedChar = targetText[currentIndex];
      const typedChar = e.key;
      const isCorrect =
        typedChar === expectedChar ||
        ((typedChar === "'" || typedChar === '’' || typedChar === '`') &&
          (expectedChar === "'" || expectedChar === '’' || expectedChar === '`')) ||
        ((typedChar === '"' || typedChar === '“' || typedChar === '”') &&
          (expectedChar === '"' || expectedChar === '“' || expectedChar === '”'));

      // Start timer on first keystroke
      let effectiveStartTime = startTime;
      if (!effectiveStartTime) {
        effectiveStartTime = performance.now();
        setStartTime(effectiveStartTime);
      }

      const turnErrors = errors + (isCorrect ? 0 : 1);

      // Sound feedback
      if (isCorrect) {
        soundService.playKeyClick();
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
    [isActive, targetText, history, startTime, errors, onSentenceComplete]
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
  };
}
