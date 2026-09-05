import React from 'react';
import { ChatMessage } from '../../types/scenario';
import { CheckCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageBubbleProps {
  message: ChatMessage;
  npcName: string;
  npcRole: string;
  npcAvatar?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  npcName,
  npcAvatar = '💬',
}) => {
  const isUser = message.speaker === 'user';

  return (
    <div
      className={clsx(
        'flex w-full gap-2.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-app)',
          }}
          className="w-9 h-9 rounded-2xl border-2 flex items-center justify-center text-lg shrink-0 shadow-sm select-none"
        >
          {npcAvatar}
        </div>
      )}

      <div
        style={
          isUser
            ? {
                backgroundColor: 'var(--bubble-user-bg)',
                color: 'var(--bubble-user-text)',
                boxShadow: '0 3px 0 0 var(--color-brand-shadow)',
              }
            : {
                backgroundColor: 'var(--bubble-npc-bg)',
                borderColor: 'var(--bubble-npc-border)',
                color: 'var(--bubble-npc-text)',
              }
        }
        className={clsx(
          'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm sm:text-base leading-relaxed',
          isUser
            ? 'rounded-br-sm font-medium'
            : 'border-2 rounded-bl-sm font-normal'
        )}
      >
        {!isUser && (
          <div
            style={{ color: 'var(--text-secondary)' }}
            className="text-[11px] font-bold mb-1 flex items-center gap-1.5 select-none"
          >
            <span>{npcName}</span>
          </div>
        )}

        <div className="whitespace-pre-wrap">{message.text}</div>

        <div
          style={{
            color: isUser ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-muted)',
          }}
          className="flex items-center gap-1 text-[10px] mt-1 justify-end font-semibold select-none"
        >
          <span>{message.timestamp}</span>
          {isUser && <CheckCheck className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
};
