import { Scenario, ScenarioCategory } from '../types/scenario';
import { appScenarios } from './appScenarios';
import { realLifeScenarios } from './realLifeScenarios';

export { appScenarios } from './appScenarios';
export { realLifeScenarios } from './realLifeScenarios';
export const allScenarios: Scenario[] = [...appScenarios, ...realLifeScenarios];

export function getScenarioById(id: string): Scenario | undefined {
  return allScenarios.find((s) => s.id === id);
}

export function getScenariosByCategory(category: ScenarioCategory): Scenario[] {
  return allScenarios.filter((s) => s.category === category);
}

export function getRandomScenario(category?: ScenarioCategory): Scenario {
  const pool = category ? getScenariosByCategory(category) : allScenarios;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
