
import React, { useState, useRef, useEffect } from 'react';
import { AppProps } from '../../types';
import { sendMessageToGemini } from '../../services/geminiService';
import { HelpIcon } from '../../constants';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const HelpAssistantApp: React.FC<AppProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'initial', 
      sender: 'ai', 
      text: "Hello! I'm your Tails OS Help Assistant, powered by Gemini. How can I help you understand Tails OS or online privacy today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const systemInstruction = "You are a helpful AI assistant specialized in explaining Tails OS, its features, and concepts of online privacy and security. Keep your answers concise, informative, and easy to understand for users who might be new to these topics. When relevant, mention how specific Tails features contribute to privacy or security. Do not give financial, legal or medical advice. If asked about topics outside of Tails OS, privacy, or general computer security, politely state that you are specialized in those areas.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToGemini(userMessage.text, systemInstruction);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Error handling is now primarily within sendMessageToGemini, which returns an error string.
      // This catch block is for unexpected errors during the async process itself.
      console.error("Error in handleSubmit after calling sendMessageToGemini:", error);
      const errorMessageText = (error instanceof Error) ? error.message : "An unexpected client-side error occurred.";
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, I encountered an error: ${errorMessageText}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <div className="p-3 bg-slate-200 border-b border-slate-300 flex items-center space-x-2">
        <HelpIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-700">Tails OS Help Assistant</h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-white">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-xl p-3 rounded-lg shadow ${
                msg.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : (msg.text.toLowerCase().startsWith('error:') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-slate-200 text-slate-800')
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200 text-right' : (msg.text.toLowerCase().startsWith('error:') ? 'text-red-500 text-left' : 'text-slate-500 text-left')}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 rounded-lg shadow bg-slate-200 text-slate-800">
              <p className="text-sm italic">Assistant is thinking...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-300 bg-slate-100 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Tails OS or privacy..."
          className="flex-grow p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default HelpAssistantApp;
