import { describe, it, expect } from 'vitest';
import { allScenarios, appScenarios, realLifeScenarios, getScenarioById, getScenariosByCategory } from '../index';

describe('Scenario Data Integrity', () => {
  it('contains exactly 10 scenarios (5 app chat and 5 real-life)', () => {
    expect(allScenarios.length).toBe(10);
    expect(appScenarios.length).toBe(5);
    expect(realLifeScenarios.length).toBe(5);
  });

  it('guarantees unique IDs for all scenarios', () => {
    const ids = allScenarios.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('validates that every scenario has required metadata', () => {
    allScenarios.forEach((scenario) => {
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.npcName).toBeTruthy();
      expect(scenario.npcRole).toBeTruthy();
      expect(['Easy', 'Medium', 'Hard']).toContain(scenario.difficulty);
      expect(['app', 'real-life']).toContain(scenario.category);
      expect(scenario.turns.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('verifies real-life scenarios include sceneImage and location', () => {
    realLifeScenarios.forEach((scenario) => {
      expect(scenario.sceneImage).toBeTruthy();
      expect(scenario.sceneLocation).toBeTruthy();
    });
  });

  it('verifies turns alternate dialogue speakers properly', () => {
    allScenarios.forEach((scenario) => {
      // First turn should be NPC initiating dialogue
      expect(scenario.turns[0].speaker).toBe('npc');

      for (let i = 0; i < scenario.turns.length; i++) {
        const turn = scenario.turns[i];
        expect(turn.text.trim().length).toBeGreaterThan(0);
        expect(['npc', 'user']).toContain(turn.speaker);

        if (i > 0) {
          const prevTurn = scenario.turns[i - 1];
          // Consecutive turns should alternate
          expect(turn.speaker).not.toBe(prevTurn.speaker);
        }
      }
    });
  });

  it('getScenarioById finds existing scenario or returns undefined', () => {
    const delivery = getScenarioById('app-delivery');
    expect(delivery).toBeDefined();
    expect(delivery?.title).toBe('Late-Night Delivery Debate');

    const nonExistent = getScenarioById('unknown-id');
    expect(nonExistent).toBeUndefined();
  });

  it('getScenariosByCategory correctly filters pools', () => {
    const apps = getScenariosByCategory('app');
    expect(apps.every((s) => s.category === 'app')).toBe(true);

    const realLife = getScenariosByCategory('real-life');
    expect(realLife.every((s) => s.category === 'real-life')).toBe(true);
  });
});
