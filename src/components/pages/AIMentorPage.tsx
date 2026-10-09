import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  BookOpen,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AIMentorPage: React.FC = () => {
  const {
    student,
    subjects,
    risks,
    todos,
    mentorMessages,
    isMentorTyping,
    sendMentorQuery,
    clearMentorChat,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mentorMessages, isMentorTyping]);

  const quickPrompts = [
    'Which subject has my lowest attendance?',
    'What are my highest priority academic risks right now?',
    'How should I divide my daily study hours this week?',
    'Explain how many classes I need to attend to stay safe in my weakest subject.',
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isMentorTyping) return;
    sendMentorQuery(q.trim());
    setInputQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#A5E6E2]/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F0FAF9] text-[#0B757B] border border-[#77DAD7]/50 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-[#0A858C]" />
          </div>
          <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#0B757B]">ProAct AI Mentor</h1>
                <span className="text-xs font-semibold text-[#0A858C] bg-[#F0FAF9] border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full">
                  Strict Grounding Active
                </span>
                <span className="text-xs font-semibold text-[#0B757B] bg-[#A5E6E2]/30 border border-[#77DAD7]/50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  n8n Chat Webhook Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Contextual guidance powered by your n8n workflow pipeline & Gemini models, grounded on your verified records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={clearMentorChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-[#A5E6E2]/60 shadow-xs flex flex-col h-[560px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {mentorMessages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-2xl ${
                  isUser ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#0B757B] text-white'
                      : 'bg-[#F0FAF9] text-[#0A858C] border border-[#77DAD7]/60'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#0B757B] text-white rounded-tr-xs'
                        : 'bg-[#F0FAF9]/60 border border-[#A5E6E2]/50 text-slate-800 rounded-tl-xs space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {!isUser && (
                      <div className="pt-2 border-t border-[#A5E6E2]/30 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          {msg.source === 'n8n' && (
                            <span className="font-bold text-[#0B757B] bg-[#A5E6E2]/40 px-1.5 py-0.5 rounded text-[9px]">
                              n8n Workflow
                            </span>
                          )}
                          {msg.source === 'gemini' && (
                            <span className="font-bold text-[#0A858C] bg-[#F0FAF9] px-1.5 py-0.5 rounded text-[9px]">
                              Gemini AI
                            </span>
                          )}
                          {msg.source === 'rules' && (
                            <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">
                              Academic Rules Engine
                            </span>
                          )}
                          <span>
                            {msg.source === 'n8n'
                              ? 'Processed via n8n webhook'
                              : msg.isLiveAI
                              ? 'Synthesized via Gemini AI'
                              : 'Deterministic Mentor Response'}
                          </span>
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isMentorTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F0FAF9] text-[#0B757B] flex items-center justify-center border border-[#77DAD7]/60">
                <Bot className="w-4 h-4 animate-spin-slow text-[#0A858C]" />
              </div>
              <div className="bg-[#F0FAF9]/60 p-3 rounded-2xl text-xs text-slate-500 border border-[#A5E6E2]/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0B757B] animate-pulse" />
                <span>ProAct AI Mentor is analyzing your saved academic records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-[#F0FAF9]/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-[#F0FAF9] hover:text-[#0B757B] px-3 py-1 rounded-full border border-[#A5E6E2]/60 shrink-0 transition-colors cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-[#A5E6E2]/50 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask ProAct AI Mentor about your attendance, risks, or recovery..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isMentorTyping}
            className="flex-1 text-xs px-3.5 py-2.5 bg-[#F0FAF9]/50 border border-[#A5E6E2]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#36B8B7]"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isMentorTyping}
            className="px-4 py-2.5 bg-[#0B757B] hover:bg-[#0A858C] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Ask Mentor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
