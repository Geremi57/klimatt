// ui/src/components/chat/AiChatMessage.tsx
import React from 'react';
import { Bot, User } from 'lucide-react';
import type { Message } from './useAiChat'; // Type-only import

interface AiChatMessageProps {
  message: Message;
}

export const AiChatMessage: React.FC<AiChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'oklch(0.45 0.15 142.5 / 0.1)' }} // Primary green with opacity
        >
          <Bot className="w-4 h-4" style={{ color: 'oklch(0.45 0.15 142.5)' }} />
        </div>
      )}
      
      <div 
        className={`max-w-[80%] p-3 rounded-2xl ${
          isUser 
            ? 'rounded-br-none' 
            : 'rounded-bl-none'
        }`}
        style={{
          backgroundColor: isUser 
            ? 'oklch(0.45 0.15 142.5)' // Primary green
            : 'oklch(0.9 0.02 142.5)', // Muted
          color: isUser 
            ? 'white' 
            : 'oklch(0.2 0.02 142.5)', // Foreground
        }}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p 
          className="text-xs mt-1"
          style={{ 
            color: isUser 
              ? 'rgba(255,255,255,0.7)' 
              : 'oklch(0.5 0.02 142.5)' // Muted foreground
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {isUser && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'oklch(0.55 0.18 50 / 0.1)' }} // Accent orange with opacity
        >
          <User className="w-4 h-4" style={{ color: 'oklch(0.55 0.18 50)' }} />
        </div>
      )}
    </div>
  );
};