"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar, { AgentType } from '@/components/Sidebar';
import EnvironmentToggle from '@/components/EnvironmentToggle';
import ChatInterface from '@/components/ChatInterface';
import Auth from '@/components/Auth';
import OnboardingFlow from '@/components/OnboardingFlow';
import DashboardPanel from '@/components/DashboardPanel';
import ProfileStatsStrip from '@/components/ProfileStatsStrip';
import SettingsPanel from '@/components/SettingsPanel';

type AppState = 'LOADING' | 'AUTH' | 'ONBOARDING' | 'DASHBOARD';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('LOADING');
  const [environment, setEnvironment] = useState<'Rural' | 'City'>('City');
  const [activeAgent, setActiveAgent] = useState<AgentType>('Trainer');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatSignal, setChatSignal] = useState(0);

  useEffect(() => {
    checkSession();
  }, []);


  const checkSession = async (bypass: boolean = false) => {
    if (bypass) {
      setEnvironment('City');
      setAppState('DASHBOARD');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setAppState('AUTH');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('environment')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setEnvironment(profile.environment as 'Rural' | 'City');
      setAppState('DASHBOARD');
    } else {
      setAppState('ONBOARDING');
    }
  };

  if (appState === 'LOADING') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Loading Pocket Clinic...
      </div>
    );
  }

  if (appState === 'AUTH') {
    return <Auth onLogin={checkSession} />;
  }

  if (appState === 'ONBOARDING') {
    return <OnboardingFlow onComplete={() => checkSession(false)} />;
  }

  return (
    <>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className="flex h-screen overflow-hidden bg-[#0f172a] selection:bg-blue-500/30">
        <Sidebar
          activeAgent={activeAgent}
          setActiveAgent={setActiveAgent}
          environment={environment}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className="flex-1 flex flex-col h-full relative z-10">
          <ProfileStatsStrip />

          <div className="flex-1 flex flex-col relative">
            <EnvironmentToggle
              environment={environment}
              setEnvironment={setEnvironment}
            />

            <div className="flex-1 p-6 pt-2 pb-8 overflow-hidden">
              <ChatInterface
                activeAgent={activeAgent}
                environment={environment}
                onOpenSettings={() => setSettingsOpen(true)}
                onMessageSent={() => setChatSignal(prev => prev + 1)}
              />
            </div>
          </div>
        </div>

        <DashboardPanel activeAgent={activeAgent} chatSignal={chatSignal} />
      </main>
    </>
  );
}
