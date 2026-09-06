/**
 * Conversatype Performance Metrics & Typing Speed Formulas
 *
 * Implements Monkeytype international standards:
 * - 1 word = 5 characters (including spaces and punctuation).
 * - Net WPM = (Correct Characters / 5) / Elapsed Minutes.
 * - Raw WPM = (Total Characters Typed / 5) / Elapsed Minutes.
 * - Accuracy = (Correct Characters / Total Characters Typed) * 100%.
 */

import { TypingMetrics, RankTier } from '../types/typing';

/**
 * Calculates current real-time typing speed and accuracy metrics.
 *
 * @param correctChars Number of correctly typed characters.
 * @param totalChars Total characters typed including errors.
 * @param errors Count of erroneous keystrokes.
 * @param startTimeMs Performance timestamp (ms) when typing commenced.
 * @param currentTimeMs Current performance timestamp (ms, defaults to performance.now()).
 * @returns Object containing Net WPM, Raw WPM, Accuracy (0-100%), and Elapsed Seconds.
 */
export function calculateMetrics(
  correctChars: number,
  totalChars: number,
  errors: number,
  startTimeMs: number,
  currentTimeMs: number = performance.now()
): { wpm: number; rawWpm: number; accuracy: number; elapsedSeconds: number } {
  // Prevent division by zero during the first fraction of a second
  const elapsedMs = Math.max(currentTimeMs - startTimeMs, 200);
  const elapsedMinutes = elapsedMs / 60000;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  // Monkeytype standard: 1 word = 5 characters
  const rawWpm = Math.round((totalChars / 5) / elapsedMinutes);
  const wpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));
  const accuracy = totalChars > 0 
    ? Math.round((correctChars / totalChars) * 100) 
    : 100;

  return {
    wpm,
    rawWpm,
    accuracy: Math.min(100, Math.max(0, accuracy)),
    elapsedSeconds,
  };
}

/**
 * Evaluates performance thresholds to determine the user's conversational rank tier.
 *
 * Tiers:
 * - S: >= 80 WPM with >= 96% accuracy (Godspeed Typist)
 * - A: >= 60 WPM with >= 92% accuracy (Fluent Communicator)
 * - B: >= 40 WPM with >= 88% accuracy (Conversational Native)
 * - C: >= 25 WPM with >= 80% accuracy (Casual Chatter)
 * - D: < 25 WPM or < 80% accuracy (Apprentice Keyboardist)
 *
 * @param wpm Net WPM achieved.
 * @param accuracy Typing accuracy percentage (0-100).
 * @returns Rank tier metadata (tier symbol, title label, and Tailwind color classes).
 */
export function getRankTier(
  wpm: number,
  accuracy: number
): { tier: RankTier; label: string; color: string } {
  if (wpm >= 80 && accuracy >= 96) {
    return { tier: 'S', label: 'Godspeed Typist', color: 'text-amber-400 border-amber-400 bg-amber-400/10' };
  }
  if (wpm >= 60 && accuracy >= 92) {
    return { tier: 'A', label: 'Fluent Communicator', color: 'text-emerald-400 border-emerald-400 bg-emerald-400/10' };
  }
  if (wpm >= 40 && accuracy >= 88) {
    return { tier: 'B', label: 'Conversational Native', color: 'text-blue-400 border-blue-400 bg-blue-400/10' };
  }
  if (wpm >= 25 && accuracy >= 80) {
    return { tier: 'C', label: 'Casual Chatter', color: 'text-purple-400 border-purple-400 bg-purple-400/10' };
  }
  return { tier: 'D', label: 'Apprentice Keyboardist', color: 'text-slate-400 border-slate-400 bg-slate-400/10' };
}

/**
 * Formats a clean, social-shareable markdown scorecard text for the user to copy.
 *
 * @param scenarioTitle Title of the completed conversational scenario.
 * @param metrics Final session performance statistics.
 * @param tier Awarded rank tier badge.
 * @returns Formatted plain text string for the clipboard.
 */
export function generateShareText(scenarioTitle: string, metrics: TypingMetrics, tier: RankTier): string {
  return `⚡ Conversatype — Conversational Typing Test
Scenario: "${scenarioTitle}"
Speed: ${metrics.wpm} WPM (Raw: ${metrics.rawWpm})
Accuracy: ${metrics.accuracy}% | Rank: [${tier}]
Errors: ${metrics.errors} | Time: ${metrics.elapsedSeconds}s

Practice chatting in English environments: https://www.conversatype.com/`;
}
