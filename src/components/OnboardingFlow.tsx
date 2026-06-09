"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (env: 'City' | 'Rural') => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    full_name: '',
    age: '',
    biological_sex: 'Prefer not to say',
    height_cm: '',
    weight_kg: '',
    environment: 'City',
    // Step 2
    primary_goal: 'General wellness',
    activity_level: 'Moderately active',
    health_conditions: [] as string[],
    sleep_hours: 7,
    water_intake_liters: 2,
    // Step 3
    work_type: 'Desk job',
    stress_level: 5,
    diet_type: 'No preference',
    smokes_or_drinks: false,
    fitness_experience: 'Beginner',
  });

  const handleConditionToggle = (condition: string) => {
    if (condition === 'None') {
      setFormData(prev => ({ ...prev, health_conditions: ['None'] }));
      return;
    }
    
    setFormData(prev => {
      const current = prev.health_conditions.filter(c => c !== 'None');
      if (current.includes(condition)) {
        return { ...prev, health_conditions: current.filter(c => c !== condition) };
      }
      return { ...prev, health_conditions: [...current, condition] };
    });
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: formData.full_name,
        age: parseInt(formData.age),
        biological_sex: formData.biological_sex,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        environment: formData.environment,
        primary_goal: formData.primary_goal,
        activity_level: formData.activity_level,
        health_conditions: formData.health_conditions,
        sleep_hours: formData.sleep_hours,
        water_intake_liters: formData.water_intake_liters,
        work_type: formData.work_type,
        stress_level: formData.stress_level,
        diet_type: formData.diet_type,
        smokes_or_drinks: formData.smokes_or_drinks,
        fitness_experience: formData.fitness_experience
      });

      if (error) throw error;

      onComplete(formData.environment as 'City' | 'Rural');
    } catch (error: any) {
      alert("Error saving profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        
        {/* Progress Bar */}
        <div className="flex items-center mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map(i => (
            <div key={i} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
              step >= i ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500'
            } ${i === 1 ? 'mr-auto' : i === 3 ? 'ml-auto' : 'mx-auto'}`}>
              {step > i ? <CheckCircle2 size={16} /> : i}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {/* Step 1: Basic Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-6">Step 1: Basic Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Biological Sex</label>
                  <select value={formData.biological_sex} onChange={e => setFormData({...formData, biological_sex: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white">
                    <option>Male</option><option>Female</option><option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Height (cm)</label>
                  <input type="number" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Weight (kg)</label>
                  <input type="number" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-slate-400 mb-2 block">Environment</label>
                  <div className="flex gap-4">
                    {['City', 'Rural'].map(env => (
                      <button key={env} onClick={() => setFormData({...formData, environment: env})} className={`flex-1 py-3 rounded-xl border transition-all ${formData.environment === env ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        {env}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Health Baseline */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-6">Step 2: Health Baseline</h2>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Primary Health Goal</label>
                <select value={formData.primary_goal} onChange={e => setFormData({...formData, primary_goal: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white">
                  {['Lose weight', 'Build strength', 'Improve focus', 'Reduce stress', 'General wellness'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Activity Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Sedentary', 'Lightly active', 'Moderately active', 'Very active'].map(lvl => (
                    <button key={lvl} onClick={() => setFormData({...formData, activity_level: lvl})} className={`py-2 rounded-xl border text-sm transition-all ${formData.activity_level === lvl ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Health Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {['Diabetes', 'Hypertension', 'Back pain', 'None'].map(cond => (
                    <button key={cond} onClick={() => handleConditionToggle(cond)} className={`px-4 py-2 rounded-full border text-sm transition-all ${formData.health_conditions.includes(cond) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 flex justify-between">Sleep: <span>{formData.sleep_hours} hrs</span></label>
                  <input type="range" min="4" max="10" step="0.5" value={formData.sleep_hours} onChange={e => setFormData({...formData, sleep_hours: parseFloat(e.target.value)})} className="w-full accent-blue-500" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 flex justify-between">Water: <span>{formData.water_intake_liters} L</span></label>
                  <input type="range" min="0" max="4" step="0.5" value={formData.water_intake_liters} onChange={e => setFormData({...formData, water_intake_liters: parseFloat(e.target.value)})} className="w-full accent-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle Snapshot */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-6">Step 3: Lifestyle Snapshot</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Work Type</label>
                  <select value={formData.work_type} onChange={e => setFormData({...formData, work_type: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white">
                    {['Desk job', 'Field/manual work', 'Mixed', 'Student'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Diet Type</label>
                  <select value={formData.diet_type} onChange={e => setFormData({...formData, diet_type: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white">
                    {['Omnivore', 'Vegetarian', 'Vegan', 'No preference'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Fitness Experience</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(exp => (
                    <button key={exp} onClick={() => setFormData({...formData, fitness_experience: exp})} className={`flex-1 py-2 rounded-xl border text-sm transition-all ${formData.fitness_experience === exp ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 flex justify-between">Stress Level: <span>{formData.stress_level}/10</span></label>
                <input type="range" min="1" max="10" value={formData.stress_level} onChange={e => setFormData({...formData, stress_level: parseInt(e.target.value)})} className="w-full accent-blue-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700 mt-4">
                <span className="text-slate-300 font-medium">Do you smoke or drink?</span>
                <div className="flex gap-2">
                  <button onClick={() => setFormData({...formData, smokes_or_drinks: true})} className={`px-4 py-1.5 rounded-lg border text-sm ${formData.smokes_or_drinks ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Yes</button>
                  <button onClick={() => setFormData({...formData, smokes_or_drinks: false})} className={`px-4 py-1.5 rounded-lg border text-sm ${!formData.smokes_or_drinks ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>No</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-between">
          {step > 1 ? (
            <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={18} /> Back
            </button>
          ) : <div />}
          
          {step < 3 ? (
            <button onClick={handleNext} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg shadow-green-600/30">
              {loading ? 'Saving...' : 'Launch Pocket Clinic'} <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
