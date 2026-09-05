import React from 'react';
import { Scenario, ScenarioCategory } from '../../types/scenario';
import { UserSettings } from '../../types/settings';
import { Button } from '../ui/Button';
import {
  MessageSquare,
  Compass,
  Volume2,
  VolumeX,
  Settings,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  currentScenario: Scenario;
  settings: UserSettings;
  onSelectCategory: (cat: ScenarioCategory) => void;
  onOpenScenarios: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  settings,
  onSelectCategory,
  onOpenScenarios,
  onOpenSettings,
  onToggleMute,
}) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-app)',
      }}
      className="w-full border-b-2 sticky top-0 z-40 px-4 py-2.5 shrink-0 transition-colors duration-200"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={onOpenScenarios}
        >
          <div
            style={{
              backgroundColor: 'var(--color-brand)',
              color: 'var(--color-brand-text)',
              boxShadow: '0 3px 0 0 var(--color-brand-shadow)',
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-base"
          >
            C
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                style={{ color: 'var(--text-primary)' }}
                className="font-black text-base sm:text-lg tracking-tight"
              >
                Conversatype
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(88, 204, 2, 0.15)',
                  color: 'var(--color-brand)',
                }}
                className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md"
              >
                BETA
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            borderColor: 'var(--border-app)',
          }}
          className="hidden sm:flex items-center p-1 border-2 rounded-2xl"
        >
          <button
            onClick={() => onSelectCategory('app')}
            style={
              currentScenario.category === 'app'
                ? {
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-text)',
                    boxShadow: '0 2px 0 0 var(--color-brand-shadow)',
                  }
                : { color: 'var(--text-secondary)' }
            }
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            App Chat
          </button>
          <button
            onClick={() => onSelectCategory('real-life')}
            style={
              currentScenario.category === 'real-life'
                ? {
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-brand-text)',
                    boxShadow: '0 2px 0 0 var(--color-brand-shadow)',
                  }
                : { color: 'var(--text-secondary)' }
            }
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            Real-Life
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScenarios}
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
              color: 'var(--text-primary)',
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold hover:brightness-95 transition-all"
          >
            <Layers className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
            <span className="max-w-[120px] truncate hidden md:inline">
              {currentScenario.title}
            </span>
            <span className="md:hidden">Scenarios</span>
          </button>

          <button
            onClick={onToggleMute}
            title={settings.soundPack === 'silent' ? 'Unmute Sound' : 'Mute Sound'}
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
            }}
            className="p-2 rounded-xl border-2 hover:brightness-95 transition-all"
          >
            {settings.soundPack === 'silent' ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            title="Gameplay Settings"
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
              color: 'var(--text-primary)',
            }}
            className="p-2 rounded-xl border-2 hover:brightness-95 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
