import React, { useState, useEffect, useRef } from 'react';
import { Scenario, ScenarioCategory } from './types/scenario';
import { UserSettings, SoundPack } from './types/settings';
import { appScenarios } from './data/appScenarios';
import { realLifeScenarios } from './data/realLifeScenarios';
import { storage } from './lib/storage';
import { soundService } from './lib/audio';
import { analytics } from './lib/analytics';
import { getRankTier } from './lib/metrics';
import { useDialogueLoop } from './hooks/useDialogueLoop';
import { useTypingEngine } from './hooks/useTypingEngine';

// Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ChatFeed } from './components/chat/ChatFeed';
import { TypingInput } from './components/chat/TypingInput';
import { SceneFrame } from './components/scenario/SceneFrame';
import { ScenarioSelector } from './components/scenario/ScenarioSelector';
import { SettingsModal } from './components/settings/SettingsModal';
import { ScorecardModal } from './components/scorecard/ScorecardModal';
import { RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

export function App() {
  /* =================== 1. State & Persistent Settings =================== */
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [currentScenario, setCurrentScenario] = useState<Scenario>(() => appScenarios[0]);

  // Modal visibility states
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);

  /* =================== 2. Subsystems: Dialogue & Typing Engine =================== */
  // Dialogue loop state machine (orchestrates turns, NPC delays, sounds, cumulative stats)
  const dialogue = useDialogueLoop(currentScenario);

  // Monkeytype typing engine for the user's active turn
  const targetSentence =
    dialogue.isUserTurn && dialogue.currentTurn?.speaker === 'user'
      ? dialogue.currentTurn.text
      : '';

  const typing = useTypingEngine({
    targetText: targetSentence,
    isActive: dialogue.isUserTurn,
    soundPack: settings.soundPack,
    onSentenceComplete: dialogue.handleUserSentenceComplete,
  });

  /* =================== 3. System Synchronizations & Analytics =================== */
  // Sync active theme with HTML document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Sync sound settings with audio synthesizer
  useEffect(() => {
    soundService.setSoundPack(settings.soundPack);
    soundService.setVolume(settings.soundVolume);
  }, [settings.soundPack, settings.soundVolume]);

  // Track scenario start in analytics
  useEffect(() => {
    analytics.trackScenarioStarted(
      currentScenario.id,
      currentScenario.title,
      currentScenario.category,
      currentScenario.contextGroup
    );
  }, [currentScenario.id, currentScenario.title, currentScenario.category, currentScenario.contextGroup]);

  const hasShownScorecardRef = useRef(false);

  // When dialogue finishes, show scorecard and track completion strictly once
  useEffect(() => {
    if (dialogue.isFinished && !hasShownScorecardRef.current) {
      hasShownScorecardRef.current = true;
      setIsScorecardOpen(true);
      const rank = getRankTier(
        dialogue.aggregateMetrics.wpm,
        dialogue.aggregateMetrics.accuracy
      );
      analytics.trackScenarioCompleted(
        currentScenario.id,
        currentScenario.title,
        dialogue.aggregateMetrics,
        rank.tier
      );
    } else if (!dialogue.isFinished) {
      hasShownScorecardRef.current = false;
    }
  }, [dialogue.isFinished, dialogue.aggregateMetrics, currentScenario.id, currentScenario.title]);

  /* =================== 4. Navigation & Lifecycle Handlers =================== */
  // Switch category (app chat vs real-life)
  const handleSelectCategory = (cat: ScenarioCategory) => {
    if (cat === currentScenario.category) return;
    hasShownScorecardRef.current = false;
    setIsScorecardOpen(false);
    dialogue.resetScenario();
    const pool = cat === 'app' ? appScenarios : realLifeScenarios;
    setCurrentScenario(pool[0]);
  };

  // Advance to next scenario in current pool
  const handleNextScenario = () => {
    hasShownScorecardRef.current = false;
    setIsScorecardOpen(false);
    dialogue.resetScenario();
    const pool = currentScenario.category === 'app' ? appScenarios : realLifeScenarios;
    const currentIndex = pool.findIndex((s) => s.id === currentScenario.id);
    const nextScenario = pool[(currentIndex + 1) % pool.length];
    setCurrentScenario(nextScenario);
  };

  // Restart current scenario
  const handleRestartScenario = () => {
    hasShownScorecardRef.current = false;
    setIsScorecardOpen(false);
    dialogue.resetScenario();
  };

  // Close scorecard modal
  const handleCloseScorecard = () => {
    hasShownScorecardRef.current = false;
    setIsScorecardOpen(false);
    dialogue.resetScenario();
  };

  /* =================== 5. Global Keyboard Shortcuts =================== */
  // Quick navigation: Tab+Enter to restart, Escape to open scenario browser
  useEffect(() => {
    let tabPressed = false;
    let tabTimeout: number | null = null;

    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsScenarioModalOpen(true);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        tabPressed = true;
        if (tabTimeout) window.clearTimeout(tabTimeout);
        tabTimeout = window.setTimeout(() => {
          tabPressed = false;
        }, 1500);
        return;
      }

      if (e.key === 'Enter' && tabPressed) {
        e.preventDefault();
        tabPressed = false;
        dialogue.resetScenario();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeys);
      if (tabTimeout) window.clearTimeout(tabTimeout);
    };
  }, [dialogue.resetScenario]);

  /* =================== 6. Audio Preferences =================== */
  const lastActiveSoundPackRef = useRef<SoundPack>(
    settings.soundPack !== 'silent' ? settings.soundPack : 'thock'
  );

  // Keep last active sound pack updated when user changes pack
  useEffect(() => {
    if (settings.soundPack !== 'silent') {
      lastActiveSoundPackRef.current = settings.soundPack;
    }
  }, [settings.soundPack]);

  // Toggle mute (preserves user's chosen sound pack when unmuting)
  const handleToggleMute = () => {
    let nextPack: SoundPack;
    if (settings.soundPack === 'silent') {
      nextPack = lastActiveSoundPackRef.current || 'thock';
    } else {
      lastActiveSoundPackRef.current = settings.soundPack;
      nextPack = 'silent';
    }
    const updated = { ...settings, soundPack: nextPack };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const isRealLifeMode = currentScenario.category === 'real-life' && settings.showSceneCard;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
      className="h-dvh w-screen max-h-dvh overflow-hidden flex flex-col font-sans transition-colors duration-200"
    >
      {/* Navigation Header */}
      <Header
        currentScenario={currentScenario}
        settings={settings}
        onSelectCategory={handleSelectCategory}
        onOpenScenarios={() => setIsScenarioModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleMute={handleToggleMute}
      />

      {/* Main Game Arena (Zero-Scroll Viewport Layout) */}
      <main className="flex-1 min-h-0 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
        <div
          className={clsx(
            'w-full h-full flex flex-col',
            isRealLifeMode
              ? 'md:flex-row md:items-stretch md:gap-4 max-w-5xl'
              : 'max-w-2xl'
          )}
        >
          {/* Desktop Left-Side Scene Frame (Only in Real-Life Mode) */}
          {isRealLifeMode && (
            <SceneFrame scenario={currentScenario} layoutMode="sidebar" />
          )}

          {/* Mobile Top Scene Banner (Only in Real-Life Mode on small screens) */}
          {isRealLifeMode && (
            <div className="mb-2 md:hidden shrink-0">
              <SceneFrame scenario={currentScenario} layoutMode="banner" />
            </div>
          )}

          {/* Uniform Chat Simulation Device Container */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-app)',
            }}
            className="flex-1 min-h-0 h-full flex flex-col rounded-3xl border-2 shadow-sm overflow-hidden"
          >
            {/* Top Chat Bar */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                borderColor: 'var(--border-app)',
              }}
              className="px-4 py-2.5 border-b-2 flex items-center justify-between shrink-0 select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-app)',
                  }}
                  className="w-8 h-8 rounded-xl border-2 flex items-center justify-center text-base shrink-0 shadow-xs"
                >
                  {currentScenario.npcAvatar || '💬'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <h2
                      style={{ color: 'var(--text-primary)' }}
                      className="font-extrabold text-xs sm:text-sm truncate"
                    >
                      {currentScenario.npcName}
                    </h2>
                    <span
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--border-app)',
                      }}
                      className="text-[10px] font-bold border px-1.5 py-0.2 rounded-md truncate hidden sm:inline"
                    >
                      {currentScenario.npcRole}
                    </span>
                  </div>
                  <p
                    style={{ color: 'var(--color-brand)' }}
                    className="text-[10px] font-bold"
                  >
                    {dialogue.isNpcTyping ? 'Typing reply...' : 'Online'}
                  </p>
                </div>
              </div>

              {/* Turn Counter and Restart Button */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-app)',
                    color: 'var(--text-secondary)',
                  }}
                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border"
                >
                  Turn {Math.min(dialogue.currentTurnIndex + 1, dialogue.totalTurns)} /{' '}
                  {dialogue.totalTurns}
                </div>
                <button
                  onClick={dialogue.resetScenario}
                  title="Restart this scenario"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-app)',
                    color: 'var(--text-secondary)',
                  }}
                  className="p-1 rounded-lg border hover:brightness-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Previous Messages Feed (Scrollable internally) */}
            <ChatFeed
              messages={dialogue.messages}
              scenario={currentScenario}
              isNpcTyping={dialogue.isNpcTyping}
            />

            {/* Monkeytype-Grade Typing Input Box (Fixed at bottom) */}
            <TypingInput
              targetText={targetSentence}
              history={typing.history}
              currentIndex={typing.currentIndex}
              isUserTurn={dialogue.isUserTurn}
              isNpcTyping={dialogue.isNpcTyping}
              metrics={typing.metrics}
              progressPercent={typing.progressPercent}
              caretStyle={settings.caretStyle}
              onCharInput={typing.handleCharTyped}
              onBackspace={typing.handleBackspace}
            />
          </div>
        </div>
      </main>

      {/* Global Footer (Desktop only to maximize mobile typing space) */}
      <div className="hidden sm:block">
        <Footer
          onRestart={dialogue.resetScenario}
          onOpenScenarios={() => setIsScenarioModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <ScenarioSelector
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        currentScenarioId={currentScenario.id}
        currentCategory={currentScenario.category}
        onSelectScenario={(s) => {
          hasShownScorecardRef.current = false;
          setIsScorecardOpen(false);
          dialogue.resetScenario();
          setCurrentScenario(s);
          setIsScenarioModalOpen(false);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          storage.saveSettings(newSettings);
        }}
      />

      <ScorecardModal
        isOpen={isScorecardOpen}
        onClose={handleCloseScorecard}
        scenario={currentScenario}
        metrics={dialogue.aggregateMetrics}
        onRestart={handleRestartScenario}
        onNextScenario={handleNextScenario}
      />
    </div>
  );
}
