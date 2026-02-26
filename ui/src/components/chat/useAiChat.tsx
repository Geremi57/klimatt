// ui/src/components/chat/useAiChat.ts
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Export the Message type properly
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface CropContext {
  name: string;
  plantingDate?: string;
  harvestDate?: string;
}

export const useAiChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your Klimatt farming assistant. I can help with:\n\n🌱 Pest identification & solutions\n📅 Planting & harvest times\n📊 Market prices & trends\n🛒 Marketplace tips\n\nWhat would you like to know?",
      timestamp: Date.now(),
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Pests on my tomatoes",
    "When to plant maize",
    "Market prices Nairobi",
    "Organic fertilizer recipe",
  ]);
  
  const [_cropContext, _setCropContext] = useState<CropContext | null>(null); // Fixed unused variable warning

  // Load user's preferred crops from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('klimatt-preferred-crops');
    if (saved) {
      const crops = JSON.parse(saved);
      if (crops.length > 0) {
        _setCropContext({ name: crops[0] });
        setSuggestions(prev => [
          `Pests on my ${crops[0]}`,
          `When to harvest ${crops[0]}`,
          ...prev.slice(2)
        ]);
      }
    }
  }, []);

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      const response = await simulateAIResponse(content);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update suggestions based on context
      updateSuggestions(content);
      
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (query: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    const lowerQuery = query.toLowerCase();
    
    // Pest-related queries
    if (lowerQuery.includes('pest') || lowerQuery.includes('bug') || lowerQuery.includes('disease')) {
      if (lowerQuery.includes('tomato')) {
        return "🐛 **Common tomato pests in Kenya:**\n\n" +
          "1. **Aphids** - Small green/black insects\n" +
          "   → Solution: Neem oil spray or soapy water\n\n" +
          "2. **Tomato leaf miner** - Tunnels in leaves\n" +
          "   → Solution: Remove affected leaves, use sticky traps\n\n" +
          "3. **Late blight** - Dark spots on leaves\n" +
          "   → Solution: Copper-based fungicide, improve air circulation\n\n" +
          "Would you like organic or chemical solutions for any of these?";
      }
      return "🐛 **General pest management:**\n\n" +
        "1. **Prevention**: Healthy soil, crop rotation\n" +
        "2. **Early detection**: Check crops daily\n" +
        "3. **Organic first**: Neem oil, companion planting\n" +
        "4. **Chemical last**: Use as directed\n\n" +
        "Which crop are you concerned about?";
    }
    
    // Planting/harvest queries
    if (lowerQuery.includes('plant') || lowerQuery.includes('harvest')) {
      return "📅 **Planting Calendar for Central Kenya:**\n\n" +
        "**Long rains (March-May):**\n" +
        "• Maize: Early March\n" +
        "• Beans: Mid-March\n" +
        "• Tomatoes: Late March\n\n" +
        "**Short rains (October-December):**\n" +
        "• Kale: Early October\n" +
        "• Cabbage: Mid-October\n" +
        "• Carrots: November\n\n" +
        "What crop are you planning to plant?";
    }
    
    // Market prices
    if (lowerQuery.includes('price') || lowerQuery.includes('market')) {
      return "📊 **Current market prices (Nairobi):**\n\n" +
        "🥔 **Potatoes**: 3,500-4,000 KES/90kg bag\n" +
        "🌽 **Maize**: 4,000-4,500 KES/90kg bag\n" +
        "🍅 **Tomatoes**: 50-80 KES/kg\n" +
        "🥬 **Kale/Sukuma**: 20-30 KES/bunch\n" +
        "🧅 **Onions**: 100-120 KES/kg\n\n" +
        "Prices vary by market. Which market are you near?";
    }
    
    // Default response
    return "I'm here to help with your farming questions! You can ask me about:\n\n" +
      "🌱 Pest control for specific crops\n" +
      "📅 Best planting and harvest times\n" +
      "📊 Current market prices\n" +
      "🛒 Marketplace tips\n" +
      "🌿 Organic farming methods\n\n" +
      "What would you like to know more about?";
  };

  const updateSuggestions = (lastQuery: string) => {
    const lower = lastQuery.toLowerCase();
    
    if (lower.includes('tomato')) {
      setSuggestions([
        "Tomato diseases",
        "Tomato market price",
        "Tomato fertilizer",
        "When to prune tomatoes"
      ]);
    } else if (lower.includes('maize')) {
      setSuggestions([
        "Maize pests",
        "Maize planting spacing",
        "Maize market price",
        "Maize harvesting time"
      ]);
    } else {
      setSuggestions([
        "Pest control",
        "Planting calendar",
        "Market prices",
        "Organic farming"
      ]);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    suggestions,
  };
};