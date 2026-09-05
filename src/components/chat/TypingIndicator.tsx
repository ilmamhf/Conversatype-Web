import React from 'react';

interface TypingIndicatorProps {
  npcName: string;
  npcAvatar?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  npcName,
  npcAvatar = '💬',
}) => {
  return (
    <div className="flex w-full gap-2.5 justify-start items-center transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 select-none">
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-app)',
        }}
        className="w-9 h-9 rounded-2xl border-2 flex items-center justify-center text-lg shrink-0 shadow-sm"
      >
        {npcAvatar}
      </div>
      <div
        style={{
          backgroundColor: 'var(--bubble-npc-bg)',
          borderColor: 'var(--bubble-npc-border)',
          color: 'var(--text-secondary)',
        }}
        className="border-2 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2 shadow-sm"
      >
        <span className="text-xs font-semibold mr-1">{npcName} is typing</span>
        <div className="flex items-center gap-1.5">
          <span
            style={{ backgroundColor: 'var(--color-brand)' }}
            className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]"
          />
          <span
            style={{ backgroundColor: 'var(--color-brand)' }}
            className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]"
          />
          <span
            style={{ backgroundColor: 'var(--color-brand)' }}
            className="w-2 h-2 rounded-full animate-bounce"
          />
        </div>
      </div>
    </div>
  );
};
