import React, { useState } from 'react';
import { Scenario, ContextGroup } from '../../types/scenario';
import { allScenarios } from '../../data';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { storage } from '../../lib/storage';
import {
  Search,
  Trophy,
  ArrowLeft,
  ChevronRight,
  Briefcase,
  Coffee,
  MessageCircle,
  Plane,
  HeartPulse,
  Sparkles,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

interface ScenarioSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenarioId: string;
  onSelectScenario: (scenario: Scenario) => void;
}

type SelectionPhase = 'category' | 'scenario';

interface CategoryOption {
  id: ContextGroup | 'all';
  title: string;
  desc: string;
  icon: React.ReactNode;
  count: number;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  isOpen,
  onClose,
  currentScenarioId,
  onSelectScenario,
}) => {
  const [phase, setPhase] = useState<SelectionPhase>('category');
  const [selectedContext, setSelectedContext] = useState<ContextGroup | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const highScores = storage.getHighScores();

  const categories: CategoryOption[] = [
    {
      id: 'casual',
      title: 'Casual & Daily Banter',
      desc: 'Late-night food orders, coffee shop barista chats, casual banter',
      icon: <Coffee className="w-5 h-5 text-amber-500" />,
      count: allScenarios.filter((s) => s.contextGroup === 'casual').length,
    },
    {
      id: 'corporate',
      title: 'Corporate & Workplace',
      desc: 'Tech behavioral job interview, urgent 6 PM Slack pings, IT support',
      icon: <Briefcase className="w-5 h-5 text-blue-500" />,
      count: allScenarios.filter((s) => s.contextGroup === 'corporate').length,
    },
    {
      id: 'social',
      title: 'Social Media & Dating',
      desc: 'Group chat screenshot misunderstandings, witty dating app openers',
      icon: <MessageCircle className="w-5 h-5 text-rose-500" />,
      count: allScenarios.filter((s) => s.contextGroup === 'social').length,
    },
    {
      id: 'travel',
      title: 'Travel & Hospitality',
      desc: 'Airport customs clearance, luxury hotel late check-in glitches',
      icon: <Plane className="w-5 h-5 text-sky-500" />,
      count: allScenarios.filter((s) => s.contextGroup === 'travel').length,
    },
    {
      id: 'services',
      title: 'Public & Health Services',
      desc: 'Emergency clinic triage consultation, articulating health symptoms',
      icon: <HeartPulse className="w-5 h-5 text-emerald-500" />,
      count: allScenarios.filter((s) => s.contextGroup === 'services').length,
    },
    {
      id: 'all',
      title: 'All Conversations (Browse All)',
      desc: 'View all 10 conversation scenarios across all difficulty levels',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      count: allScenarios.length,
    },
  ];

  const handleSelectCategory = (catId: ContextGroup | 'all') => {
    setSelectedContext(catId);
    setDifficultyFilter('all');
    setSearchQuery('');
    setPhase('scenario');
  };

  const handleBackToCategories = () => {
    setPhase('category');
  };

  const activeCategoryInfo = categories.find((c) => c.id === selectedContext);

  const filteredScenarios = allScenarios.filter((s) => {
    const matchesContext = selectedContext === 'all' || s.contextGroup === selectedContext;
    const matchesDifficulty = difficultyFilter === 'all' || s.difficulty === difficultyFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetAudienceTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesContext && matchesDifficulty && matchesSearch;
  });

  const handleModalClose = () => {
    onClose();
    // Reset to category phase on next open
    setTimeout(() => setPhase('category'), 200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={phase === 'category' ? 'Step 1: Choose Conversation Type' : 'Step 2: Choose Scenario'}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* PHASE 1: Category Selection Grid */}
        {phase === 'category' && (
          <div className="space-y-3">
            <p
              style={{ color: 'var(--text-secondary)' }}
              className="text-xs sm:text-sm font-medium"
            >
              Select the conversational environment you want to practice typing in:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-app)',
                  }}
                  className="group p-4 rounded-2xl border-2 hover:border-brand-500 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs hover:shadow-md select-none"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      style={{
                        backgroundColor: 'var(--bg-surface-secondary)',
                        borderColor: 'var(--border-app)',
                      }}
                      className="w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-xs"
                    >
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          style={{ color: 'var(--text-primary)' }}
                          className="font-extrabold text-sm truncate"
                        >
                          {cat.title}
                        </h4>
                        <span
                          style={{
                            backgroundColor: 'var(--bg-surface-secondary)',
                            color: 'var(--text-secondary)',
                            borderColor: 'var(--border-app)',
                          }}
                          className="text-[10px] font-bold px-2 py-0.2 rounded-full border shrink-0"
                        >
                          {cat.count}
                        </span>
                      </div>
                      <p
                        style={{ color: 'var(--text-secondary)' }}
                        className="text-xs line-clamp-2 mt-0.5"
                      >
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--color-brand)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 2: Scenario Drilldown */}
        {phase === 'scenario' && (
          <div className="space-y-3.5">
            {/* Navigation Header & Category Breadcrumb */}
            <div className="flex items-center justify-between gap-2 border-b-2 pb-2.5" style={{ borderColor: 'var(--border-app)' }}>
              <button
                onClick={handleBackToCategories}
                style={{
                  backgroundColor: 'var(--bg-surface-secondary)',
                  borderColor: 'var(--border-app)',
                  color: 'var(--text-primary)',
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-bold hover:brightness-95 transition-all select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Types</span>
              </button>

              <div className="text-xs font-bold text-right truncate" style={{ color: 'var(--color-brand)' }}>
                {activeCategoryInfo?.title}
              </div>
            </div>

            {/* Search & Difficulty Filter Pills */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search topic or English keyword..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {filteredScenarios.length === 0 ? (
                <div
                  style={{ color: 'var(--text-muted)' }}
                  className="col-span-2 py-8 text-center text-xs font-medium"
                >
                  No scenarios found matching your filters.
                </div>
              ) : (
                filteredScenarios.map((item) => {
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
                        backgroundColor: isSelected
                          ? 'var(--bg-surface-secondary)'
                          : 'var(--bg-surface)',
                        borderColor: isSelected ? 'var(--color-brand)' : 'var(--border-app)',
                        boxShadow: isSelected
                          ? '0 4px 0 0 var(--color-brand-shadow)'
                          : '0 2px 0 0 var(--border-app)',
                      }}
                      className={clsx(
                        'group p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left select-none relative hover:brightness-98',
                        isSelected && 'translate-y-[-2px]'
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
