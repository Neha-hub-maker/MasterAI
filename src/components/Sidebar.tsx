import React, { useEffect, useState } from 'react';
import { Dumbbell, Apple, BrainCircuit, Stethoscope, Settings } from 'lucide-react';

export type AgentType = 'Trainer' | 'Nutritionist' | 'Psychologist';

interface SidebarProps {
  activeAgent: AgentType;
  setActiveAgent: (agent: AgentType) => void;
  environment: 'Rural' | 'City';
  onOpenSettings: () => void;
}

export default function Sidebar({ activeAgent, setActiveAgent, environment, onOpenSettings }: SidebarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const agents = [
    { id: 'Trainer', icon: Dumbbell, label: 'Virtual Trainer', desc: 'Adaptive Biomechanics', color: '#3b82f6' },
    { id: 'Nutritionist', icon: Apple, label: 'Digital Nutritionist', desc: 'Smart Food & Micro-Kcal', color: '#22c55e' },
    { id: 'Psychologist', icon: BrainCircuit, label: 'On-Demand Psychologist', desc: 'Mindfulness & Focus', color: '#8b5cf6' },
  ];

  // Glow color based on environment
  const activeColor = environment === 'Rural' ? 'text-green-400' : 'text-blue-400';
  const activeBg = environment === 'Rural' ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30';

  return (
    <aside className="w-80 h-screen glass-panel border-r flex flex-col pt-8 pb-4 overflow-hidden">
      <div className="px-6 mb-10 flex items-center gap-4">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full">
          <div className="logo-mark w-12 h-12 rounded-full" />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Master AI</h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">The Pocket Clinic</p>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-3">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;
          const glowStyle = isActive
            ? { boxShadow: `0 0 60px ${agent.color}14` }
            : undefined;

          return (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id as AgentType)}
              style={glowStyle}
              className={`relative w-full flex items-start gap-4 p-4 rounded-xl transition-all duration-300 text-left border border-transparent overflow-hidden ${
                isActive 
                  ? `${activeBg} shadow-sm` 
                  : 'hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <span
                className={`absolute left-0 top-0 h-full rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                style={{ width: 3, backgroundColor: agent.color }}
              />
              <div className={`mt-1 transition-colors ${isActive ? activeColor : 'text-slate-500'}`}>
                <Icon size={24} />
              </div>
              <div className="pl-3">
                <h3 className={`font-semibold transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {agent.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{agent.desc}</p>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-6">
        <div className="h-px w-full overflow-hidden mb-4">
          <div
            className="h-px w-full animate-gradient-slide"
            style={{ background: `linear-gradient(90deg, transparent, ${activeAgent === 'Nutritionist' ? '#22c55e' : activeAgent === 'Psychologist' ? '#8b5cf6' : '#3b82f6'}, transparent)` }}
          />
        </div>

        <div className="glass-panel p-4 rounded-xl mb-3">
          <p className="text-xs text-slate-500 font-mono tracking-wide">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </p>
          <p className="text-[10px] uppercase text-slate-500 mt-1">Live clock</p>
        </div>

        <button
          id="open-settings-btn"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 border border-transparent hover:border-slate-600/50 transition-all text-sm font-medium"
        >
          <Settings size={16} />
          <span>AI Settings</span>
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">Groq</span>
        </button>
      </div>
    </aside>
  );
}
