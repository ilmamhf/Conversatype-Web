export type SoundPack = 'thock' | 'cherry' | 'pop' | 'silent';

export type ThemeId = 'duolingo' | 'tokopedia' | 'monkeytype' | 'nord';

export type CaretStyle = 'line' | 'block' | 'underline';

export interface UserSettings {
  soundPack: SoundPack;
  soundVolume: number; // 0 to 1
  theme: ThemeId;
  caretStyle: CaretStyle;
  showSceneCard: boolean; // toggle scene card representation
}
