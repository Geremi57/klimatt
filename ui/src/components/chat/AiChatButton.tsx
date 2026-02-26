// ui/src/components/chat/AiChatButton.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AiChatModal } from './AiChatModal';
import { Button } from '../ui/button';

interface Position {
  x: number;
  y: number;
}

export const AiChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    // Load saved position or set default (bottom right)
    const saved = localStorage.getItem('klimatt-chat-position');
    if (saved) {
      return JSON.parse(saved);
    }
    return { x: window.innerWidth - 100, y: window.innerHeight - 100 };
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('klimatt-chat-position', JSON.stringify(position));
  }, [position]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    setIsDragging(true);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to viewport
      const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - 60));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <>
      <Button
        ref={buttonRef}
        className={`fixed z-50 rounded-full w-14 h-14 shadow-lg transition-shadow hover:shadow-xl ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(0, 0)',
          backgroundColor: 'oklch(0.45 0.15 142.5)', // Primary green
        }}
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(true)}
        type="button"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </Button>

      <AiChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};