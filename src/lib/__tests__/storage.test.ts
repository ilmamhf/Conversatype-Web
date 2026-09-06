import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../storage';
import { UserSettings } from '../../types/settings';

describe('storage service', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, value: string) => {
        mockStore[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
      length: 0,
      key: () => null,
    };

    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  it('returns default settings when localStorage is empty', () => {
    const settings = storage.getSettings();
    expect(settings).toEqual({
      soundPack: 'thock',
      soundVolume: 0.6,
      theme: 'duolingo',
      caretStyle: 'line',
      showSceneCard: true,
    });
  });

  it('saves and recovers user settings correctly', () => {
    const updatedSettings: UserSettings = {
      soundPack: 'cherry',
      soundVolume: 0.8,
      theme: 'monkeytype',
      caretStyle: 'block',
      showSceneCard: false,
    };

    storage.saveSettings(updatedSettings);
    const retrieved = storage.getSettings();

    expect(retrieved).toEqual(updatedSettings);
  });

  it('saves high score and updates only when new score is strictly higher', () => {
    storage.saveHighScore({
      scenarioId: 'test-scenario',
      wpm: 55,
      rawWpm: 58,
      accuracy: 95,
      tier: 'B',
      date: '2026-09-06T00:00:00.000Z',
    });

    let scores = storage.getHighScores();
    expect(scores['test-scenario'].wpm).toBe(55);

    // Attempt to save lower score: should NOT overwrite
    storage.saveHighScore({
      scenarioId: 'test-scenario',
      wpm: 40,
      rawWpm: 45,
      accuracy: 90,
      tier: 'B',
      date: '2026-09-06T01:00:00.000Z',
    });

    scores = storage.getHighScores();
    expect(scores['test-scenario'].wpm).toBe(55);

    // Save higher score: SHOULD overwrite
    storage.saveHighScore({
      scenarioId: 'test-scenario',
      wpm: 75,
      rawWpm: 80,
      accuracy: 98,
      tier: 'A',
      date: '2026-09-06T02:00:00.000Z',
    });

    scores = storage.getHighScores();
    expect(scores['test-scenario'].wpm).toBe(75);
    expect(scores['test-scenario'].tier).toBe('A');
  });

  it('handles JSON parsing errors defensively without throwing', () => {
    localStorage.setItem('conversatype_settings_v1', 'INVALID_JSON{[');
    const fallback = storage.getSettings();
    expect(fallback.soundPack).toBe('thock');
  });
});
