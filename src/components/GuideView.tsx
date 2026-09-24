import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Shield,
  Lightbulb,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export const GuideView: React.FC = () => {
  const [activePhase, setActivePhase] = useState<'d' | 'e' | 's' | 'c'>('d');

  const comparisonTable = [
    {
      tipo: 'Impulsivo / Agresivo ❌',
      ejemplo: '¡Eres un irresponsable, siempre dejas todo al final y me haces perder el tiempo!',
      problema: 'Genera reacción defensiva, usa palabras absolutas ("siempre") y ataca la identidad de la persona.',
    },
    {
      tipo: 'Pasivo / Sumiso ❌',
      ejemplo: 'Bueno... no te preocupes, si no pudiste yo hago tu parte también de madrugada, no pasa nada...',
      problema: 'Genera agotamiento, acumula resentimiento silencioso y fomenta la falta de compromiso en el equipo.',
    },
    {
      tipo: 'Asertivo con DESC ✔️',
      ejemplo: 'Ayer acordamos entregar el borrador a las 18:00 y aún no tengo tu parte. Me preocupa porque no podremos revisar el documento antes de la medianoche. Te propongo que me envíes lo que tengas redactado antes de las 20:00. De este modo podremos integrar todo con calma y asegurar una excelente nota.',
      problema: 'Cero juicios, datos exactos, expresión honesta del impacto y propuesta ganar-ganar con horario fijado.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          Manual de Comunicación Asertiva
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          La Fórmula Magistral de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">Técnica DESC</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Diseñada para defender tus derechos y necesidades con firmeza y calma, sin herir ni someter a los demás. Creada por Sharon y Gordon Bower en su obra clásica <em>Asserting Yourself</em>.
        </p>
      </div>

      {/* The 4 Phases Interactive Tabs */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActivePhase('d')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePhase === 'd'
                ? 'bg-sky-500/10 border-sky-500 text-white ring-1 ring-sky-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-sky-400 mb-0.5">Fase 1</div>
            <div className="font-bold text-sm">D - Describir</div>
          </button>

          <button
            onClick={() => setActivePhase('e')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePhase === 'e'
                ? 'bg-indigo-500/10 border-indigo-500 text-white ring-1 ring-indigo-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-indigo-400 mb-0.5">Fase 2</div>
            <div className="font-bold text-sm">E - Expresar</div>
          </button>

          <button
            onClick={() => setActivePhase('s')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePhase === 's'
                ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-amber-400 mb-0.5">Fase 3</div>
            <div className="font-bold text-sm">S - Sugerir</div>
          </button>

          <button
            onClick={() => setActivePhase('c')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePhase === 'c'
                ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-emerald-400 mb-0.5">Fase 4</div>
            <div className="font-bold text-sm">C - Consecuencias</div>
          </button>
        </div>

        {/* Phase Details Content */}
        {activePhase === 'd' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-black text-sm flex items-center justify-center border border-sky-500/30">
                D
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Describir la situación con hechos observables</h3>
                <p className="text-xs text-slate-400">Actúa como una cámara de video: registra lo que ocurrió, no lo que interpretas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Lo que debes PROHIBIRTE decir (Juicios):
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>❌ "Eres un flojo e irresponsable" (Etiqueta destructiva)</li>
                  <li>❌ "Nunca aportas nada al grupo" (Generalización absoluta falsa)</li>
                  <li>❌ "Siempre llegas tarde" (Provoca discusión sobre las veces que sí llegó puntual)</li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Cómo se describe asertivamente (Hechos verificables):
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>✔️ "El plazo acordado era el martes a las 18:00 y aún no figura tu documento en el Drive."</li>
                  <li>✔️ "En las últimas 2 reuniones de Zoom ingresaste 25 minutos después de la hora acordada."</li>
                  <li>✔️ "En la presentación actual se te asignó 1 minuto y a mí 8 minutos de exposición."</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activePhase === 'e' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center border border-indigo-500/30">
                E
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Expresar sentimientos e impacto con "Mensajes Yo"</h3>
                <p className="text-xs text-slate-400">Adueñate de tu vivencia personal sin culpar al otro de cómo te sientes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Culpabilizar al otro ("Mensajes Tú"):
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>❌ "Tú me haces enojar y me estresas"</li>
                  <li>❌ "Por tu culpa vamos a jalar el curso"</li>
                  <li>❌ "No te importa nada el resto del equipo"</li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Hablar desde la primera persona ("Mensajes Yo"):
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>✔️ "Me genera inquietud y preocupación no poder revisar el trabajo antes de subirlo."</li>
                  <li>✔️ "A nosotros como equipo se nos dificulta avanzar con la siguiente fase."</li>
                  <li>✔️ "Siento frustración cuando no puedo terminar de exponer mi idea en la reunión."</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activePhase === 's' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                S
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Sugerir una solución concreta, viable y medible</h3>
                <p className="text-xs text-slate-400">Enfócate en el futuro. Las peticiones vagas generan confusión y desacuerdos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Sugerencias vagas o inútiles:
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>❌ "Ponte las pilas y haz las cosas bien"</li>
                  <li>❌ "A ver si colaboras más"</li>
                  <li>❌ "Cambia tu actitud conmigo"</li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Sugerencias SMART específicas:
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>✔️ "¿Podrías enviar los 3 párrafos de tu marco teórico hoy antes de las 21:00?"</li>
                  <li>✔️ "Te propongo que dividamos el tiempo en 4 minutos exactos para cada uno."</li>
                  <li>✔️ "¿Te parece si me permites exponer los 2 minutos de mi propuesta antes de abrir el debate?"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activePhase === 'c' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-500/30">
                C
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Consecuencias: Enfoque Ganar-Ganar (Win-Win)</h3>
                <p className="text-xs text-slate-400">Resalta el beneficio compartido y la protección del proyecto.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Amenazas hostiles o ultimátums:
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>❌ "O lo haces o te acuso con el profesor y te jodes"</li>
                  <li>❌ "Si no mandas nada no te voy a hablar nunca más"</li>
                  <li>❌ "Te borro ahora mismo y no me importa nada"</li>
                </ul>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Beneficio mutuo y límites saludables:
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li>✔️ "Así podremos revisar la redacción juntos, entregar sin estrés y asegurar la nota alta que todos buscamos."</li>
                  <li>✔️ "De esta forma ambos luciremos nuestro dominio frente a la clase y el profesor notará un equipo sólido."</li>
                  <li>✔️ "Si no recibimos el avance para esa hora, lamentablemente tendremos que compilar sin tu sección para no perjudicar la nota grupal."</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* The Assertiveness Spectrum */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          El Espectro de la Comunicación: ¿Dónde estás parado?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              Estilo Pasivo
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Tus necesidades importan más que las mías." Callas tu incomodidad, aceptas cargas injustas por temor al rechazo o conflicto, y terminas con rencor y agotamiento.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2 ring-1 ring-indigo-500/30">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Estilo Asertivo (DESC)
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "Mis necesidades importan tanto como las tuyas." Te expresas con calma, firmeza y datos reales. Estableces límites sanos sin agredir ni someterte.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Estilo Agresivo
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Mis necesidades son las únicas que importan." Impones tus opiniones mediante gritos, sarcasmos, amenazas o descalificaciones personales.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Comparación de Respuestas ante un Mismo Conflicto
        </h3>

        <div className="space-y-3">
          {comparisonTable.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                idx === 2
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-bold text-sm text-white">{item.tipo}</div>
              <div className="italic p-2 rounded bg-slate-900/60 border border-slate-800/60 text-slate-200">
                "{item.ejemplo}"
              </div>
              <div className="text-[11px] text-slate-400">
                <strong>Análisis:</strong> {item.problema}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
