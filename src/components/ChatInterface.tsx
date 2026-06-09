"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, Cpu, AlertTriangle, Settings } from 'lucide-react';
import { AgentType } from './Sidebar';

interface ChatInterfaceProps {
  activeAgent: AgentType;
  environment: 'Rural' | 'City';
  onOpenSettings: () => void;
  onMessageSent?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type AIStatus = 'idle' | 'loading' | 'responding' | 'error';

// System prompts for each agent
const AGENT_SYSTEM_PROMPTS: Record<AgentType, Record<'Rural' | 'City', string>> = {
  Trainer: {
    City: `You are a Virtual Trainer AI specialized for urban city dwellers. You give science-backed, personalized fitness advice focused on zero-equipment HIIT, posture correction for desk workers, and efficient workouts for busy schedules. Keep responses concise, motivating, and actionable. Max 3-4 sentences per response.`,
    Rural: `You are a Virtual Trainer AI specialized for rural lifestyle. You give fitness advice focused on functional strength, balancing physical labor with restorative recovery, and outdoor workouts using natural terrain. Keep responses concise, practical, and grounded. Max 3-4 sentences per response.`,
  },
  Nutritionist: {
    City: `You are a Digital Nutritionist AI for urban city dwellers. You provide smart nutrition guidance focused on navigating delivery apps, meal prepping efficiently, identifying clean options in restaurants, and hitting micronutrient targets. Keep responses concise and practical. Max 3-4 sentences per response.`,
    Rural: `You are a Digital Nutritionist AI for rural lifestyles. You provide nutrition guidance focused on optimizing locally grown foods, seasonal produce, whole foods, and meeting nutritional needs with simple, accessible ingredients. Keep responses concise and practical. Max 3-4 sentences per response.`,
  },
  Psychologist: {
    City: `You are an On-Demand Psychologist AI for urban stress management. You provide mental wellness support focused on managing urban anxiety, digital detox, work-life balance, mindfulness techniques, and cognitive behavioral strategies. Keep responses empathetic, warm, and actionable. Max 3-4 sentences per response.`,
    Rural: `You are an On-Demand Psychologist AI for rural mental wellness. You provide mental wellness support focused on managing isolation, the weight of physical labor, community connection, and finding mental rest. Keep responses empathetic, warm, and grounding. Max 3-4 sentences per response.`,
  },
};

const WELCOME_MESSAGES: Record<AgentType, Record<'Rural' | 'City', string>> = {
  Trainer: {
    City: "Hello! I'm your Virtual Trainer. I notice you've been desk-bound. Ready for some zero-equipment HIIT or posture correction?",
    Rural: "Hey! I'm your Virtual Trainer. Since we don't have a gym, let's focus on functional symmetry and balancing out your manual labor with restorative yoga.",
  },
  Nutritionist: {
    City: "Hi there! I'm your Digital Nutritionist. Let's find you some clean, organic choices hidden in the city's delivery apps.",
    Rural: "Hello! I'm your Digital Nutritionist. Let's optimize your local crop staples and whole foods to hit those micronutrient targets today.",
  },
  Psychologist: {
    City: "Welcome. I'm your On-Demand Psychologist. Urban noise and corporate deadlines can be overwhelming. Shall we do a 2-minute digital detox?",
    Rural: "Welcome. I'm your On-Demand Psychologist. Managing isolation and heavy physical labor requires mental rest. How are you feeling today?",
  },
};

export default function ChatInterface({ activeAgent, environment, onOpenSettings, onMessageSent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
  const [rippleCount, setRippleCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset on agent/environment change
  useEffect(() => {
    const welcome = WELCOME_MESSAGES[activeAgent][environment];
    setMessages([{ id: Date.now().toString(), role: 'assistant', content: welcome }]);
    setConversationHistory([]);
    setAiStatus('idle');
  }, [activeAgent, environment]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callAI = async (history: { role: string; content: string }[]): Promise<string> => {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[activeAgent][environment];

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, systemPrompt }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiStatus === 'loading' || aiStatus === 'responding') return;

    const userText = input.trim();
    setInput('');

    // Add user message to UI
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    onMessageSent?.();

    // Build updated history
    const updatedHistory = [...conversationHistory, { role: 'user', content: userText }];
    setConversationHistory(updatedHistory);

    setAiStatus('loading');

    try {
      setAiStatus('responding');
      const reply = await callAI(updatedHistory);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: reply }]);
      setAiStatus('idle');
    } catch (err: unknown) {
      setAiStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${errorMessage}`,
      }]);
      setTimeout(() => setAiStatus('idle'), 2000);
    }
  };

  const charCount = input.length;
  const activeColor = environment === 'Rural' ? 'text-green-400' : 'text-blue-400';
  const activeBg = environment === 'Rural' ? 'bg-green-600' : 'bg-blue-600';
  const activeBorder = environment === 'Rural' ? 'border-green-500/40' : 'border-blue-500/40';
  const activeGlow = environment === 'Rural' ? 'bg-green-500' : 'bg-blue-500';
  const AGENT_COLORS: Record<AgentType, string> = {
    Trainer: '#3b82f6',
    Nutritionist: '#22c55e',
    Psychologist: '#8b5cf6',
  };
  const agentColor = AGENT_COLORS[activeAgent];
  const charColorClass = charCount > 490 ? 'text-rose-400' : charCount > 400 ? 'text-amber-400' : 'text-slate-400';
  const triggerRipple = () => setRippleCount((prev) => prev + 1);

  const modelBadge = () => {
    if (aiStatus === 'loading' || aiStatus === 'responding') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-medium animate-pulse">
          <Cpu size={12} className="animate-spin" style={{ animationDuration: '2s' }} />
          <span>Gemini · Google</span>
        </div>
      );
    }
    if (aiStatus === 'error') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium">
          <AlertTriangle size={12} />
          <span>Error</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600/40 text-slate-400 text-xs font-medium">
        <Cpu size={12} />
        <span>Gemini · Google</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full glass-panel border border-slate-700/50 shadow-2xl overflow-hidden relative">

      {/* Decorative Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-20 blur-[100px] pointer-events-none transition-colors duration-700 ${activeGlow}`} />

      {/* Chat Header */}
      <div className="h-16 border-b border-slate-700/50 flex items-center justify-between px-6 z-10 glass-card">
        <div className="flex items-center gap-3">
          <Sparkles className={activeColor} size={20} />
          <h2 className="font-semibold text-lg text-white">Chat with {activeAgent}</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Model Indicator Badge */}
          {modelBadge()}
          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Open Settings"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
              msg.role === 'assistant'
                ? `${activeBg} text-white`
                : 'bg-slate-700 text-slate-300'
            }`}>
              {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm animate-msg-appear ${
                msg.role === 'assistant'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : 'bg-slate-700/50 text-white border border-slate-600/50'
              }`}
              style={msg.role === 'assistant' ? { boxShadow: `inset 3px 0 0 ${agentColor}` } : undefined}
            >
              <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {(aiStatus === 'loading' || aiStatus === 'responding') && (
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${activeBg} text-white`}>
              <Bot size={20} />
            </div>
            <div className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-2">
              <span className="gradient-text-shimmer text-sm font-semibold">
                {activeAgent} is typing...
              </span>
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 glass-panel z-10 ${activeBorder}`}>
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={aiStatus === 'loading' || aiStatus === 'responding' ? 'Llama 3 is responding...' : `Ask your ${activeAgent}...`}
            disabled={aiStatus === 'loading' || aiStatus === 'responding'}
            className="w-full bg-slate-800 border border-slate-700 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            id="chat-send-btn"
            onClick={triggerRipple}
            disabled={aiStatus === 'loading' || aiStatus === 'responding' || !input.trim()}
            className={`relative overflow-hidden right-2 p-2 rounded-full text-white transition-all hover:scale-105 active:scale-95 ${activeBg} disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
          >
            <span key={rippleCount} className="ripple" />
            <Send size={18} />
          </button>
        </form>
        <div className="mt-2 text-right text-xs font-medium">
          <span className={charColorClass}>{charCount}</span>
          <span className="text-slate-500"> / 500</span>
        </div>
      </div>
    </div>
  );
}
