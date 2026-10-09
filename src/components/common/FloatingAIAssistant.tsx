import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FloatingAIAssistant: React.FC = () => {
  const {
    isAssistantDrawerOpen,
    setIsAssistantDrawerOpen,
    student,
    mentorMessages,
    isMentorTyping,
    sendMentorQuery,
    setActiveTab,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAssistantDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mentorMessages, isAssistantDrawerOpen]);

  if (!isAssistantDrawerOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isMentorTyping) return;
    sendMentorQuery(q.trim());
    setInputQuery('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-[#A5E6E2]/70 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="p-3.5 bg-[#0B757B] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight">ProAct AI Mentor</h3>
            <span className="text-[10px] text-[#A5E6E2] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77DAD7]" />
              Academic success assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsAssistantDrawerOpen(false);
              setActiveTab('mentor');
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white"
            title="Expand to Full Page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAssistantDrawerOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white"
            title="Close Mentor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-[#F0FAF9]/20">
        {mentorMessages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl leading-relaxed ${
              m.sender === 'user'
                ? 'bg-[#0B757B] text-white ml-8 rounded-tr-xs'
                : 'bg-white border border-[#A5E6E2]/50 text-slate-800 mr-4 rounded-tl-xs shadow-xs'
            }`}
          >
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}

        {isMentorTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Bot className="w-3.5 h-3.5 animate-spin-slow text-[#0A858C]" />
            <span>ProAct AI Mentor is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 border-t border-slate-100 bg-[#F0FAF9] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSend('What should I focus on first?')}
          className="text-[10px] bg-white border border-[#A5E6E2]/70 px-2 py-0.5 rounded-full text-[#0B757B] hover:bg-[#A5E6E2]/30 shrink-0 font-medium"
        >
          Check top risks?
        </button>
        <button
          onClick={() => handleSend('Check my attendance standing')}
          className="text-[10px] bg-white border border-[#A5E6E2]/70 px-2 py-0.5 rounded-full text-[#0B757B] hover:bg-[#A5E6E2]/30 shrink-0 font-medium"
        >
          Attendance standing?
        </button>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 border-t border-[#A5E6E2]/50 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask ProAct AI Mentor..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isMentorTyping}
          className="flex-1 text-xs px-3 py-2 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#36B8B7]"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isMentorTyping}
          className="p-2 bg-[#0B757B] text-white rounded-lg hover:bg-[#0A858C] disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
