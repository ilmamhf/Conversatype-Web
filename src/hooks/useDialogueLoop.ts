import { useState, useEffect, useCallback, useRef } from 'react';
import { Scenario, ChatMessage, DialogueTurn } from '../types/scenario';
import { TypingMetrics } from '../types/typing';
import { soundService } from '../lib/audio';
import { storage } from '../lib/storage';
import { calculateMetrics, getRankTier } from '../lib/metrics';
import { SentenceCompletionStats } from './useTypingEngine';
import confetti from 'canvas-confetti';

/**
 * useDialogueLoop
 * 
 * Conversational Turn Sequencer and Orchestrator.
 * 
 * Manages the state machine of an interactive dialogue:
 * 1. Simulates realistic NPC typing latency with customizable delays (e.g., 650ms).
 * 2. Emits conversational audio events (incoming chime, outgoing send, completion fanfare).
 * 3. Accumulates typing statistics (correct characters, errors, elapsed time) across all user turns.
 * 4. Triggers celebration confetti, computes final metrics & rank tier, and records personal bests to LocalStorage.
 * 
 * @param scenario - The currently active dialogue scenario definition.
 */
export function useDialogueLoop(scenario: Scenario) {
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isNpcTyping, setIsNpcTyping] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  // Cumulative session tracking across all user turns in the scenario
  const sessionStartTimeRef = useRef<number | null>(null);
  const cumulativeCorrectCharsRef = useRef<number>(0);
  const cumulativeTotalCharsRef = useRef<number>(0);
  const cumulativeErrorsRef = useRef<number>(0);
  const wpmHistoryRef = useRef<{ second: number; wpm: number; rawWpm: number; errors: number }[]>([]);

  const [aggregateMetrics, setAggregateMetrics] = useState<TypingMetrics>({
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    errors: 0,
    totalCharsTyped: 0,
    correctCharsTyped: 0,
    elapsedSeconds: 0,
    wpmHistory: [],
  });

  const currentTurn: DialogueTurn | undefined = scenario.turns[currentTurnIndex];
  const isUserTurn = currentTurn?.speaker === 'user' && !isNpcTyping && !isFinished;

  // Restart scenario
  const resetScenario = useCallback(() => {
    setCurrentTurnIndex(0);
    setMessages([]);
    setIsNpcTyping(false);
    setIsFinished(false);
    sessionStartTimeRef.current = null;
    cumulativeCorrectCharsRef.current = 0;
    cumulativeTotalCharsRef.current = 0;
    cumulativeErrorsRef.current = 0;
    wpmHistoryRef.current = [];
    setAggregateMetrics({
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errors: 0,
      totalCharsTyped: 0,
      correctCharsTyped: 0,
      elapsedSeconds: 0,
      wpmHistory: [],
    });
  }, []);

  // When scenario changes, reset
  useEffect(() => {
    resetScenario();
  }, [scenario.id, resetScenario]);

  // Handle NPC turns
  useEffect(() => {
    if (isFinished || !currentTurn) return;

    if (currentTurn.speaker === 'npc') {
      setIsNpcTyping(true);
      const delay = currentTurn.delayMs || 650;

      const timer = window.setTimeout(() => {
        setIsNpcTyping(false);
        soundService.playMessageReceived();

        const newMsg: ChatMessage = {
          id: currentTurn.id,
          speaker: 'npc',
          text: currentTurn.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newMsg]);

        // Advance to next turn
        if (currentTurnIndex < scenario.turns.length - 1) {
          setCurrentTurnIndex((i) => i + 1);
        } else {
          finishScenario();
        }
      }, delay);

      return () => window.clearTimeout(timer);
    }
  }, [currentTurnIndex, scenario.turns, isFinished]);

  // Called when user completes typing their sentence
  const handleUserSentenceComplete = useCallback(
    (stats: SentenceCompletionStats) => {
      if (!currentTurn || currentTurn.speaker !== 'user') return;

      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = performance.now();
      }

      soundService.playMessageSent();

      const newMsg: ChatMessage = {
        id: currentTurn.id,
        speaker: 'user',
        text: currentTurn.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newMsg]);

      // Accumulate stats
      cumulativeCorrectCharsRef.current += stats.correctChars;
      cumulativeTotalCharsRef.current += stats.totalChars;
      cumulativeErrorsRef.current += stats.errors;
      if (stats.wpmHistory.length > 0) {
        wpmHistoryRef.current.push(...stats.wpmHistory);
      }

      // Check if there are more turns
      if (currentTurnIndex < scenario.turns.length - 1) {
        setCurrentTurnIndex((i) => i + 1);
      } else {
        finishScenario();
      }
    },
    [currentTurn, currentTurnIndex, scenario.turns.length]
  );

  const finishScenario = useCallback(() => {
    setIsFinished(true);
    soundService.playSuccessFanfare();

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if canvas-confetti fails
    }

    const startTime = sessionStartTimeRef.current || (performance.now() - 5000);
    const now = performance.now();
    const finalCalculated = calculateMetrics(
      cumulativeCorrectCharsRef.current,
      cumulativeTotalCharsRef.current,
      cumulativeErrorsRef.current,
      startTime,
      now
    );

    const fullMetrics: TypingMetrics = {
      ...finalCalculated,
      errors: cumulativeErrorsRef.current,
      totalCharsTyped: cumulativeTotalCharsRef.current,
      correctCharsTyped: cumulativeCorrectCharsRef.current,
      wpmHistory: wpmHistoryRef.current,
    };

    setAggregateMetrics(fullMetrics);

    // Save high score to storage
    const rank = getRankTier(finalCalculated.wpm, finalCalculated.accuracy);
    storage.saveHighScore({
      scenarioId: scenario.id,
      wpm: finalCalculated.wpm,
      rawWpm: finalCalculated.rawWpm,
      accuracy: finalCalculated.accuracy,
      tier: rank.tier,
      date: new Date().toISOString(),
    });
  }, [scenario.id]);

  return {
    currentTurnIndex,
    totalTurns: scenario.turns.length,
    currentTurn,
    messages,
    isNpcTyping,
    isUserTurn,
    isFinished,
    aggregateMetrics,
    handleUserSentenceComplete,
    resetScenario,
  };
}
