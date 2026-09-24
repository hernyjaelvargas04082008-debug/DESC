import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  Award,
  Layers,
  FileEdit,
  Check,
  Copy,
} from 'lucide-react';
import { PracticeCase, PracticeEvaluation, UserStats } from '../types/desc';
import { INITIAL_CASES } from '../data/presetCases';
import { triggerAssertiveCelebration } from '../utils/confetti';
import { evaluateLocally, getRandomPresetCase } from '../utils/descEngine';

interface SimulatorViewProps {
  stats: UserStats;
  onUpdateStats: (newScore: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ stats, onUpdateStats }) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [casesList, setCasesList] = useState<PracticeCase[]>(INITIAL_CASES);
  const currentCase = casesList[currentCaseIndex] || INITIAL_CASES[0];

  const [inputMode, setInputMode] = useState<'free' | 'guided'>('guided');
  const [freeText, setFreeText] = useState('');
  const [guidedD, setGuidedD] = useState('');
  const [guidedE, setGuidedE] = useState('');
  const [guidedS, setGuidedS] = useState('');
  const [guidedC, setGuidedC] = useState('');

  const [showTrapHint, setShowTrapHint] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingCase, setIsGeneratingCase] = useState(false);
  const [evaluation, setEvaluation] = useState<PracticeEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIdeal, setCopiedIdeal] = useState(false);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isSubmissionEmpty =
      inputMode === 'free'
        ? !freeText.trim()
        : !guidedD.trim() && !guidedE.trim() && !guidedS.trim() && !guidedC.trim();

    if (isSubmissionEmpty) {
      setErrorMessage('Por favor escribe tu respuesta antes de solicitar la evaluación.');
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);

    const userResponse =
      inputMode === 'free'
        ? freeText
        : `D (Describir): ${guidedD}\nE (Expresar): ${guidedE}\nS (Sugerir): ${guidedS}\nC (Consecuencias): ${guidedC}`;

    try {
      const response = await fetch('/api/desc/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casePrompt: `${currentCase.titulo}: ${currentCase.descripcionCaso}`,
          userResponse,
          breakdown: {
            d: guidedD,
            e: guidedE,
            s: guidedS,
            c: guidedC,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al evaluar la respuesta en el servidor.');
      }

      const evalData: PracticeEvaluation = await response.json();
      setEvaluation(evalData);
      onUpdateStats(evalData.puntajeGlobal);

      if (evalData.puntajeGlobal >= 4) {
        triggerAssertiveCelebration();
      }
    } catch (err: any) {
      console.warn('Backend evaluador no disponible, aplicando evaluación local inteligente:', err);
      const localEval = evaluateLocally(
        `${currentCase.titulo}: ${currentCase.descripcionCaso}`,
        userResponse,
        { d: guidedD, e: guidedE, s: guidedS, c: guidedC }
      );
      setEvaluation(localEval);
      onUpdateStats(localEval.puntajeGlobal);

      if (localEval.puntajeGlobal >= 4) {
        triggerAssertiveCelebration();
      }
    } finally {
      setIsEvaluating(false);
      // Smooth scroll to evaluation container
      setTimeout(() => {
        const el = document.getElementById('evaluation-result-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleNextCase = () => {
    setEvaluation(null);
    setFreeText('');
    setGuidedD('');
    setGuidedE('');
    setGuidedS('');
    setGuidedC('');
    setShowTrapHint(false);
    setErrorMessage(null);

    if (currentCaseIndex < casesList.length - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
    } else {
      setCurrentCaseIndex(0);
    }
  };

  const handleAdjustResponse = () => {
    setEvaluation(null);
    const inputCard = document.getElementById('practice-input-section');
    if (inputCard) {
      inputCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleGenerateNewAiCase = async () => {
    setIsGeneratingCase(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/desc/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Ámbito universitario y proyectos grupales',
          difficulty: 'medio',
        }),
      });

      if (!response.ok) throw new Error('No se pudo generar el caso nuevo.');

      const newCase: PracticeCase = await response.json();
      setCasesList((prev) => [newCase, ...prev]);
      setCurrentCaseIndex(0);
      setEvaluation(null);
      setFreeText('');
      setGuidedD('');
      setGuidedE('');
      setGuidedS('');
      setGuidedC('');
      setShowTrapHint(false);
    } catch (err: any) {
      console.warn('API de generación de casos no disponible, seleccionando caso de práctica:', err);
      const preset = getRandomPresetCase();
      // create variation with fresh id
      const randomizedCase: PracticeCase = {
        ...preset,
        id: `case-random-${Date.now()}`,
      };
      setCasesList((prev) => [randomizedCase, ...prev]);
      setCurrentCaseIndex(0);
      setEvaluation(null);
      setFreeText('');
      setGuidedD('');
      setGuidedE('');
      setGuidedS('');
      setGuidedC('');
      setShowTrapHint(false);
    } finally {
      setIsGeneratingCase(false);
    }
  };

  const copyIdealText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdeal(true);
    setTimeout(() => setCopiedIdeal(false), 2000);
  };

  const renderStatusBadge = (status: 'excelente' | 'bueno' | 'a_mejorar') => {
    switch (status) {
      case 'excelente':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Excelente
          </span>
        );
      case 'bueno':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Bueno
          </span>
        );
      case 'a_mejorar':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            A mejorar
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          Modo 2: Simulador de Entrenamiento y Rúbrica
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Entrena tu asertividad en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">casos reales universitarios</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Lee el caso, redacta tu respuesta con la Técnica DESC y recibe retroalimentación minuciosa paso a paso con puntaje de 1 a 5 estrellas ⭐.
        </p>
      </div>

      {/* Case Navigation & Generation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Caso {currentCaseIndex + 1} de {casesList.length}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
            {currentCase.categoria}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateNewAiCase}
            disabled={isGeneratingCase}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500/40 transition-all flex items-center gap-1.5"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isGeneratingCase ? 'animate-spin' : ''}`} />
            {isGeneratingCase ? 'Generando...' : 'Generar Caso Nuevo (IA)'}
          </button>

          <button
            onClick={handleNextCase}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1"
          >
            <span>Siguiente Caso</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The Case Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 sm:p-6 border-b border-slate-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{currentCase.titulo}</span>
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                currentCase.dificultad === 'facil'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : currentCase.dificultad === 'medio'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              Nivel {currentCase.dificultad}
            </span>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/70">
            {currentCase.descripcionCaso}
          </p>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <strong className="text-slate-300">Personajes:</strong> {currentCase.personajes}
          </div>
        </div>

        {/* Collapsible Trap Hint */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTrapHint(!showTrapHint)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition"
            >
              {showTrapHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showTrapHint ? 'Ocultar trampa común' : 'Ver la trampa común de este caso'}</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">(¿Qué evitarías hacer?)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Recuerda: <strong>D</strong> (Hechos) · <strong>E</strong> (Sentimientos) · <strong>S</strong> (Propuesta) · <strong>C</strong> (Win-Win)</span>
          </div>
        </div>

        {showTrapHint && (
          <div className="p-4 bg-amber-500/5 border-b border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200">La trampa común en este escenario:</strong>{' '}
              {currentCase.trampaComun}
            </div>
          </div>
        )}

        {/* User Input Section */}
        <div id="practice-input-section" className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tu respuesta para este caso:
            </label>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setInputMode('guided')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  inputMode === 'guided'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Guiado (D-E-S-C)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('free')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  inputMode === 'free'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                Redacción Libre
              </button>
            </div>
          </div>

          {inputMode === 'guided' ? (
            <div className="space-y-3">
              {/* D */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 focus-within:border-sky-500 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">
                      D
                    </span>
                    1. Describir (Hechos observables, fechas, datos sin juicios):
                  </span>
                </div>
                <input
                  type="text"
                  value={guidedD}
                  onChange={(e) => setGuidedD(e.target.value)}
                  placeholder="Ej: Acordamos entregar el avance el martes a las 18:00 y aún no figura tu documento en el Drive..."
                  className="w-full bg-transparent text-slate-100 placeholder-slate-600 text-xs sm:text-sm outline-none"
                />
              </div>

              {/* E */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 focus-within:border-indigo-500 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                      E
                    </span>
                    2. Expresar (Impacto personal o grupal en primera persona "Yo"):
                  </span>
                </div>
                <input
                  type="text"
                  value={guidedE}
                  onChange={(e) => setGuidedE(e.target.value)}
                  placeholder="Ej: Me genera preocupación e incertidumbre porque el plazo final vence en pocas horas y no podemos revisar..."
                  className="w-full bg-transparent text-slate-100 placeholder-slate-600 text-xs sm:text-sm outline-none"
                />
              </div>

              {/* S */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 focus-within:border-amber-500 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                      S
                    </span>
                    3. Sugerir (Propuesta específica, viable y con hora/fecha límite):
                  </span>
                </div>
                <input
                  type="text"
                  value={guidedS}
                  onChange={(e) => setGuidedS(e.target.value)}
                  placeholder="Ej: Te propongo que subas lo que tienes avanzado hoy antes de las 20:00 o me avises si necesitas apoyo..."
                  className="w-full bg-transparent text-slate-100 placeholder-slate-600 text-xs sm:text-sm outline-none"
                />
              </div>

              {/* C */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 focus-within:border-emerald-500 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                      C
                    </span>
                    4. Consecuencias (Beneficio mutuo ganar-ganar / impacto positivo):
                  </span>
                </div>
                <input
                  type="text"
                  value={guidedC}
                  onChange={(e) => setGuidedC(e.target.value)}
                  placeholder="Ej: Así podremos compilar a tiempo, evitar descuentos de nota y presentar un trabajo impecable..."
                  className="w-full bg-transparent text-slate-100 placeholder-slate-600 text-xs sm:text-sm outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Escribe tu mensaje asertivo completo como se lo dirías o enviarías a la persona involucrada..."
                rows={5}
                className="w-full bg-slate-950/80 text-slate-100 placeholder-slate-500 text-sm rounded-xl p-3.5 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFreeText('');
                setGuidedD('');
                setGuidedE('');
                setGuidedS('');
                setGuidedC('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl transition"
            >
              Borrar campos
            </button>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition-all ${
                isEvaluating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-[0.99]'
              }`}
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Evaluando con Rúbrica DESC...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Evaluar mi respuesta
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RÚBRICA DE EVALUACIÓN RESULT */}
      {evaluation && (
        <div
          id="evaluation-result-card"
          className="bg-slate-900 rounded-2xl border border-indigo-500/30 p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                Rúbrica de Evaluación Oficial DESC Bot
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Resultado de tu práctica
              </h3>
            </div>

            {/* Stars rating badge */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 transition-all ${
                      star <= evaluation.puntajeGlobal
                        ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-extrabold text-lg text-white ml-1">
                {evaluation.puntajeGlobal}/5 ⭐
              </span>
            </div>
          </div>

          {/* Motivating message banner */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>{evaluation.mensajeMotivador}</div>
          </div>

          {/* Step-by-Step Detailed Rubric (D, E, S, C) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Retroalimentación detallada por cada paso (D, E, S, C):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* D */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center">
                      D
                    </span>
                    <span className="font-bold text-sm text-sky-300">Describir</span>
                  </div>
                  {renderStatusBadge(evaluation.retroalimentacionD.status)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {evaluation.retroalimentacionD.feedback}
                </p>
              </div>

              {/* E */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      E
                    </span>
                    <span className="font-bold text-sm text-indigo-300">Expresar</span>
                  </div>
                  {renderStatusBadge(evaluation.retroalimentacionE.status)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {evaluation.retroalimentacionE.feedback}
                </p>
              </div>

              {/* S */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      S
                    </span>
                    <span className="font-bold text-sm text-amber-300">Sugerir</span>
                  </div>
                  {renderStatusBadge(evaluation.retroalimentacionS.status)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {evaluation.retroalimentacionS.feedback}
                </p>
              </div>

              {/* C */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      C
                    </span>
                    <span className="font-bold text-sm text-emerald-300">Consecuencias</span>
                  </div>
                  {renderStatusBadge(evaluation.retroalimentacionC.status)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {evaluation.retroalimentacionC.feedback}
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplo de Mejora Ideal */}
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 p-5 rounded-2xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Ejemplo de Mejora: Cómo habría sido la versión ideal
              </h4>
              <button
                onClick={() => copyIdealText(evaluation.ejemploMejora.mensajeCompleto)}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
              >
                {copiedIdeal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIdeal ? 'Copiado' : 'Copiar Versión Ideal'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed italic">
              "{evaluation.ejemploMejora.mensajeCompleto}"
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
                <strong className="text-sky-300">D (Hecho):</strong> {evaluation.ejemploMejora.describir}
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
                <strong className="text-indigo-300">E (Impacto Yo):</strong> {evaluation.ejemploMejora.expresar}
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
                <strong className="text-amber-300">S (Propuesta):</strong> {evaluation.ejemploMejora.sugerir}
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
                <strong className="text-emerald-300">C (Beneficio mutuo):</strong> {evaluation.ejemploMejora.consecuencias}
              </div>
            </div>
          </div>

          {/* Action buttons after evaluation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              ¿Deseas intentar con otro caso o ajustar tu respuesta para subir tu puntaje?
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleAdjustResponse}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500/40 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Ajustar mi respuesta
              </button>

              <button
                onClick={handleNextCase}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Intentar con otro caso</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
