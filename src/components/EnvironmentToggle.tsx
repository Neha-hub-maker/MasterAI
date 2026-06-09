import React from 'react';
import { Leaf, Building2 } from 'lucide-react';

interface EnvironmentToggleProps {
  environment: 'Rural' | 'City';
  setEnvironment: (env: 'Rural' | 'City') => void;
}

export default function EnvironmentToggle({ environment, setEnvironment }: EnvironmentToggleProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="glass-panel rounded-full p-1 flex items-center shadow-lg relative w-64 h-12">
        {/* Animated Background Pill */}
        <div 
          className={`absolute h-10 rounded-full transition-all duration-500 ease-out z-0 ${
            environment === 'Rural' 
              ? 'w-[calc(50%-4px)] left-1 bg-green-600/80 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
              : 'w-[calc(50%-4px)] left-[calc(50%+2px)] bg-blue-600/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
          }`}
        />

        {/* Rural Button */}
        <button
          onClick={() => setEnvironment('Rural')}
          className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 font-medium ${
            environment === 'Rural' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Leaf size={18} />
          Rural
        </button>

        {/* City Button */}
        <button
          onClick={() => setEnvironment('City')}
          className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 font-medium ${
            environment === 'City' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 size={18} />
          City
        </button>
      </div>
    </div>
  );
}
