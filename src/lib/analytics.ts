import posthog from 'posthog-js';
import { TypingMetrics } from '../types/typing';

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isPostHogInitialized = false;

export function initAnalytics() {
  if (typeof window !== 'undefined' && POSTHOG_KEY && !isPostHogInitialized) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        autocapture: true,
        capture_pageview: true,
      });
      isPostHogInitialized = true;
    } catch (e) {
      console.warn('PostHog initialization skipped:', e);
    }
  }
}

export const analytics = {
  trackScenarioStarted(scenarioId: string, title: string, category: string, contextGroup: string) {
    if (!isPostHogInitialized) return;
    posthog.capture('scenario_started', {
      scenario_id: scenarioId,
      scenario_title: title,
      category,
      context_group: contextGroup,
    });
  },

  trackTurnCompleted(scenarioId: string, turnIndex: number, currentWpm: number) {
    if (!isPostHogInitialized) return;
    posthog.capture('turn_completed', {
      scenario_id: scenarioId,
      turn_index: turnIndex,
      current_wpm: currentWpm,
    });
  },

  trackScenarioCompleted(scenarioId: string, title: string, metrics: TypingMetrics, tier: string) {
    if (!isPostHogInitialized) return;
    posthog.capture('scenario_completed', {
      scenario_id: scenarioId,
      scenario_title: title,
      wpm: metrics.wpm,
      raw_wpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      errors: metrics.errors,
      duration_seconds: metrics.elapsedSeconds,
      rank_tier: tier,
    });
  },

  trackScorecardShared(scenarioId: string, wpm: number, accuracy: number) {
    if (!isPostHogInitialized) return;
    posthog.capture('scorecard_shared', {
      scenario_id: scenarioId,
      wpm,
      accuracy,
    });
  },

  trackThemeChanged(theme: string) {
    if (!isPostHogInitialized) return;
    posthog.capture('theme_changed', {
      theme_id: theme,
    });
  },
};
