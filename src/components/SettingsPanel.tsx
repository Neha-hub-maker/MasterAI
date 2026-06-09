"use client";

import React, { useState, useEffect } from 'react';
import { X, Key, Save, CheckCircle, Eye, EyeOff, ExternalLink, Cpu } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('masterai_groq_key') || '';
      setGroqKey(stored);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (groqKey.trim()) {
      localStorage.setItem('masterai_groq_key', groqKey.trim());
    } else {
      localStorage.removeItem('masterai_groq_key');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 12) return key;
    return key.slice(0, 6) + '••••••••••••' + key.slice(-4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/60 glass-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30">
              <Cpu size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Configuration</h2>
              <p className="text-xs text-slate-400">Manage your AI provider API keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Groq Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <label className="text-sm font-semibold text-white">Groq API Key</label>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 font-medium">Active</span>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 transition-colors"
              >
                Get key <ExternalLink size={10} />
              </a>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Key size={16} />
              </div>
              <input
                id="groq-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_••••••••••••••••••••••••••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-12 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {groqKey && !showKey && (
              <p className="text-xs text-slate-500 pl-1">Stored: {maskKey(groqKey)}</p>
            )}

            {/* Info box */}
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-xs text-violet-300 leading-relaxed">
                <strong>Model:</strong> Llama 3.3 70B (llama-3.3-70b-versatile) via Groq Cloud.
                Your key is stored locally in your browser and never sent to any server other than Groq.
              </p>
            </div>
          </div>

          {/* Storage info */}
          <div className="glass-card p-3 rounded-xl">
            <p className="text-xs text-slate-500 text-center">
              🔒 Keys are stored in <code className="text-slate-400">localStorage</code> on your device only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            id="save-settings-btn"
            onClick={handleSave}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-600 text-white border border-green-500'
                : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500 hover:shadow-lg hover:shadow-violet-500/20'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle size={16} />
                Saved!
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
