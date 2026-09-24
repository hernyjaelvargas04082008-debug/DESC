import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Shield,
  Lightbulb,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { ChatMessage } from '../types/desc';
import { getLocalChatReply } from '../utils/descEngine';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'model',
    content:
      '¡Hola! Soy **DESC Bot**, tu tutor interactivo y experto en comunicación asertiva.\n\nMi especialidad es ayudarte a resolver conflictos universitarios y personales sin caer en la agresividad ni en la sumisión pasiva a través de la **Técnica DESC**:\n\n' +
      '• **D (Describir)**: Hechos concretos y observables sin juicios de valor.\n' +
      '• **E (Expresar)**: Sentimientos e impacto en primera persona ("Yo siento...").\n' +
      '• **S (Sugerir)**: Soluciones realistas, viables y orientadas al futuro.\n' +
      '• **C (Consecuencias)**: Beneficios mutuos y acuerdos constructivos.\n\n' +
      'Puedes contarme una discusión reciente, pedirme un ejemplo para una situación delicada o hacerme preguntas sobre asertividad. ¿Por dónde empezamos?',
    timestamp: 'Ahora',
  },
];

const SUGGESTED_QUESTIONS = [
  '¿Cómo diferencio un hecho de un juicio?',
  '¿Qué hago si la persona reacciona a la defensiva?',
  '¿Cómo le digo a un amigo que no lo incluiré en el informe?',
  '¿Cómo pedir revisión de examen a un profesor estricto?',
];

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/desc/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener respuesta de DESC Bot.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Disculpa, no pude procesar la respuesta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('API de chat no disponible, respondiendo con tutor local:', err);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: getLocalChatReply(textToSend),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  // Helper to format text with bolding and lists
  const formatMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold handling
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc text-slate-200"
            dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•-]\s*/, '') }}
          />
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p
          key={idx}
          className="leading-relaxed mb-1"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-140px)] min-h-[550px] flex flex-col">
      {/* Top chat bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl mb-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Tutor DESC Bot</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Asesoría en asertividad, resolución de conflictos y técnica DESC
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Reiniciar conversación"
          className="text-xs text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Limpiar chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-emerald-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm shadow-md ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed'
              }`}
            >
              <div>{formatMarkdown(msg.content)}</div>
              <div
                className={`text-[10px] mt-2 text-right ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>DESC Bot está redactando tu respuesta asertiva...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-[11px] font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="mt-2 bg-slate-900 rounded-2xl border border-slate-800 p-2 shadow-xl focus-within:border-indigo-500 transition-all flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu consulta o describe tu conflicto (Presiona Enter para enviar)..."
          rows={2}
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm p-2 outline-none resize-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-xl transition-all ${
            input.trim() && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
