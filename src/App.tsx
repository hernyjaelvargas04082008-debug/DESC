/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GeneratorView } from './components/GeneratorView';
import { SimulatorView } from './components/SimulatorView';
import { ChatView } from './components/ChatView';
import { GuideView } from './components/GuideView';
import { UserStats } from './types/desc';

const DEFAULT_STATS: UserStats = {
  casesCompleted: 0,
  totalScore: 0,
  highScore: 0,
  streak: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'simulator' | 'chat' | 'guide'>('generator');
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('desc_bot_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read stats from localStorage', e);
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('desc_bot_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('Could not save stats to localStorage', e);
    }
  }, [stats]);

  const handleUpdateStats = (newScore: number) => {
    setStats((prev) => {
      const isGood = newScore >= 3;
      return {
        casesCompleted: prev.casesCompleted + 1,
        totalScore: prev.totalScore + newScore,
        highScore: Math.max(prev.highScore, newScore),
        streak: isGood ? prev.streak + 1 : 0,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'generator' && (
          <GeneratorView onSwitchToPractice={() => setActiveTab('simulator')} />
        )}
        {activeTab === 'simulator' && (
          <SimulatorView stats={stats} onUpdateStats={handleUpdateStats} />
        )}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'guide' && <GuideView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">DESC Bot</span>
            <span>·</span>
            <span>Tutor de Comunicación Asertiva y Resolución de Conflictos</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('generator')}
              className="hover:text-indigo-400 transition"
            >
              Generador
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-indigo-400 transition"
            >
              Simulador
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="hover:text-indigo-400 transition"
            >
              Chat Tutor
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-indigo-400 transition"
            >
              Técnica DESC
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
