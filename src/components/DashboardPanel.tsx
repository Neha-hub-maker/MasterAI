"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { AgentType } from '@/components/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  AlertCircle, Zap, Activity, Droplets,
  Flame, Plus, X, Moon, Scale, TrendingUp,
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface FoodEntry { name: string; calories: number; time: string; }
interface SleepEntry { date: string; hours: number; mood: string; }
interface WeightEntry { date: string; weight: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en', { weekday: 'short' });
const timeToHours = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};
const calcSleepHours = (bed: string, wake: string): number => {
  let b = timeToHours(bed);
  let w = timeToHours(wake);
  if (w <= b) w += 24;
  return Math.round((w - b) * 10) / 10;
};
const getStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
};
const setStorage = (key: string, val: unknown) =>
  localStorage.setItem(key, JSON.stringify(val));
interface DashboardPanelProps {
  activeAgent: AgentType;
  chatSignal: number;
}
// ─── Day-of-week streak helper ────────────────────────────────────────────────
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const getDayIndex = () => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;   // Mon=0 … Sun=6
};

// ─── Calorie Card ─────────────────────────────────────────────────────────────
function CalorieCard() {
  const GOAL = 2000;
  const [entries, setEntries] = useState<FoodEntry[]>(() =>
    getStorage(`calories_${today()}`, []));
  const [modalOpen, setModalOpen] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [foodCals, setFoodCals] = useState('');

  const eaten = entries.reduce((s, e) => s + e.calories, 0);
  const remaining = GOAL - eaten;
  const pct = Math.min((eaten / GOAL) * 100, 100);

  const barColor =
    remaining > 500 ? '#22c55e' :
    remaining > 0   ? '#f97316' :
    '#ef4444';

  const addFood = () => {
    if (!foodName.trim() || !foodCals) return;
    const entry: FoodEntry = {
      name: foodName.trim(),
      calories: parseInt(foodCals),
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    const next = [...entries, entry];
    setEntries(next);
    setStorage(`calories_${today()}`, next);
    setFoodName(''); setFoodCals(''); setModalOpen(false);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          <h3 className="text-slate-300 font-semibold text-sm">Daily Calories</h3>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 transition-all font-medium"
        >
          <Plus size={12} /> Log Food
        </button>
      </div>

      {/* Big number */}
      <div className="text-center py-2">
        <p className="text-5xl font-black" style={{ color: barColor }}>
          {remaining > 0 ? remaining : Math.abs(remaining)}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {remaining > 0 ? 'kcal remaining' : 'kcal over limit'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Eaten: <span className="text-slate-300 font-semibold">{eaten} kcal</span></span>
          <span>Goal: <span className="text-slate-300 font-semibold">{GOAL} kcal</span></span>
        </div>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="space-y-1.5 max-h-24 overflow-y-auto hide-scrollbar">
          {[...entries].reverse().slice(0, 4).map((e, i) => (
            <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-slate-700/40">
              <span className="text-slate-300">{e.name}</span>
              <span className="text-orange-400 font-semibold">{e.calories} kcal</span>
            </div>
          ))}
        </div>
      )}

      {/* Log Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative glass-panel rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Flame size={16} className="text-orange-400" /> Log Food
              </h4>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Food / Meal name</label>
                <input
                  type="text" value={foodName} onChange={e => setFoodName(e.target.value)}
                  placeholder="e.g. Grilled Chicken"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/60"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Calories (kcal)</label>
                <input
                  type="number" value={foodCals} onChange={e => setFoodCals(e.target.value)}
                  placeholder="250"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>
            <button
              onClick={addFood}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition-all"
            >
              Add Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sleep Logger ─────────────────────────────────────────────────────────────
function SleepLogger() {
  const [history, setHistory] = useState<SleepEntry[]>(() =>
    getStorage('sleep_history', []));
  const [bedtime, setBedtime] = useState('22:30');
  const [waketime, setWaketime] = useState('06:30');
  const [mood, setMood] = useState('');
  const [saved, setSaved] = useState(false);

  const logSleep = () => {
    const hours = calcSleepHours(bedtime, waketime);
    const entry: SleepEntry = { date: today(), hours, mood };
    const next = [...history.filter(e => e.date !== today()), entry].slice(-7);
    setHistory(next); setStorage('sleep_history', next);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  // Build 7-day labels + data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const chartData = {
    labels: last7.map(dayLabel),
    datasets: [{
      label: 'Hours Slept',
      data: last7.map(d => history.find(e => e.date === d)?.hours ?? null),
      backgroundColor: (ctx: {dataIndex: number}) => {
        const h = last7.map(d => history.find(e => e.date === d)?.hours ?? 0);
        const v = h[ctx.dataIndex] ?? 0;
        return v >= 7 ? '#818cf8' : v >= 5 ? '#fb923c' : '#f87171';
      },
      borderRadius: 6,
    }],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: {raw: unknown}) => `${c.raw}h` } } },
    scales: {
      y: { min: 0, max: 12, grid: { color: '#1e293b' }, ticks: { color: '#64748b', stepSize: 3 } },
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
    },
  };

  const moods = [
    { emoji: '😊', label: 'Excellent', key: 'excellent' },
    { emoji: '😐', label: 'Calm', key: 'calm' },
    { emoji: '😴', label: 'Droopy', key: 'droopy' },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Moon size={16} className="text-indigo-400" />
        <h3 className="text-slate-300 font-semibold text-sm">Sleep Logger</h3>
      </div>

      {/* 7-day chart */}
      <div className="h-28">
        <Bar data={chartData} options={chartOptions as Parameters<typeof Bar>[0]['options']} />
      </div>

      {/* Time pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Bedtime</label>
          <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
            className="w-full bg-slate-700/60 border border-slate-600 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Wake time</label>
          <input type="time" value={waketime} onChange={e => setWaketime(e.target.value)}
            className="w-full bg-slate-700/60 border border-slate-600 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>

      {/* Calculated hours */}
      <div className="flex items-center justify-center gap-2 py-1">
        <span className="text-3xl font-black text-indigo-300">{calcSleepHours(bedtime, waketime)}h</span>
        <span className="text-xs text-slate-500">tonight&apos;s sleep</span>
      </div>

      {/* Mood selector */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Wake-up mood:</p>
        <div className="flex gap-2">
          {moods.map(m => (
            <button key={m.key} onClick={() => setMood(m.key)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl border text-xs transition-all ${
                mood === m.key
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className="mt-0.5">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={logSleep}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        }`}
      >
        {saved ? '✓ Saved!' : 'Log Sleep'}
      </button>
    </div>
  );
}

// ─── Wellness Streak ──────────────────────────────────────────────────────────
function WellnessStreak() {
  const [completedDays, setCompletedDays] = useState<number[]>(() =>
    getStorage('wellness_streak_days', []));
  const [streakCount, setStreakCount] = useState<number>(() =>
    getStorage('wellness_streak_count', 0));
  const todayIdx = getDayIndex();

  const toggleDay = (i: number) => {
    // Only allow marking today or in demo allow any
    let next: number[];
    if (completedDays.includes(i)) {
      next = completedDays.filter(d => d !== i);
    } else {
      next = [...completedDays, i];
    }
    setCompletedDays(next);
    setStorage('wellness_streak_days', next);

    // Recalculate streak (consecutive days ending today)
    let streak = 0;
    for (let d = todayIdx; d >= 0; d--) {
      if (next.includes(d)) streak++; else break;
    }
    setStreakCount(streak);
    setStorage('wellness_streak_count', streak);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <h3 className="text-slate-300 font-semibold text-sm">Wellness Streak</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-black text-amber-400">{streakCount}</span>
          <span className="text-xs text-slate-500">day{streakCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* 7 day circles */}
      <div className="flex justify-between items-center">
        {DAYS.map((d, i) => {
          const isToday = i === todayIdx;
          const done = completedDays.includes(i);
          return (
            <button
              key={i} onClick={() => toggleDay(i)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                done
                  ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30 scale-105'
                  : isToday
                    ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20'
                    : 'border-slate-600 text-slate-500 bg-slate-700/40 group-hover:border-slate-500'
              }`}>
                {done ? '✓' : d}
              </div>
              <span className={`text-[10px] ${isToday ? 'text-amber-400 font-bold' : 'text-slate-600'}`}>
                {d}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-600">
        Tap a day to mark it complete · Today is highlighted
      </p>
    </div>
  );
}

// ─── Weight Tracker ───────────────────────────────────────────────────────────
function WeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>(() =>
    getStorage('weight_history', []));
  const [inputWeight, setInputWeight] = useState('');
  const [saved, setSaved] = useState(false);

  const logWeight = () => {
    const w = parseFloat(inputWeight);
    if (!w || w < 20 || w > 300) return;
    const entry: WeightEntry = { date: today(), weight: w };
    const next = [...entries.filter(e => e.date !== today()), entry]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
    setEntries(next); setStorage('weight_history', next);
    setInputWeight(''); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const delta = latest && prev ? latest.weight - prev.weight : null;

  const chartData = {
    labels: entries.map(e => dayLabel(e.date)),
    datasets: [{
      label: 'kg',
      data: entries.map(e => e.weight),
      borderColor: '#34d399',
      backgroundColor: 'rgba(52,211,153,0.1)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#34d399',
    }],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        grid: { color: '#1e293b' }, ticks: { color: '#64748b' },
        ...(entries.length > 0 ? {
          min: Math.floor(Math.min(...entries.map(e => e.weight)) - 2),
          max: Math.ceil(Math.max(...entries.map(e => e.weight)) + 2),
        } : {}),
      },
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
    },
  };

  return (
    <div className="glass-panel rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Scale size={16} className="text-emerald-400" />
        <h3 className="text-slate-300 font-semibold text-sm">Weight Tracker</h3>
      </div>

      {/* Big current weight */}
      {latest ? (
        <div className="flex items-end justify-between">
          <div>
            <span className="text-4xl font-black text-emerald-300">{latest.weight}</span>
            <span className="text-emerald-400 font-semibold ml-1">kg</span>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(latest.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          {delta !== null && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${delta > 0 ? 'text-red-400' : delta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              <TrendingUp size={14} className={delta < 0 ? 'rotate-180' : ''} />
              {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-slate-600 text-sm py-2">No entries yet — log your first!</p>
      )}

      {/* Chart */}
      {entries.length > 1 && (
        <div className="h-28">
          <Line data={chartData} options={chartOptions as Parameters<typeof Line>[0]['options']} />
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="number" step="0.1" value={inputWeight}
          onChange={e => setInputWeight(e.target.value)}
          placeholder="Today's weight (kg)"
          className="flex-1 bg-slate-700/60 border border-slate-600 rounded-xl py-2.5 px-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
        />
        <button onClick={logWeight}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            saved ? 'bg-green-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {saved ? '✓' : 'Log'}
        </button>
      </div>
    </div>
  );
}

// ─── Main DashboardPanel ──────────────────────────────────────────────────────
export default function DashboardPanel({ activeAgent, chatSignal }: DashboardPanelProps) {
  const [wellnessScore, setWellnessScore] = useState(72);
  const [showSynthesisBanner, setShowSynthesisBanner] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);
  // Track individual check-in row selections
  const [energyMood, setEnergyMood] = useState('');
  const [stressMood, setStressMood] = useState('');
  const [waterDone, setWaterDone] = useState<boolean | null>(null);
  const interactionStatus = chatSignal > 0
    ? `New chat updates from ${activeAgent}`
    : `No new interactions for ${activeAgent}`;

  const AGENT_COLORS: Record<AgentType, string> = {
    Trainer: '#3b82f6',
    Nutritionist: '#22c55e',
    Psychologist: '#8b5cf6',
  };
  const agentColor = AGENT_COLORS[activeAgent];

  const wellnessData = {
    datasets: [{
      data: [wellnessScore, 100 - wellnessScore],
      backgroundColor: ['#3b82f6', '#1e293b'],
      borderWidth: 0, cutout: '80%', circumference: 360,
    }],
  };

  // Psychologist bar gets brighter when synthesis fires
  const activityData = {
    labels: ['Trainer', 'Nutritionist', 'Psychologist'],
    datasets: [{
      label: 'Interactions this week',
      data: [12, 19, 5],
      backgroundColor: [
        '#ef4444',
        '#22c55e',
        showSynthesisBanner ? '#e879f9' : '#a855f7',
      ],
      borderRadius: 6,
    }],
  };
  const activityOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false, grid: { display: false } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  const stressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Stress Level',
      data: [6, 7, 5, 4, 8, 3, 2],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.1)',
      borderWidth: 2.5, tension: 0.4, fill: true,
      pointRadius: 4, pointBackgroundColor: '#f59e0b',
    }],
  };
  const stressOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 10, grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  const handleCheckIn = (stressLevel: 'low' | 'med' | 'high') => {
    setStressMood(stressLevel);
    setCheckInDone(true);
    setWellnessScore(prev => Math.min(prev + 5, 100));
    if (stressLevel === 'high') setShowSynthesisBanner(true);
  };

  const handleReset = () => {
    setCheckInDone(false);
    setEnergyMood('');
    setStressMood('');
    setWaterDone(null);
    setShowSynthesisBanner(false);
  };

  return (
    <div className="w-96 h-full glass-panel border-l overflow-y-auto p-5 space-y-5 flex flex-col hide-scrollbar" style={showSynthesisBanner ? { animation: 'dashboardFlash 0.6s ease-out' } : undefined}>
      <div className="flex items-center justify-between gap-3 rounded-3xl glass-panel p-3 text-slate-300 text-sm">
        <span>Active agent: <strong className="text-white">{activeAgent}</strong></span>
        <span className="rounded-full bg-slate-700/70 px-3 py-1 text-xs text-slate-300">
          {interactionStatus}
        </span>
      </div>

      {/* Synthesis Banner — animated gradient border */}
      {showSynthesisBanner && (
        <div className="synthesis-animated-border synthesis-slide-down bg-amber-500/20 p-4 rounded-2xl shadow-lg shadow-amber-500/10 relative" style={{ borderColor: 'transparent' }}>
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
            borderRadius: '1rem',
            backgroundImage: `conic-gradient(#f59e0b, #ff6b1b, #f59e0b)`,
            opacity: 0.5,
            padding: '1px',
            animation: 'borderGradientCycle 2s linear infinite'
          }} />
          <div className="relative bg-amber-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-amber-400 font-bold text-sm">⚡ Synthesis Triggered</h4>
                  <button
                    onClick={() => setShowSynthesisBanner(false)}
                    className="text-amber-500/60 hover:text-amber-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
                  Your Psychologist has notified your Trainer — today&apos;s workout has been adjusted to restorative stretching.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget 1 — Wellness Score Ring */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col items-center fade-slide-up" style={{ animationDelay: '0ms' }}>
        <h3 className="text-slate-400 font-medium text-sm w-full text-left mb-4">Today&apos;s Wellness</h3>
        <div className="w-36 h-36 relative">
          <div className="absolute inset-0 rounded-full" style={{
            background: `radial-gradient(circle, ${agentColor}00 0%, ${agentColor}26 100%)`,
            opacity: 0.15,
            animation: 'wellnessGlowPulse 3s ease-in-out infinite'
          }} />
          <Doughnut data={wellnessData} options={{ maintainAspectRatio: true, plugins: { tooltip: { enabled: false } } }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{wellnessScore}</span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Score</span>
          </div>
        </div>
      </div>

      {/* Widget NEW — Daily Calorie Card */}
      <div className="fade-slide-up" style={{ animationDelay: '100ms' }}>
        <CalorieCard />
      </div>

      {/* Widget NEW — Sleep Logger */}
      <div className="fade-slide-up" style={{ animationDelay: '200ms' }}>
        <SleepLogger />
      </div>

      {/* Widget NEW — Wellness Streak */}
      <div className="fade-slide-up" style={{ animationDelay: '300ms' }}>
        <WellnessStreak />
      </div>

      {/* Widget NEW — Weight Tracker */}
      <WeightTracker />

      {/* Widget — Daily Check-In */}
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 font-medium text-sm">Daily Check-In</h3>
          {checkInDone && (
            <button
              onClick={handleReset}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600/60 text-slate-400 hover:text-white hover:border-slate-500 transition-all font-medium"
            >
              ↺ Reset
            </button>
          )}
        </div>
        {!checkInDone ? (
          <div className="space-y-4">
            {/* Energy row */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Energy</span>
              <div className="flex gap-1.5">
                {(['tired','neutral','high'] as const).map((k, i) => {
                  const emojis = ['😴','😐','⚡'];
                  return (
                    <button
                      key={k}
                      onClick={() => setEnergyMood(k)}
                      className={`text-xl transition-all duration-150 rounded-lg p-1 hover-emoji-bounce ${
                        energyMood === k
                          ? 'scale-125 bg-yellow-500/20 ring-2 ring-yellow-500/50'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={energyMood !== k ? { transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } : undefined}
                    >
                      {emojis[i]}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Stress row */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300 flex items-center gap-2"><Activity size={14} className="text-rose-400" /> Stress</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleCheckIn('high')}
                  className={`text-xl transition-all duration-150 rounded-lg p-1 hover-emoji-bounce ${
                    stressMood === 'high'
                      ? 'scale-125 bg-red-500/20 ring-2 ring-red-500/50'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={stressMood !== 'high' ? { transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } : undefined}
                >😰</button>
                <button
                  onClick={() => handleCheckIn('med')}
                  className={`text-xl transition-all duration-150 rounded-lg p-1 hover-emoji-bounce ${
                    stressMood === 'med'
                      ? 'scale-125 bg-slate-500/30 ring-2 ring-slate-400/50'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={stressMood !== 'med' ? { transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } : undefined}
                >😐</button>
                <button
                  onClick={() => handleCheckIn('low')}
                  className={`text-xl transition-all duration-150 rounded-lg p-1 hover-emoji-bounce ${
                    stressMood === 'low'
                      ? 'scale-125 bg-green-500/20 ring-2 ring-green-500/50'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={stressMood !== 'low' ? { transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } : undefined}
                >😌</button>
              </div>
            </div>
            {/* Water row */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300 flex items-center gap-2"><Droplets size={14} className="text-cyan-400" /> Water</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setWaterDone(true)}
                  className={`text-xl transition-all duration-150 rounded-lg p-1 hover-emoji-bounce ${
                    waterDone === true
                      ? 'scale-125 bg-cyan-500/20 ring-2 ring-cyan-500/50'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={waterDone !== true ? { transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } : undefined}
                >✅</button>
                <button
                  onClick={() => setWaterDone(false)}
                  className={`text-xl transition-all duration-150 rounded-lg p-1 hover-emoji-bounce ${
                    waterDone === false
                      ? 'scale-125 bg-red-500/20 ring-2 ring-red-500/50'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={waterDone !== false ? { transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } : undefined}
                >❌</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <div className="text-4xl mb-1">🎉</div>
            <p className="text-green-400 font-medium text-sm">Check-in complete!</p>
            <div className="flex justify-center gap-3 mt-2 text-lg">
              {energyMood === 'tired' && <span title="Tired">😴</span>}
              {energyMood === 'neutral' && <span title="Neutral">😐</span>}
              {energyMood === 'high' && <span title="Energetic">⚡</span>}
              {stressMood === 'high' && <span title="High stress">😰</span>}
              {stressMood === 'med' && <span title="Moderate">😐</span>}
              {stressMood === 'low' && <span title="Low stress">😌</span>}
              {waterDone === true && <span title="Hydrated">💧</span>}
              {waterDone === false && <span title="Not hydrated">🏜️</span>}
            </div>
            <p className="text-slate-500 text-xs">Wellness score +5 pts</p>
          </div>
        )}
      </div>

      {/* Widget — Agent Activity */}
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 font-medium text-sm">Agent Interactions</h3>
          {showSynthesisBanner && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-medium animate-pulse">
              Psychologist Active
            </span>
          )}
        </div>
        {/* psych-pulse wrapper glows purple when synthesis fires */}
        <div className={`h-28 rounded-xl transition-all duration-500 ${
          showSynthesisBanner ? 'psych-pulse' : ''
        }`}>
          <Bar data={activityData} options={activityOptions as Parameters<typeof Bar>[0]['options']} />
        </div>
      </div>

      {/* Widget — Stress History */}
      <div className="glass-panel rounded-3xl p-5">
        <h3 className="text-slate-400 font-medium text-sm mb-4">Stress History</h3>
        <div className="h-28">
          <Line data={stressData} options={stressOptions as Parameters<typeof Line>[0]['options']} />
        </div>
      </div>

    </div>
  );
}
