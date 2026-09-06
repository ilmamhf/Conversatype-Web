/**
 * Conversatype Local Persistence Service
 *
 * Provides safe client-side caching of:
 * - User Preferences (audio soundpack, volume, visual theme, caret style, scene card toggle).
 * - Scenario High Scores (personal best WPM, accuracy, rank tier, completion date).
 *
 * Wrapped in defensive try/catch blocks to gracefully tolerate private browsing modes,
 * disabled localStorage, or quota limits.
 */

import { UserSettings } from '../types/settings';

const SETTINGS_KEY = 'conversatype_settings_v1';
const SCORES_KEY = 'conversatype_highscores_v1';

/**
 * Historical personal-best record achieved by the user for a specific scenario.
 */
export interface HighScoreRecord {
  scenarioId: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  tier: string;
  date: string;
}

/**
 * Default fallback settings when no user preferences have been saved yet.
 */
const DEFAULT_SETTINGS: UserSettings = {
  soundPack: 'thock',
  soundVolume: 0.6,
  theme: 'duolingo',
  caretStyle: 'line',
  showSceneCard: true,
};

export const storage = {
  /**
   * Retrieves user settings from localStorage or returns default fallback.
   */
  getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Saves updated user settings to localStorage.
   */
  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Unable to persist settings to localStorage', e);
    }
  },

  /**
   * Retrieves all recorded scenario high scores.
   *
   * @returns A map of scenarioId -> HighScoreRecord.
   */
  getHighScores(): Record<string, HighScoreRecord> {
    try {
      const stored = localStorage.getItem(SCORES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  /**
   * Persists a newly completed scenario record if it beats the existing personal best WPM.
   */
  saveHighScore(record: HighScoreRecord): void {
    try {
      const current = this.getHighScores();
      const existing = current[record.scenarioId];
      if (!existing || record.wpm > existing.wpm) {
        current[record.scenarioId] = record;
        localStorage.setItem(SCORES_KEY, JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Unable to persist high scores to localStorage', e);
    }
  },
};
