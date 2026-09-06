import { TypingMetrics, RankTier } from '../types/typing';

export function calculateMetrics(
  correctChars: number,
  totalChars: number,
  errors: number,
  startTimeMs: number,
  currentTimeMs: number = performance.now()
): { wpm: number; rawWpm: number; accuracy: number; elapsedSeconds: number } {
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

export function getRankTier(wpm: number, accuracy: number): { tier: RankTier; label: string; color: string } {
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

export function generateShareText(scenarioTitle: string, metrics: TypingMetrics, tier: RankTier): string {
  return `⚡ Conversatype — Conversational Typing Test
Scenario: "${scenarioTitle}"
Speed: ${metrics.wpm} WPM (Raw: ${metrics.rawWpm})
Accuracy: ${metrics.accuracy}% | Rank: [${tier}]
Errors: ${metrics.errors} | Time: ${metrics.elapsedSeconds}s

Practice chatting in English environments: https://www.conversatype.com/`;
}
