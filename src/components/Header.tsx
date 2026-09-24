import React from 'react';
import { Bot, Sparkles, Target, MessageSquare, BookOpen, Flame, Star, ShieldCheck } from 'lucide-react';
import { UserStats } from '../types/desc';

interface HeaderProps {
  activeTab: 'generator' | 'simulator' | 'chat' | 'guide';
  setActiveTab: (tab: 'generator' | 'simulator' | 'chat' | 'guide') => void;
  stats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, stats }) => {
  const averageStars = stats.casesCompleted > 0 ? (stats.totalScore / stats.casesCompleted).toFixed(1) : '5.0';

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
                  DESC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Bot</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Tutor Asertivo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Describir · Expresar · Sugerir · Consecuencias
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generador DESC
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Simulador de Casos
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Tutor
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Técnica DESC
            </button>
          </nav>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold" title="Puntaje promedio de práctica">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{averageStars}</span>
              </div>
              <div className="h-3 w-px bg-slate-800 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-semibold" title="Racha de asertividad">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>{stats.streak} racha</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between pb-3 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generador
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Simulador
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Guía
          </button>
        </div>
      </div>
    </header>
  );
};
