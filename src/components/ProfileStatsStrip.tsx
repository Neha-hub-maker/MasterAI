"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  full_name?: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  primary_goal?: string | null;
}

export default function ProfileStatsStrip() {
  const defaultProfile: Profile = {
    full_name: null,
    age: 28,
    height_cm: 175,
    weight_kg: 70,
    primary_goal: 'Improve focus',
  };

  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name,age,height_cm,weight_kg,primary_goal')
          .eq('id', userData.user.id)
          .single();

        if (error || !data) {
          return;
        }

        if (mounted) setProfile(data);
      } catch (e) {
        // Silent fallback — dev mode bypass active
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const calcBMI = (weightKg?: number | null, heightCm?: number | null) => {
    if (!weightKg || !heightCm) return null;
    const h = heightCm / 100;
    if (h <= 0) return null;
    return (weightKg / (h * h)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="w-full h-14 glass-panel border-b border-slate-700/50 flex items-center justify-center gap-8 px-6 z-20">
        <div className="flex gap-4 items-center w-full justify-center animate-pulse">
          <div className="h-4 w-12 bg-slate-800 rounded" />
          <div className="w-px h-4 bg-slate-700" />
          <div className="h-4 w-16 bg-slate-800 rounded" />
          <div className="w-px h-4 bg-slate-700" />
          <div className="h-4 w-14 bg-slate-800 rounded" />
          <div className="w-px h-4 bg-slate-700" />
          <div className="h-4 w-10 bg-slate-800 rounded" />
          <div className="w-px h-4 bg-slate-700" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  const age = profile?.age ?? '—';
  const height = profile?.height_cm ?? '—';
  const weight = profile?.weight_kg ?? '—';
  const goal = profile?.primary_goal ?? '—';
  const bmi = calcBMI(profile?.weight_kg ?? undefined, profile?.height_cm ?? undefined) ?? '—';

  return (
    <div className="w-full h-14 glass-panel border-b border-slate-700/50 flex items-center justify-center gap-8 px-6 z-20">
      <div className="flex gap-2 items-center">
        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Age</span>
        <span className="text-white font-medium">{age}</span>
      </div>
      <div className="w-px h-4 bg-slate-700"></div>

      <div className="flex gap-2 items-center">
        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Height</span>
        <span className="text-white font-medium">{typeof height === 'number' ? `${height}cm` : height}</span>
      </div>
      <div className="w-px h-4 bg-slate-700"></div>

      <div className="flex gap-2 items-center">
        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Weight</span>
        <span className="text-white font-medium">{typeof weight === 'number' ? `${weight}kg` : weight}</span>
      </div>
      <div className="w-px h-4 bg-slate-700"></div>

      <div className="flex gap-2 items-center">
        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">BMI</span>
        <span className="text-blue-400 font-bold">{bmi}</span>
      </div>
      <div className="w-px h-4 bg-slate-700"></div>

      <div className="flex gap-2 items-center">
        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Primary Goal</span>
        <span className="text-green-400 font-medium px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">{goal}</span>
      </div>
    </div>
  );
}
