import { describe, it, expect } from 'vitest';
import { calculateMetrics, getRankTier, generateShareText } from '../metrics';
import { TypingMetrics } from '../../types/typing';

describe('calculateMetrics', () => {
  it('calculates WPM, Raw WPM, and Accuracy correctly for typical typing', () => {
    // 250 characters typed, 240 correct, 10 errors over 60 seconds (1 minute)
    // 240 / 5 = 48 Net WPM
    // 250 / 5 = 50 Raw WPM
    // 240 / 250 = 96% accuracy
    const startTime = 0;
    const currentTime = 60000;
    const result = calculateMetrics(240, 250, 10, startTime, currentTime);

    expect(result.wpm).toBe(48);
    expect(result.rawWpm).toBe(50);
    expect(result.accuracy).toBe(96);
    expect(result.elapsedSeconds).toBe(60);
  });

  it('handles 0 characters gracefully without dividing by zero', () => {
    const result = calculateMetrics(0, 0, 0, 0, 1000);
    expect(result.wpm).toBe(0);
    expect(result.rawWpm).toBe(0);
    expect(result.accuracy).toBe(100);
    expect(result.elapsedSeconds).toBe(1);
  });

  it('clamps accuracy between 0 and 100', () => {
    const perfect = calculateMetrics(100, 100, 0, 0, 10000);
    expect(perfect.accuracy).toBe(100);

    const zero = calculateMetrics(0, 50, 50, 0, 10000);
    expect(zero.accuracy).toBe(0);
  });

  it('guarantees non-negative WPM even if errors exceed typed characters', () => {
    const negativeAttempt = calculateMetrics(-10, 50, 60, 0, 10000);
    expect(negativeAttempt.wpm).toBe(0);
  });
});

describe('getRankTier', () => {
  it('awards S Rank for high speed (>=80 WPM) and precision (>=96%)', () => {
    const rank = getRankTier(85, 98);
    expect(rank.tier).toBe('S');
    expect(rank.label).toBe('Godspeed Typist');
  });

  it('awards A Rank for 60-79 WPM and >=92% accuracy', () => {
    const rank = getRankTier(65, 93);
    expect(rank.tier).toBe('A');
    expect(rank.label).toBe('Fluent Communicator');
  });

  it('awards B Rank for 40-59 WPM and >=88% accuracy', () => {
    const rank = getRankTier(45, 90);
    expect(rank.tier).toBe('B');
    expect(rank.label).toBe('Conversational Native');
  });

  it('awards C Rank for 25-39 WPM and >=80% accuracy', () => {
    const rank = getRankTier(30, 85);
    expect(rank.tier).toBe('C');
    expect(rank.label).toBe('Casual Chatter');
  });

  it('awards D Rank for beginner typing (<25 WPM or low accuracy)', () => {
    const slowRank = getRankTier(15, 90);
    expect(slowRank.tier).toBe('D');

    const lowAccRank = getRankTier(70, 75);
    expect(lowAccRank.tier).toBe('D');
  });
});

describe('generateShareText', () => {
  it('formats markdown share text with correct scenario and metrics', () => {
    const mockMetrics: TypingMetrics = {
      wpm: 68,
      rawWpm: 72,
      accuracy: 97,
      errors: 2,
      totalCharsTyped: 360,
      correctCharsTyped: 350,
      elapsedSeconds: 45,
      wpmHistory: [],
    };

    const text = generateShareText('Late-Night Delivery Debate', mockMetrics, 'A');
    expect(text).toContain('Late-Night Delivery Debate');
    expect(text).toContain('Speed: 68 WPM');
    expect(text).toContain('Accuracy: 97%');
    expect(text).toContain('Rank: [A]');
    expect(text).toContain('https://www.conversatype.com/');
  });
});
