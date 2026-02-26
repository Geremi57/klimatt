// ui/src/components/chat/AiChatModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { AiChatMessage } from './AiChatMessage';
import { AiChatInput } from './AiChatInput';
import { useAiChat } from './useAiChat';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const { messages, sendMessage, isLoading, suggestions } = useAiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card 
        className={`w-full max-w-md transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}
        style={{
          backgroundColor: 'oklch(1 0 0)', // White
          borderColor: 'oklch(0.92 0.01 142.5)', // Border color
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b cursor-move"
          style={{ borderColor: 'oklch(0.92 0.01 142.5)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: 'oklch(0.45 0.15 142.5)' }} // Primary green
            />
            <h3 className="font-semibold" style={{ color: 'oklch(0.2 0.02 142.5)' }}>
              KlimattAI
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(600px-130px)]">
              {messages.map((message, index) => (
                <AiChatMessage key={index} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex gap-2 items-center">
                  <div 
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'oklch(0.45 0.15 142.5)' }}
                  />
                  <div 
                    className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]"
                    style={{ backgroundColor: 'oklch(0.55 0.18 50)' }} // Accent orange
                  />
                  <div 
                    className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]"
                    style={{ backgroundColor: 'oklch(0.75 0.1 142.5)' }} // Secondary green
                  />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 text-sm rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: 'oklch(0.9 0.02 142.5)', // Muted
                      color: 'oklch(0.2 0.02 142.5)', // Foreground
                    }}
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <AiChatInput onSend={sendMessage} isLoading={isLoading} />
          </>
        )}
      </Card>
    </div>
  );
};