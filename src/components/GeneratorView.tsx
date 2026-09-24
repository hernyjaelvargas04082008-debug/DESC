import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Smile,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { DescBreakdown } from '../types/desc';

interface GeneratorViewProps {
  onSwitchToPractice?: () => void;
}

const SAMPLE_CONFLICTS = [
  {
    label: 'Entrega demorada',
    icon: '⏳',
    text: 'Mi compañero no manda su parte del informe para el trabajo final y mañana vence la plataforma.',
  },
  {
    label: 'Carga injusta',
    icon: '⚖️',
    text: 'Me dejaron la mayor parte de la investigación y ellos solo quieren hacer la introducción corta.',
  },
  {
    label: 'Revisión con docente',
    icon: '🎓',
    text: 'El profesor me puso 11 sin ninguna anotación en la rúbrica habiendo cumplido todo.',
  },
  {
    label: 'Interrupción en reunión',
    icon: '🛑',
    text: 'Carlos me interrumpe cada vez que quiero dar mi punto de vista en el grupo de Zoom.',
  },
];

export const GeneratorView: React.FC<GeneratorViewProps> = ({ onSwitchToPractice }) => {
  const [conflictText, setConflictText] = useState('');
  const [tone, setTone] = useState<'cercano' | 'formal' | 'directo'>('cercano');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DescBreakdown | null>(null);
  const [copiedPhase, setCopiedPhase] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!conflictText.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/desc/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawConflict: conflictText,
          tone,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ocurrió un error al procesar la solicitud.');
      }

      const data: DescBreakdown = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    if (identifier === 'all') {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } else {
      setCopiedPhase(identifier);
      setTimeout(() => setCopiedPhase(null), 2000);
    }
  };

  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Intro Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Modo 1: Generador & Reescritor Asertivo
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Transforma cualquier conflicto en un mensaje <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">firme, respetuoso y claro</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Escribe tu situación o pega un mensaje que te salió enojado o impulsivo. DESC Bot lo estructurará eliminando juicios destructivos y potenciando el beneficio mutuo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Presets Chips */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Situaciones comunes rápidas:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_CONFLICTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setConflictText(sample.text);
                      }}
                      className="text-left text-xs p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all duration-150 flex items-center gap-2"
                    >
                      <span className="text-sm">{sample.icon}</span>
                      <span className="truncate font-medium">{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conflict Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tu situación o borrador impulsivo:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {conflictText.length} caracteres
                  </span>
                </div>
                <textarea
                  value={conflictText}
                  onChange={(e) => setConflictText(e.target.value)}
                  placeholder="Ej: Juan nunca manda su avance a tiempo y siempre tengo que hacer todo yo. Le voy a decir que es un flojo y que lo voy a borrar del trabajo..."
                  rows={4}
                  className="w-full bg-slate-950/80 text-slate-100 placeholder-slate-500 text-sm rounded-xl p-3.5 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Tone Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Tono del mensaje:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTone('cercano')}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      tone === 'cercano'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smile className="w-4 h-4 text-emerald-400" />
                    <span>Cercano</span>
                    <span className="text-[10px] text-slate-500">Compañeros</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTone('formal')}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      tone === 'formal'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-sky-400" />
                    <span>Formal</span>
                    <span className="text-[10px] text-slate-500">Docentes / Jefes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTone('directo')}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      tone === 'directo'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Directo</span>
                    <span className="text-[10px] text-slate-500">Urgente / Límite</span>
                  </button>
                </div>
              </div>

              {/* Optional Context */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Contexto o relación (opcional):
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Ej. Curso de Metodología, grupo de 4 personas, entrega final mañana"
                  className="w-full bg-slate-950/80 text-slate-100 placeholder-slate-500 text-xs rounded-xl p-2.5 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !conflictText.trim()}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                  isLoading || !conflictText.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-600/25 active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Estructurando en Técnica DESC...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Reescribir con Técnica DESC
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick reminder card */}
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              ¿Por qué funciona el método DESC?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Al separar los <span className="text-sky-300 font-medium">hechos verificables</span> de tus emociones y evitar adjetivos descalificadores ("flojo", "irresponsable"), desactivas el modo de defensa de la otra persona y centras la conversación en la solución.
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {!result && !isLoading && (
            <div className="h-full min-h-[420px] bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 text-indigo-400 border border-slate-700/60">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-300 mb-1">
                Tu mensaje asertivo aparecerá aquí
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Elige un ejemplo de la izquierda o redacta tu situación para ver cómo se desglosa en Describir, Expresar, Sugerir y Consecuencias.
              </p>
              {onSwitchToPractice && (
                <button
                  onClick={onSwitchToPractice}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 rounded-xl border border-indigo-500/20 transition-all"
                >
                  O practica tus habilidades en el simulador
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[420px] bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-7 h-7 text-indigo-400 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  DESC Bot está analizando tu conflicto...
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Separando hechos de juicios, construyendo mensajes "Yo" y diseñando una propuesta ganar-ganar.
                </p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6">
              {/* Full Message Highlight Card */}
              <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-emerald-950/40 rounded-2xl p-5 sm:p-6 border border-indigo-500/30 shadow-2xl relative">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Mensaje Asertivo Listo
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      Tono {tone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSpeech(result.mensajeCompleto)}
                      title={isSpeaking ? 'Detener lectura' : 'Escuchar cómo suena'}
                      className={`p-2 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                        isSpeaking
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isSpeaking ? 'Detener' : 'Escuchar'}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(result.mensajeCompleto, 'all')}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        copiedAll
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAll ? 'Copiado' : 'Copiar Mensaje'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-100 text-sm sm:text-base leading-relaxed font-sans">
                  "{result.mensajeCompleto}"
                </div>

                {result.consejosEntrega && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Recomendación de entrega:</strong> {result.consejosEntrega}
                    </span>
                  </div>
                )}
              </div>

              {/* The 4 DESC Phases Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Desglose en las 4 Fases de la Técnica DESC:
                  </h3>
                  <span className="text-[11px] text-slate-500">Puedes copiar cada fase por separado</span>
                </div>

                {/* 1. Describir */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-sky-900/40 hover:border-sky-700/60 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center border border-sky-500/30">
                        D
                      </span>
                      <span className="font-bold text-sm text-sky-300">
                        1. Describir (Hechos objetivos)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.describir, 'd')}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      title="Copiar fase D"
                    >
                      {copiedPhase === 'd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 pl-8 leading-relaxed">
                    {result.describir}
                  </p>
                  <div className="mt-2 pl-8 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    Sin etiquetas ("flojo"), sin absolutos ("nunca/siempre"). Solo hechos observables.
                  </div>
                </div>

                {/* 2. Expresar */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-indigo-900/40 hover:border-indigo-700/60 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                        E
                      </span>
                      <span className="font-bold text-sm text-indigo-300">
                        2. Expresar (Impacto en primera persona)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.expresar, 'e')}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      title="Copiar fase E"
                    >
                      {copiedPhase === 'e' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 pl-8 leading-relaxed">
                    {result.expresar}
                  </p>
                  <div className="mt-2 pl-8 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Mensajes "Yo" ("Yo siento...", "A nosotros nos complica"). Sin culpar al interlocutor.
                  </div>
                </div>

                {/* 3. Sugerir */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-amber-900/40 hover:border-amber-700/60 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                        S
                      </span>
                      <span className="font-bold text-sm text-amber-300">
                        3. Sugerir (Propuesta clara y viable)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.sugerir, 's')}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      title="Copiar fase S"
                    >
                      {copiedPhase === 's' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 pl-8 leading-relaxed">
                    {result.sugerir}
                  </p>
                  <div className="mt-2 pl-8 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Acción medible orientada al futuro ("¿Podrías enviarlo hoy antes de las 20:00?").
                  </div>
                </div>

                {/* 4. Consecuencias */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-900/40 hover:border-emerald-700/60 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                        C
                      </span>
                      <span className="font-bold text-sm text-emerald-300">
                        4. Consecuencias (Beneficio mutuo Win-Win)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.consecuencias, 'c')}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      title="Copiar fase C"
                    >
                      {copiedPhase === 'c' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 pl-8 leading-relaxed">
                    {result.consecuencias}
                  </p>
                  <div className="mt-2 pl-8 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Ganar-ganar mutuo en lugar de amenazas o chantajes emocionales.
                  </div>
                </div>
              </div>

              {/* Errores evitados badge list */}
              {result.analisisErroresEvitados && result.analisisErroresEvitados.length > 0 && (
                <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Trampas y errores neutralizados en esta versión:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.analisisErroresEvitados.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
