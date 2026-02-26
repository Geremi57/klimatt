// ui/src/components/chat/AiChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface AiChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const AiChatInput: React.FC<AiChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mock voice recording (would use Web Speech API in production)
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setMessage(prev => prev + "I need help with pests on my tomatoes");
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="p-4 border-t" style={{ borderColor: 'oklch(0.92 0.01 142.5)' }}>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => alert('File upload coming soon!')}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about pests, crops, markets..."
            disabled={isLoading}
            className="pr-10"
            style={{
              borderColor: 'oklch(0.92 0.01 142.5)',
              backgroundColor: 'oklch(0.98 0.01 142.5)', // Background
            }}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 ${
              isRecording ? 'text-red-500 animate-pulse' : ''
            }`}
            onClick={toggleRecording}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          style={{
            backgroundColor: !message.trim() || isLoading 
              ? 'oklch(0.75 0.1 142.5)' // Secondary green
              : 'oklch(0.45 0.15 142.5)', // Primary green
          }}
          className="flex-shrink-0 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: 'oklch(0.5 0.02 142.5)' }}>
        Ask about pests, planting times, market prices, or farming tips
      </p>
    </div>
  );
};