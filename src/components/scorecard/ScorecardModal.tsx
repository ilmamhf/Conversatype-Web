import React, { useState } from 'react';
import { Scenario } from '../../types/scenario';
import { TypingMetrics } from '../../types/typing';
import { getRankTier, generateShareText } from '../../lib/metrics';
import { analytics } from '../../lib/analytics';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WpmChart } from './WpmChart';
import { Trophy, Copy, Check, RotateCcw, ArrowRight, Zap, Target, AlertTriangle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  metrics: TypingMetrics;
  onRestart: () => void;
  onNextScenario: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  isOpen,
  onClose,
  scenario,
  metrics,
  onRestart,
  onNextScenario,
}) => {
  const [copied, setCopied] = useState(false);

  const rank = getRankTier(metrics.wpm, metrics.accuracy);

  const handleCopyCard = async () => {
    const text = generateShareText(scenario.title, metrics, rank.tier);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      analytics.trackScorecardShared(scenario.id, metrics.wpm, metrics.accuracy);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="text-center space-y-4">
        {/* Celebration Header & Tier Badge */}
        <div className="flex flex-col items-center">
          <div
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--color-brand)',
              color: 'var(--color-brand)',
            }}
            className="w-16 h-16 rounded-3xl border-2 flex flex-col items-center justify-center font-black shadow-md mb-2"
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-xl font-mono leading-none">{rank.tier}</span>
          </div>

          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-xl sm:text-2xl font-black tracking-tight"
          >
            Scenario Complete!
          </h2>
          <p
            style={{ color: 'var(--color-brand)' }}
            className="text-xs sm:text-sm font-black"
          >
            {rank.label}
          </p>
          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-xs mt-0.5"
          >
            "{scenario.title}" • {scenario.targetAudienceTag}
          </p>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
            }}
            className="p-3 rounded-2xl border-2 shadow-xs"
          >
            <div className="flex items-center justify-center gap-1 text-[10px] font-black text-amber-500 uppercase mb-0.5">
              <Zap className="w-3.5 h-3.5" />
              Net WPM
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-500">
              {metrics.wpm}
            </div>
            <div
              style={{ color: 'var(--text-secondary)' }}
              className="text-[10px] font-mono mt-0.5"
            >
              Raw: {metrics.rawWpm}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
            }}
            className="p-3 rounded-2xl border-2 shadow-xs"
          >
            <div
              style={{ color: 'var(--char-correct)' }}
              className="flex items-center justify-center gap-1 text-[10px] font-black uppercase mb-0.5"
            >
              <Target className="w-3.5 h-3.5" />
              Accuracy
            </div>
            <div
              style={{ color: 'var(--char-correct)' }}
              className="text-2xl sm:text-3xl font-black font-mono"
            >
              {metrics.accuracy}%
            </div>
            <div
              style={{ color: 'var(--text-secondary)' }}
              className="text-[10px] font-mono mt-0.5"
            >
              {metrics.correctCharsTyped} chars
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
            }}
            className="p-3 rounded-2xl border-2 shadow-xs"
          >
            <div className="flex items-center justify-center gap-1 text-[10px] font-black text-rose-500 uppercase mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Errors
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-500">
              {metrics.errors}
            </div>
            <div
              style={{ color: 'var(--text-secondary)' }}
              className="text-[10px] font-mono mt-0.5"
            >
              Misstrokes
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
            }}
            className="p-3 rounded-2xl border-2 shadow-xs"
          >
            <div className="flex items-center justify-center gap-1 text-[10px] font-black text-sky-500 uppercase mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              Time
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-sky-500">
              {metrics.elapsedSeconds}s
            </div>
            <div
              style={{ color: 'var(--text-secondary)' }}
              className="text-[10px] font-mono mt-0.5"
            >
              Duration
            </div>
          </div>
        </div>

        {/* WPM Consistency Chart */}
        <WpmChart samples={metrics.wpmHistory} />

        {/* Actions Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleCopyCard}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-500" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                Share Scorecard
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              onClose();
              onRestart();
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Try Again
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              onClose();
              onNextScenario();
            }}
          >
            Next Scenario
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
