import React from 'react';
import { UserSettings, SoundPack, CaretStyle, ThemeId } from '../../types/settings';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Volume2, Palette, Keyboard, Sparkles, Check } from 'lucide-react';
import { soundService } from '../../lib/audio';
import { clsx } from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const handleSoundChange = (pack: SoundPack) => {
    soundService.setSoundPack(pack);
    soundService.playKeyClick();
    onUpdateSettings({ ...settings, soundPack: pack });
  };

  const handleCaretChange = (caret: CaretStyle) => {
    onUpdateSettings({ ...settings, caretStyle: caret });
  };

  const handleThemeChange = (theme: ThemeId) => {
    onUpdateSettings({ ...settings, theme });
  };

  const soundOptions: { id: SoundPack; label: string; desc: string }[] = [
    { id: 'thock', label: 'Tactile Thock', desc: 'Creamy mechanical switch' },
    { id: 'cherry', label: 'Cherry MX Blue', desc: 'Crisp clicky mechanical switch' },
    { id: 'pop', label: 'Bubble Pop', desc: 'Playful Duolingo pop' },
    { id: 'silent', label: 'Silent Mode', desc: 'Muted audio' },
  ];

  const caretOptions: { id: CaretStyle; label: string }[] = [
    { id: 'line', label: 'Line Caret' },
    { id: 'block', label: 'Block Caret' },
    { id: 'underline', label: 'Underline' },
  ];

  const themeOptions: { id: ThemeId; label: string; desc: string; color: string }[] = [
    {
      id: 'duolingo',
      label: 'Fresh Lime',
      desc: 'Clean light gray with vibrant lime green',
      color: 'bg-[#58cc02]',
    },
    {
      id: 'tokopedia',
      label: 'Clean Mint',
      desc: 'Modern crisp white with emerald accents',
      color: 'bg-[#03ac0e]',
    },
    {
      id: 'monkeytype',
      label: 'Midnight Charcoal',
      desc: 'Dark charcoal with golden yellow accents',
      color: 'bg-[#e2b714]',
    },
    {
      id: 'nord',
      label: 'Arctic Frost',
      desc: 'Nordic slate with frost cyan accents',
      color: 'bg-[#88c0d0]',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="App Settings" maxWidth="md">
      <div className="space-y-5">
        {/* Visual Theme Selection */}
        <div>
          <label
            style={{ color: 'var(--text-primary)' }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2.5"
          >
            <Palette className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            Visual Theme
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {themeOptions.map((opt) => {
              const isSelected = settings.theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleThemeChange(opt.id)}
                  style={{
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderColor: isSelected ? 'var(--color-brand)' : 'var(--border-app)',
                  }}
                  className={clsx(
                    'p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between',
                    isSelected && 'ring-2 ring-brand-500/40'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={clsx('w-4 h-4 rounded-full shadow-sm', opt.color)} />
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                    )}
                  </div>
                  <div>
                    <div
                      style={{ color: 'var(--text-primary)' }}
                      className="text-xs font-black"
                    >
                      {opt.label}
                    </div>
                    <div
                      style={{ color: 'var(--text-secondary)' }}
                      className="text-[10px] mt-0.5"
                    >
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Selection */}
        <div>
          <label
            style={{ color: 'var(--text-primary)' }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2.5"
          >
            <Volume2 className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            Typing Sound Feedback
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {soundOptions.map((opt) => {
              const isSelected = settings.soundPack === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSoundChange(opt.id)}
                  style={{
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderColor: isSelected ? 'var(--color-brand)' : 'var(--border-app)',
                  }}
                  className={clsx(
                    'p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer',
                    isSelected && 'ring-2 ring-brand-500/40 shadow-xs'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      style={{ color: isSelected ? 'var(--color-brand)' : 'var(--text-primary)' }}
                      className="text-xs font-black transition-colors"
                    >
                      {opt.label}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand)' }} />
                    )}
                  </div>
                  <div
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-[10px] leading-tight"
                  >
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Caret Style */}
        <div>
          <label
            style={{ color: 'var(--text-primary)' }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2.5"
          >
            <Keyboard className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            Typing Caret Cursor
          </label>
          <div className="grid grid-cols-3 gap-2">
            {caretOptions.map((opt) => {
              const isSelected = settings.caretStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleCaretChange(opt.id)}
                  style={{
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderColor: isSelected ? 'var(--color-brand)' : 'var(--border-app)',
                    color: isSelected ? 'var(--color-brand)' : 'var(--text-secondary)',
                  }}
                  className={clsx(
                    'py-2 px-2 rounded-2xl border-2 text-center text-xs font-bold transition-all',
                    isSelected && 'ring-2 ring-brand-500/40'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scene Card Frame Toggle */}
        <div
          style={{ borderColor: 'var(--border-app)' }}
          className="pt-3 border-t-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            <div>
              <div
                style={{ color: 'var(--text-primary)' }}
                className="text-xs font-bold"
              >
                Real-Life Scene Visual Card
              </div>
              <div
                style={{ color: 'var(--text-secondary)' }}
                className="text-[11px]"
              >
                Display environmental photo for real-life mode
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({ ...settings, showSceneCard: !settings.showSceneCard })
            }
            style={{
              backgroundColor: settings.showSceneCard
                ? 'var(--color-brand)'
                : 'var(--border-strong)',
            }}
            className="w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0"
          >
            <div
              className={clsx(
                'w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                settings.showSceneCard ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Save & Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
