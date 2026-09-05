import React, { useEffect, useRef } from 'react';
import { ChatMessage, Scenario } from '../../types/scenario';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatFeedProps {
  messages: ChatMessage[];
  scenario: Scenario;
  isNpcTyping: boolean;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  scenario,
  isNpcTyping,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isNpcTyping]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3.5">
      {messages.length === 0 && !isNpcTyping && (
        <div
          style={{ color: 'var(--text-muted)' }}
          className="flex flex-col items-center justify-center h-full py-8 text-center select-none"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              borderColor: 'var(--border-app)',
            }}
            className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl mb-2.5 shadow-sm"
          >
            {scenario.npcAvatar || '💬'}
          </div>
          <p className="text-xs sm:text-sm font-semibold">
            Starting conversation with {scenario.npcName}...
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          npcName={scenario.npcName}
          npcRole={scenario.npcRole}
          npcAvatar={scenario.npcAvatar}
        />
      ))}

      {isNpcTyping && (
        <TypingIndicator
          npcName={scenario.npcName}
          npcAvatar={scenario.npcAvatar}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
};
