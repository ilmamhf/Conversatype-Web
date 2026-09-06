import React from 'react';
import { Scenario } from '../../types/scenario';
import { MapPin, User, Sparkles } from 'lucide-react';

interface SceneFrameProps {
  scenario: Scenario;
  layoutMode?: 'sidebar' | 'banner';
}

export const SceneFrame: React.FC<SceneFrameProps> = ({ scenario, layoutMode = 'sidebar' }) => {
  if (!scenario.sceneImage) return null;

  // Mobile Compact Banner Mode (Takes only 48-52px height)
  if (layoutMode === 'banner') {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-app)',
        }}
        className="flex items-center gap-2.5 p-1.5 sm:p-2 rounded-2xl border-2 shadow-sm shrink-0 md:hidden"
      >
        <img
          src={scenario.sceneImage}
          alt={scenario.title}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              style={{
                backgroundColor: 'rgba(88, 204, 2, 0.15)',
                color: 'var(--color-brand)',
              }}
              className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md"
            >
              Real-Life
            </span>
            <span
              style={{ color: 'var(--text-secondary)' }}
              className="text-xs truncate font-bold"
            >
              {scenario.title}
            </span>
          </div>
          <div
            style={{ color: 'var(--text-muted)' }}
            className="flex items-center gap-2 text-[11px] truncate mt-0.5"
          >
            {scenario.sceneLocation && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{scenario.sceneLocation}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Side-Card Mode
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-app)',
      }}
      className="hidden md:flex flex-col rounded-3xl border-2 overflow-hidden shadow-sm w-72 lg:w-80 shrink-0 h-full max-h-full select-none"
    >
      {/* Visual Image */}
      <div className="relative h-44 lg:h-48 w-full overflow-hidden shrink-0">
        <img
          src={scenario.sceneImage}
          alt={scenario.title}
          className="w-full h-full object-cover object-center brightness-[0.9] hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Real-Life Scene
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-200 text-[11px] font-bold">
            {scenario.difficulty}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-extrabold text-base leading-tight drop-shadow-md">
            {scenario.title}
          </h3>
          {scenario.sceneLocation && (
            <div className="flex items-center gap-1 text-xs text-slate-200 font-medium mt-1 drop-shadow">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{scenario.sceneLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scenario Details & Premise */}
      <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                borderColor: 'var(--border-app)',
              }}
              className="w-8 h-8 rounded-xl border-2 flex items-center justify-center text-base shrink-0"
            >
              {scenario.npcAvatar || '💬'}
            </div>
            <div>
              <div
                style={{ color: 'var(--text-primary)' }}
                className="text-xs font-bold"
              >
                {scenario.npcName}
              </div>
              <div
                style={{ color: 'var(--text-secondary)' }}
                className="text-[11px]"
              >
                {scenario.npcRole}
              </div>
            </div>
          </div>

          <p
            style={{ color: 'var(--text-secondary)' }}
            className="text-xs leading-relaxed"
          >
            {scenario.description}
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            borderColor: 'var(--border-app)',
          }}
          className="mt-3 p-2.5 rounded-2xl border-2 text-[11px] font-semibold flex items-center justify-between"
        >
          <span style={{ color: 'var(--text-secondary)' }}>Target Practice:</span>
          <span
            style={{ color: 'var(--color-brand)' }}
            className="font-bold"
          >
            {scenario.targetAudienceTag}
          </span>
        </div>
      </div>
    </div>
  );
};
