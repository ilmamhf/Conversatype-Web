export type ScenarioCategory = 'app' | 'real-life';

export type ContextGroup = 'casual' | 'corporate' | 'social' | 'travel' | 'services';

export type DialogueSpeaker = 'npc' | 'user';

export interface DialogueTurn {
  id: string;
  speaker: DialogueSpeaker;
  /** Text spoken by NPC or target text required from user */
  text: string;
  /** Optional delay before NPC finishes typing in ms (default: 650ms) */
  delayMs?: number;
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  contextGroup: ContextGroup;
  description: string;
  tag: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetAudienceTag: string; // e.g., "Workplace English", "Everyday Chat", "Travel Abroad"
  turns: DialogueTurn[];
  
  // Real-Life Scenario visuals
  sceneImage?: string;
  sceneLocation?: string;
  npcName: string;
  npcRole: string;
  npcAvatar?: string;
}

export interface ChatMessage {
  id: string;
  speaker: DialogueSpeaker;
  text: string;
  timestamp: string;
}
