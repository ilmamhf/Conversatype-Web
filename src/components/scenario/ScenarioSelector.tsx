import React, { useState, useEffect } from 'react';
import { Scenario, ScenarioCategory } from '../../types/scenario';
import { appScenarios, realLifeScenarios } from '../../data';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { storage } from '../../lib/storage';
import {
  Search,
  Trophy,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Compass,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

interface ScenarioSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenarioId: string;
  currentCategory?: ScenarioCategory;
  onSelectScenario: (scenario: Scenario) => void;
}

type SelectionPhase = 'format' | 'scenario';

interface FormatOption {
  id: ScenarioCategory;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  count: number;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  isOpen,
  onClose,
  currentScenarioId,
  currentCategory = 'app',
  onSelectScenario,
}) => {
  const [phase, setPhase] = useState<SelectionPhase>('format');
  const [selectedFormat, setSelectedFormat] = useState<ScenarioCategory>(currentCategory);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const highScores = storage.getHighScores();

  // Sync format with current category when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFormat(currentCategory);
      setPhase('format');
      setDifficultyFilter('all');
      setSearchQuery('');
    }
  }, [isOpen, currentCategory]);

  const formats: FormatOption[] = [
    {
      id: 'app',
      title: 'App Chat Simulation',
      badge: `${appScenarios.length} Scenarios`,
      tagline: 'Texting, Workplace Slack & Messaging',
      description:
        'Practice rapid-fire messaging, informal workplace banter, IT helpdesk troubleshooting, and witty dating openers in modern chat interfaces.',
      icon: <MessageSquare className="w-6 h-6" style={{ color: 'var(--color-brand)' }} />,
      count: appScenarios.length,
    },
    {
      id: 'real-life',
      title: 'Real-Life Scenarios',
      badge: `${realLifeScenarios.length} Scenarios`,
      tagline: 'Situational Dialogues with Visual Cards',
      description:
        'Navigate spoken, face-to-face encounters with photographic scene cards: coffee ordering, job interviews, airport customs, clinic triage, and hotel check-in.',
      icon: <Compass className="w-6 h-6 text-amber-500" />,
      count: realLifeScenarios.length,
    },
  ];

  const handleSelectFormat = (formatId: ScenarioCategory) => {
    setSelectedFormat(formatId);
    setDifficultyFilter('all');
    setSearchQuery('');
    setPhase('scenario');
  };

  const handleBackToFormats = () => {
    setPhase('format');
  };

  const handleModalClose = () => {
    onClose();
    setTimeout(() => setPhase('format'), 200);
  };

  // Strictly separate pools: App Chat vs Real-Life
  const activeScenarioPool: Scenario[] = selectedFormat === 'app' ? appScenarios : realLifeScenarios;

  const filteredScenarios = activeScenarioPool.filter((s: Scenario) => {
    const matchesDifficulty = difficultyFilter === 'all' || s.difficulty === difficultyFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetAudienceTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        phase === 'format'
          ? 'Step 1: Choose Simulation Format'
          : `Step 2: Choose ${selectedFormat === 'app' ? 'App Chat' : 'Real-Life'} Scenario`
      }
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* PHASE 1: Format Selection (App Chat vs Real-Life) */}
        {phase === 'format' && (
          <div className="space-y-4">
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-xs sm:text-sm font-medium"
            >
              Choose the conversation simulation format you want to practice:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formats.map((fmt) => {
                const isCurrentActiveFormat = currentCategory === fmt.id;

                return (
                  <div
                    key={fmt.id}
                    onClick={() => handleSelectFormat(fmt.id)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: isCurrentActiveFormat ? 'var(--color-brand)' : 'var(--border-app)',
                      boxShadow: isCurrentActiveFormat
                        ? '0 4px 0 0 var(--color-brand-shadow)'
                        : '0 2px 0 0 var(--border-app)',
                    }}
                    className={clsx(
                      'group p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-xs select-none hover:brightness-98',
                      isCurrentActiveFormat && 'translate-y-[-2px]'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div
                          style={{
                            backgroundColor: 'var(--bg-surface-secondary)',
                            borderColor: 'var(--border-app)',
                          }}
                          className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-xs"
                        >
                          {fmt.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isCurrentActiveFormat && (
                            <span
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-text)',
                              }}
                              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                            >
                              Current
                            </span>
                          )}
                          <span
                            style={{
                              backgroundColor:
                                fmt.id === 'app' ? 'rgba(88, 204, 2, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: fmt.id === 'app' ? 'var(--color-brand)' : '#f59e0b',
                            }}
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                          >
                            {fmt.badge}
                          </span>
                        </div>
                      </div>

                      <h3
                        style={{ color: 'var(--text-primary)' }}
                        className="font-extrabold text-base sm:text-lg tracking-tight mb-0.5"
                      >
                        {fmt.title}
                      </h3>
                      <p
                        style={{ color: 'var(--color-brand)' }}
                        className="text-xs font-bold mb-2"
                      >
                        {fmt.tagline}
                      </p>
                      <p
                        style={{ color: 'var(--text-secondary)' }}
                        className="text-xs leading-relaxed mb-4"
                      >
                        {fmt.description}
                      </p>
                    </div>

                    <div
                      style={{
                        borderColor: 'var(--border-app)',
                        backgroundColor: 'var(--bg-surface-secondary)',
                      }}
                      className="p-3 rounded-2xl border flex items-center justify-between"
                    >
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        5 Scenarios Available
                      </span>
                      <div
                        className="flex items-center gap-1 text-xs font-bold"
                        style={{ color: 'var(--color-brand)' }}
                      >
                        <span>Choose</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 2: Scenario Selection (Strictly Separated Pool) */}
        {phase === 'scenario' && (
          <div className="space-y-3.5">
            {/* Navigation Header */}
            <div
              className="flex items-center justify-between gap-2 border-b-2 pb-2.5"
              style={{ borderColor: 'var(--border-app)' }}
            >
              <button
                onClick={handleBackToFormats}
                style={{
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderColor: 'var(--border-app)',
                  color: 'var(--text-primary)',
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold hover:brightness-95 transition-all select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Formats</span>
              </button>

              <div
                className="text-xs font-extrabold text-right truncate flex items-center gap-2"
                style={{ color: 'var(--color-brand)' }}
              >
                <span>{selectedFormat === 'app' ? '💬 App Chat Simulations' : '🌍 Real-Life Scenarios'}</span>
                <span
                  style={{
                    backgroundColor: 'var(--bg-surface-secondary)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-app)',
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                >
                  {filteredScenarios.length} {filteredScenarios.length === 1 ? 'scenario' : 'scenarios'}
                </span>
              </div>
            </div>

            {/* Search & Difficulty Filter Pills */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${selectedFormat === 'app' ? 'chat topics' : 'real-life scenes'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderColor: 'var(--border-app)',
                    color: 'var(--text-primary)',
                  }}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl border-2 text-xs placeholder:text-slate-400 focus:outline-none focus:border-brand transition-colors"
                />
              </div>

              {/* Difficulty Filter */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderColor: 'var(--border-app)',
                }}
                className="flex items-center p-0.5 border-2 rounded-xl shrink-0"
              >
                {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    style={
                      difficultyFilter === diff
                        ? {
                            backgroundColor: 'var(--color-brand)',
                            color: 'var(--color-brand-text)',
                            boxShadow: '0 2px 0 0 var(--color-brand-shadow)',
                          }
                        : { color: 'var(--text-secondary)' }
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize"
                  >
                    {diff === 'all' ? 'All' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1 pt-1.5 pb-2">
              {filteredScenarios.length === 0 ? (
                <div
                  style={{ color: 'var(--text-muted)' }}
                  className="col-span-2 py-8 text-center text-xs font-medium"
                >
                  No scenarios found matching your filters.
                </div>
              ) : (
                filteredScenarios.map((item: Scenario) => {
                  const isSelected = item.id === currentScenarioId;
                  const highScore = highScores[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectScenario(item);
                        handleModalClose();
                      }}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: isSelected ? 'var(--color-brand)' : 'var(--border-app)',
                        boxShadow: isSelected
                          ? '0 2px 0 0 var(--color-brand-shadow)'
                          : '0 2px 0 0 var(--border-app)',
                      }}
                      className={clsx(
                        'group p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left select-none relative hover:brightness-98',
                        isSelected && 'ring-1 ring-brand-500/30'
                      )}
                    >
                      <div>
                        {/* Top Row: Visual Avatar & Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            {item.sceneImage ? (
                              <img
                                src={item.sceneImage}
                                alt={item.title}
                                className="w-9 h-9 rounded-xl object-cover border shrink-0"
                                style={{ borderColor: 'var(--border-app)' }}
                              />
                            ) : (
                              <div
                                style={{
                                  backgroundColor: 'var(--bg-surface-secondary)',
                                  borderColor: 'var(--border-app)',
                                }}
                                className="w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0"
                              >
                                {item.npcAvatar || '💬'}
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <span
                                style={{
                                  backgroundColor:
                                    item.category === 'real-life'
                                      ? 'rgba(245, 158, 11, 0.15)'
                                      : 'rgba(88, 204, 2, 0.15)',
                                  color:
                                    item.category === 'real-life' ? '#f59e0b' : 'var(--color-brand)',
                                }}
                                className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                              >
                                {item.category === 'real-life' ? 'Real-Life' : 'App Chat'}
                              </span>
                              <span
                                style={{
                                  backgroundColor: 'var(--bg-surface-secondary)',
                                  color: 'var(--text-secondary)',
                                  borderColor: 'var(--border-app)',
                                }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              >
                                {item.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Selected Status Badge or Turn Count */}
                          {isSelected ? (
                            <span
                              style={{
                                backgroundColor: 'var(--color-brand)',
                                color: 'var(--color-brand-text)',
                              }}
                              className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs shrink-0"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              Active
                            </span>
                          ) : (
                            <span
                              style={{ color: 'var(--text-muted)' }}
                              className="text-[11px] font-mono shrink-0"
                            >
                              {item.turns.length} Turns
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h4
                          style={{
                            color: isSelected ? 'var(--color-brand)' : 'var(--text-primary)',
                          }}
                          className="font-extrabold text-sm transition-colors line-clamp-1"
                        >
                          {item.title}
                        </h4>
                        <p
                          style={{ color: 'var(--text-secondary)' }}
                          className="text-xs line-clamp-2 mt-1 mb-2.5"
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* Bottom Footer: Practice Tag & High Score */}
                      <div
                        style={{ borderColor: 'var(--border-app)' }}
                        className="pt-2 border-t flex items-center justify-between text-[11px]"
                      >
                        <span style={{ color: 'var(--color-brand)' }} className="font-bold truncate max-w-[65%]">
                          {item.targetAudienceTag}
                        </span>

                        {highScore ? (
                          <span className="flex items-center gap-1 text-amber-500 font-mono font-bold shrink-0">
                            <Trophy className="w-3 h-3" />
                            {highScore.wpm} WPM
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                            Not played yet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div
          style={{ borderColor: 'var(--border-app)' }}
          className="pt-3 border-t-2 flex justify-end"
        >
          <Button variant="secondary" size="sm" onClick={handleModalClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
