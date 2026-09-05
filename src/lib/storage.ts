import { UserSettings } from '../types/settings';

const SETTINGS_KEY = 'conversatype_settings_v1';
const SCORES_KEY = 'conversatype_highscores_v1';

export interface HighScoreRecord {
  scenarioId: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  tier: string;
  date: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  soundPack: 'thock',
  soundVolume: 0.6,
  theme: 'duolingo',
  caretStyle: 'line',
  showSceneCard: true,
};

export const storage = {
  getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Unable to persist settings to localStorage', e);
    }
  },

  getHighScores(): Record<string, HighScoreRecord> {
    try {
      const stored = localStorage.getItem(SCORES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  saveHighScore(record: HighScoreRecord) {
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
  }
};
