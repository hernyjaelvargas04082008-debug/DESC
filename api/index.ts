import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Standard middleware
app.use(express.json());

// CORS & Preflight handling for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to obtain Gemini AI client
function getAIClient(): GoogleGenAI | null {
  const currentKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.API_KEY;

  if (!currentKey) {
    return null;
  }

  return new GoogleGenAI({
    apiKey: currentKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

async function callWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timeout')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGeminiWithFallback(params: {
  contents: any;
  config?: any;
}): Promise<any> {
  const ai = getAIClient();
  if (!ai) {
    console.warn('GEMINI_API_KEY no encontrada en las variables de entorno.');
    return null;
  }

  let lastError: any = null;

  // Try the top candidate models with a strict 8s timeout to prevent hanging
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        }),
        8000
      );
      if (response) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`Model ${model} unavailable (${errMsg.slice(0, 90)}...), attempting next model...`);
    }
  }

  console.warn('All Gemini candidate models were unavailable or in high demand.', lastError?.message);
  return null;
}

const PRESET_CASES = [
  {
    id: 'case-1',
    titulo: 'El compañero que no envía su parte del informe',
    categoria: 'trabajo_en_equipo',
    dificultad: 'medio',
    descripcionCaso:
      'Faltan solo 24 horas para subir el proyecto final que vale el 40% de la nota del curso. Quedaron en que cada uno entregaría su parte redactada el martes a las 18:00. Ya es miércoles por la tarde, Juan no ha mandado su sección y no responde a los mensajes del grupo de WhatsApp.',
    personajes: 'Tú (coordinador o integrante del equipo) y Juan (compañero ausente).',
    trampaComun:
      'Llamarlo "irresponsable", amenazar con borrarlo del trabajo inmediatamente o decir "siempre haces lo mismo".',
    criteriosEvaluacion: [
      'Citar fecha y hora exactas acordadas sin insultos ni calificativos.',
      'Expresar la preocupación e impacto en la nota del equipo en 1ra persona.',
      'Dar una hora límite concreta y clara para recibir el avance.',
      'Indicar la consecuencia positiva de cumplirlo y qué pasará si no se recibe.',
    ],
  },
  {
    id: 'case-2',
    titulo: 'Desacuerdo en el reparto equitativo de temas para la exposición',
    categoria: 'exposicion',
    dificultad: 'facil',
    descripcionCaso:
      'En la reunión de preparación, Laura se asignó a sí misma la introducción (que toma 1 minuto) y te dejó a ti las conclusiones y el marco teórico más complejo (que toma 8 minutos), diciendo que "a ti se te da mejor hablar". Tú sientes que la carga es injusta.',
    personajes: 'Tú y Laura (compañera de exposición).',
    trampaComun:
      'Aceptar en silencio por timidez (pasividad) o decirle que es una aprovechada que nunca quiere trabajar (agresividad).',
    criteriosEvaluacion: [
      'Describir la distribución actual en minutos o cantidad de diapositivas con datos fácticos.',
      'Expresar incomodidad con la disparidad de tiempo de exposición.',
      'Proponer una redistribución equilibrada (ej. 4 minutos cada uno).',
      'Explicar el beneficio de una presentación donde ambos luzcan su dominio del tema.',
    ],
  },
  {
    id: 'case-3',
    titulo: 'Compañero que interrumpe constantemente en las reuniones',
    categoria: 'reuniones',
    dificultad: 'medio',
    descripcionCaso:
      'Cada vez que intentas explicar una idea o propuesta para el proyecto grupal, Carlos te corta a mitad de frase para imponer su opinión. Esto ya ha ocurrido varias veces en la última sesión de Zoom y te hace sentir desestimado frente al resto.',
    personajes: 'Tú y Carlos (integrante del grupo).',
    trampaComun:
      'Gritarle "¡Cállate ya y déjame hablar!" o quedarse callado y dejar de participar.',
    criteriosEvaluacion: [
      'Describir el hecho observable en el momento exacto (ej. "Carlos, he notado que cuando inicio una propuesta se interrumpe mi idea").',
      'Expresar cómo te desconcentra o resta claridad al equipo.',
      'Sugerir una regla de turnos o pedir 2 minutos para terminar la idea antes de debatir.',
      'Destacar que escuchar todas las ideas completas mejorará la calidad final del trabajo.',
    ],
  },
  {
    id: 'case-4',
    titulo: 'Solicitud de aclaración de nota con un docente',
    categoria: 'relacion_docente',
    dificultad: 'desafiante',
    descripcionCaso:
      'Recibiste la calificación del ensayo final y tienes 11/20 sin ningún comentario en la rúbrica. Cumpliste con todas las fuentes solicitadas y la estructura de la guía. Quieres pedir una revisión sin sonar desafiante ni irrespetuoso.',
    personajes: 'Tú y el/la Profesor/a del curso.',
    trampaComun:
      'Decir "Usted me calificó mal", "Le caigo mal" o no decir nada y resignarse con la mala nota.',
    criteriosEvaluacion: [
      'Mencionar el trabajo específico, la nota recibida y la ausencia de comentarios en la rúbrica.',
      'Expresar deseo de comprender los criterios para aprender y mejorar el desempeño académico.',
      'Sugerir una breve reunión de 10 minutos o una revisión guiada en horas de asesoría.',
      'Resaltar el beneficio mutuo de alinear expectativas y resolver dudas académicas.',
    ],
  },
];

function buildLocalDesc(conflict: string, tone: string, context?: string) {
  const clean = conflict.trim();
  const lower = clean.toLowerCase();

  let describir = `He observado que respecto a lo previsto (${context || 'la actividad coordinada'}), se han presentado demoras y desacuerdos en el cumplimiento de los acuerdos.`;
  if (lower.includes('tarde') || lower.includes('hora') || lower.includes('reunión') || lower.includes('zoom')) {
    describir = 'En nuestras dos últimas reuniones programadas registramos un desfase de horario respecto a la hora de inicio acordada.';
  } else if (lower.includes('informe') || lower.includes('entrega') || lower.includes('trabajo') || lower.includes('drive') || lower.includes('avance')) {
    describir = 'Acordamos tener el avance consolidado en la plataforma y aún no figura la sección que correspondía a tu tema.';
  } else if (lower.includes('nota') || lower.includes('profesor') || lower.includes('examen') || lower.includes('rúbrica')) {
    describir = 'Al revisar la publicación de calificaciones de la última evaluación, noté que la puntuación asignada no cuenta con retroalimentación en los criterios evaluados.';
  } else if (lower.includes('interrumpe') || lower.includes('hablar') || lower.includes('escucha')) {
    describir = 'En las intervenciones grupales recientes, noté que mis propuestas se quedaron incompletas debido a interrupciones en el uso de la palabra.';
  }

  let expresar = 'Me genera inquietud y preocupación porque el cronograma del equipo se ve afectado y deseo que mantengamos una buena calidad de entrega.';
  if (tone === 'formal') {
    expresar = 'Tengo gran interés en comprender los criterios aplicados y me preocupa no tener claridad sobre los aspectos de mejora de nuestro desempeño.';
  } else if (tone === 'directo') {
    expresar = 'Nos coloca en una situación crítica de tiempo y me preocupa seriamente que el resultado grupal resulte perjudicado.';
  }

  let sugerir = 'Te propongo que fijemos una hora límite hoy mismo (antes de las 20:00) para revisar el avance y alinear nuestras partes pendientes.';
  if (tone === 'formal') {
    sugerir = 'Le solicito amablemente si fuera posible concederme una breve asesoría de 10 minutos para revisar los puntos específicos de la rúbrica.';
  } else if (tone === 'directo') {
    sugerir = 'Es indispensable que me envíes tu aporte puntual antes de las 19:00 o coordinemos una llamada de 10 minutos para cerrar el tema.';
  }

  let consecuencias = 'De esta manera podremos integrar todo el material con calma, optimizar nuestro tiempo y asegurar una excelente calificación para todos.';
  if (tone === 'formal') {
    consecuencias = 'Esto me permitirá incorporar sus sugerencias con rigor en los siguientes trabajos y fortalecer mi aprendizaje en el curso.';
  }

  const saludo = tone === 'formal' ? 'Estimado(a):' : tone === 'directo' ? 'Hola:' : '¡Hola!';
  const mensajeCompleto = `${saludo}\n${describir} ${expresar} ${sugerir} ${consecuencias}`;

  return {
    describir,
    expresar,
    sugerir,
    consecuencias,
    mensajeCompleto,
    analisisErroresEvitados: [
      'Se eliminaron acusaciones destructivas o adjetivos calificativos.',
      'Se sustituyeron términos absolutos ("siempre", "nunca") por hechos fácticos.',
      'Se comunicó el impacto en primera persona ("Me preocupa") sin culpar.',
      'Se planteó una propuesta ganar-ganar con horario o acción concreta.',
    ],
    consejosEntrega: tone === 'formal'
      ? 'Envía la solicitud a través del correo institucional o en el horario de asesoría académica.'
      : 'Conversa en privado por chat personal o llamada breve, evitando exponer el asunto en el grupo general.',
  };
}

function evaluateLocally(promptText: string, submissionText: string, breakdown?: { d?: string; e?: string; s?: string; c?: string }) {
  const text = `${submissionText || ''} ${breakdown?.d || ''} ${breakdown?.e || ''} ${breakdown?.s || ''} ${breakdown?.c || ''}`.toLowerCase();
  
  const toxicWords = ['irresponsable', 'flojo', 'vago', 'inútil', 'malo', 'idiota', 'estúpido', 'siempre', 'nunca', 'culpa tuya'];
  const hasToxicWords = toxicWords.some((w) => text.includes(w));

  const dKeywords = ['ayer', 'martes', 'miércoles', 'hora', 'minuto', 'acordamos', 'fecha', 'plazo', 'reunión', 'avance', 'drive', 'documento', 'rúbrica', 'nota'];
  const hasD = breakdown?.d?.trim() || dKeywords.some((w) => text.includes(w));

  const eKeywords = ['yo siento', 'siento', 'me preocupa', 'me genera', 'a mí', 'nosotros', 'me frustra', 'inquietud', 'deseo'];
  const hasE = breakdown?.e?.trim() || eKeywords.some((w) => text.includes(w));

  const sKeywords = ['propongo', 'te sugiero', 'podrías', 'antes de', 'a las', 'revisemos', 'dividamos', 'minutos', 'reunión', 'enviar'];
  const hasS = breakdown?.s?.trim() || sKeywords.some((w) => text.includes(w));

  const cKeywords = ['así', 'de esta manera', 'beneficio', 'ambos', 'equipo', 'nota', 'tiempo', 'calma', 'éxito', 'aprobar'];
  const hasC = breakdown?.c?.trim() || cKeywords.some((w) => text.includes(w));

  let score = 3;
  if (hasToxicWords) {
    score = 2;
  } else {
    const matches = (hasD ? 1 : 0) + (hasE ? 1 : 0) + (hasS ? 1 : 0) + (hasC ? 1 : 0);
    if (matches >= 4) score = 5;
    else if (matches === 3) score = 4;
    else score = 3;
  }

  return {
    puntajeGlobal: score,
    retroalimentacionD: {
      status: hasToxicWords ? 'a_mejorar' : hasD ? 'excelente' : 'bueno',
      feedback: hasToxicWords 
        ? 'Cuidado: detectamos calificativos que provocan actitud defensiva. Enfócate exclusivamente en hechos verificables.'
        : 'Bien planteada la situación observable sin emitir juicios de valor destructivos.',
    },
    retroalimentacionE: {
      status: hasE ? 'excelente' : 'bueno',
      feedback: hasE 
        ? 'Excelente uso de Mensajes Yo ("Me preocupa", "Siento inquietud") asumiendo tus emociones sin proyectar culpa directa.'
        : 'Recuerda expresar explícitamente el impacto emocional en primera persona ("Yo siento...") para generar empatía.',
    },
    retroalimentacionS: {
      status: hasS ? 'excelente' : 'bueno',
      feedback: hasS 
        ? 'Muy buena sugerencia, orientada a la acción y delimitada en el tiempo.'
        : 'Procura que tu sugerencia tenga un plazo concreto (hora o día específico) para que sea medible y no vaga.',
    },
    retroalimentacionC: {
      status: hasC ? 'excelente' : 'bueno',
      feedback: hasC 
        ? 'Enfoque ganar-ganar claro que resalta la cooperación y la protección del objetivo común.'
        : 'Recuerda destacar el beneficio mutuo ("así ambos aseguramos una excelente entrega") en lugar de sonar como un ultimátum.',
    },
    ejemploMejora: {
      describir: 'Ayer fijamos las 18:00 para consolidar el avance en la carpeta del curso y aún no figura tu sección.',
      expresar: 'Me preocupa no contar con el texto a tiempo porque retrasa la revisión final de todo el equipo.',
      sugerir: '¿Podrías compartir lo redactado hoy antes de las 20:30 o avisarme si requieres apoyo con algún punto?',
      consecuencias: 'De este modo podremos integrar el documento sin prisas y garantizar la máxima calificación.',
      mensajeCompleto: 'Hola. Ayer fijamos las 18:00 para consolidar el avance en la carpeta del curso y aún no figura tu sección. Me preocupa no contar con el texto a tiempo porque retrasa la revisión final de todo el equipo. ¿Podrías compartir lo redactado hoy antes de las 20:30 o avisarme si requieres apoyo con algún punto? De este modo podremos integrar el documento sin prisas y garantizar la máxima calificación.',
    },
    puntosClave: [
      hasToxicWords ? 'Elimina acusaciones o adjetivos negativos.' : 'Mantuviste el respeto y la objetividad.',
      hasE ? 'Expresión personal asertiva y madura.' : 'Usa "Me preocupa..." para conectar mejor.',
      'Estructura orientada a soluciones y ganar-ganar.',
    ],
    mensajeMotivador: score >= 4 
      ? '¡Excelente trabajo asertivo! Tu comunicación construye acuerdos sólidos. ¿Deseas practicar con otro caso?' 
      : '¡Buen intento! Cada práctica afina tu precisión DESC. Puedes ajustar tu respuesta para alcanzar las 5 estrellas ⭐.',
  };
}

// Router to handle API endpoints
const apiRouter = express.Router();

// Root/Status check
apiRouter.get('/', (_req, res) => {
  const isKeyConfigured = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.API_KEY
  );

  return res.json({
    status: 'ok',
    app: 'DESC Bot API',
    geminiKeyConfigured: isKeyConfigured,
    platform: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  const isKeyConfigured = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.API_KEY
  );

  return res.json({
    status: 'ok',
    geminiKeyConfigured: isKeyConfigured,
    platform: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
    timestamp: new Date().toISOString()
  });
});

// 1. GENERADOR DESC
apiRouter.post('/desc/generate', async (req: Request, res: Response) => {
  try {
    const { rawConflict, tone = 'cercano', context = '' } = req.body;

    if (!rawConflict || typeof rawConflict !== 'string') {
      return res.status(400).json({ error: 'Debes proporcionar la situación de conflicto o texto a transformar.' });
    }

    const systemInstruction = `
Eres "DESC Bot", un tutor interactivo y experto en comunicación asertiva especializado en la Técnica DESC (Describir, Expresar, Sugerir, Consecuencias).
Tu misión es convertir situaciones de conflicto o mensajes impulsivos/agresivos/pasivos en mensajes asertivos impecables desglosados en las 4 fases:

1. Describir (D): Hechos concretos, objetivos, observables y verificables sin juicios ni etiquetas.
2. Expresar (E): Sentimientos e impacto en primera persona ("Yo siento...", "A mí me preocupa...").
3. Sugerir (S): Solución concreta, viable y medible.
4. Consecuencias (C): Beneficio mutuo (ganar-ganar).

Tono: ${tone}. Contexto: ${context || 'Ámbito universitario o profesional'}.
`;

    const prompt = `Transforma la siguiente situación aplicando la Técnica DESC:\n"${rawConflict}"\nDevuelve un JSON estrictamente estructurado.`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            describir: { type: Type.STRING },
            expresar: { type: Type.STRING },
            sugerir: { type: Type.STRING },
            consecuencias: { type: Type.STRING },
            mensajeCompleto: { type: Type.STRING },
            analisisErroresEvitados: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            consejosEntrega: { type: Type.STRING },
          },
          required: ['describir', 'expresar', 'sugerir', 'consecuencias', 'mensajeCompleto', 'analisisErroresEvitados', 'consejosEntrega'],
        },
      },
    });

    if (response?.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.describir && parsed.mensajeCompleto) {
        return res.json(parsed);
      }
    }

    const localResult = buildLocalDesc(rawConflict, tone, context);
    return res.json(localResult);
  } catch (error: any) {
    console.error('Error generating DESC, using local engine fallback:', error);
    const fallback = buildLocalDesc(req.body?.rawConflict || 'Conflicto', req.body?.tone || 'cercano', req.body?.context);
    return res.json(fallback);
  }
});

// 2. SIMULADOR DE EVALUACIÓN
apiRouter.post('/desc/evaluate', async (req: Request, res: Response) => {
  try {
    const { casePrompt, userResponse, breakdown } = req.body;

    if (!userResponse && (!breakdown || (!breakdown.d && !breakdown.e && !breakdown.s && !breakdown.c))) {
      return res.status(400).json({ error: 'Debes ingresar tu respuesta para ser evaluada.' });
    }

    const fullSubmission = userResponse || `
[Describir]: ${breakdown?.d || '(Vacío)'}
[Expresar]: ${breakdown?.e || '(Vacío)'}
[Sugerir]: ${breakdown?.s || '(Vacío)'}
[Consecuencias]: ${breakdown?.c || '(Vacío)'}
    `.trim();

    const systemInstruction = `
Eres "DESC Bot", un tutor y evaluador de comunicación asertiva especializada en la Técnica DESC (Describir, Expresar, Sugerir, Consecuencias).
Evalúa la respuesta del usuario para el caso presentado usando una escala de 1 a 5 estrellas.
Devuelve retroalimentación por cada fase (D, E, S, C), ejemplo de mejora y puntos clave en formato JSON.
`;

    const prompt = `CASO: ${casePrompt}\nRESPUESTA DEL USUARIO:\n${fullSubmission}`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            puntajeGlobal: { type: Type.INTEGER },
            retroalimentacionD: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING },
              },
              required: ['status', 'feedback'],
            },
            retroalimentacionE: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING },
              },
              required: ['status', 'feedback'],
            },
            retroalimentacionS: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING },
              },
              required: ['status', 'feedback'],
            },
            retroalimentacionC: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING },
              },
              required: ['status', 'feedback'],
            },
            ejemploMejora: {
              type: Type.OBJECT,
              properties: {
                describir: { type: Type.STRING },
                expresar: { type: Type.STRING },
                sugerir: { type: Type.STRING },
                consecuencias: { type: Type.STRING },
                mensajeCompleto: { type: Type.STRING },
              },
              required: ['describir', 'expresar', 'sugerir', 'consecuencias', 'mensajeCompleto'],
            },
            puntosClave: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mensajeMotivador: { type: Type.STRING },
          },
          required: [
            'puntajeGlobal',
            'retroalimentacionD',
            'retroalimentacionE',
            'retroalimentacionS',
            'retroalimentacionC',
            'ejemploMejora',
            'puntosClave',
            'mensajeMotivador',
          ],
        },
      },
    });

    if (response?.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.puntajeGlobal && parsed.retroalimentacionD) {
        return res.json(parsed);
      }
    }

    const localEval = evaluateLocally(casePrompt, fullSubmission, breakdown);
    return res.json(localEval);
  } catch (error: any) {
    console.error('Error evaluating DESC, using local evaluation engine:', error);
    const localEval = evaluateLocally(req.body?.casePrompt || '', req.body?.userResponse || '', req.body?.breakdown);
    return res.json(localEval);
  }
});

// 3. GENERAR CASOS DE PRÁCTICA
apiRouter.post('/desc/generate-case', async (req: Request, res: Response) => {
  try {
    const { category, difficulty } = req.body;

    const systemInstruction = `Eres "DESC Bot", generador de casos realistas para practicar comunicación asertiva DESC en el ámbito universitario o profesional.`;
    const prompt = `Genera un nuevo caso práctico de entrenamiento DESC. Categoría: ${category || 'general'}, Dificultad: ${difficulty || 'medio'}.`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            titulo: { type: Type.STRING },
            categoria: { type: Type.STRING },
            dificultad: { type: Type.STRING },
            descripcionCaso: { type: Type.STRING },
            personajes: { type: Type.STRING },
            trampaComun: { type: Type.STRING },
            criteriosEvaluacion: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['id', 'titulo', 'categoria', 'dificultad', 'descripcionCaso', 'personajes', 'trampaComun', 'criteriosEvaluacion'],
        },
      },
    });

    if (response?.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.titulo && parsed.descripcionCaso) {
        return res.json(parsed);
      }
    }

    const randomCase = PRESET_CASES[Math.floor(Math.random() * PRESET_CASES.length)];
    return res.json(randomCase);
  } catch (error: any) {
    console.error('Error generating case, returning preset:', error);
    const randomCase = PRESET_CASES[Math.floor(Math.random() * PRESET_CASES.length)];
    return res.json(randomCase);
  }
});

// 4. CHAT TUTOR INTERACTIVO
apiRouter.post('/desc/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'El historial de mensajes es requerido.' });
    }

    const systemInstruction = `
Eres "DESC Bot", un tutor interactivo y experto en comunicación asertiva especializado en la Técnica DESC (Describir, Expresar, Sugerir, Consecuencias).
Responde de manera empática, didáctica y concisa usando Markdown y emojis.
`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await callGeminiWithFallback({
      contents,
      config: { systemInstruction },
    });

    if (response?.text) {
      return res.json({ reply: response.text });
    }

    return res.json({
      reply: 'Recuerda que con la **Técnica DESC** convertimos reclamos en acuerdos:\n\n' +
        '1. **D (Describir)**: Registra la fecha, hora y hechos objetivos sin juicios.\n' +
        '2. **E (Expresar)**: Di cómo te afecta en primera persona (*"A mí me genera inquietud"*).\n' +
        '3. **S (Sugerir)**: Da una alternativa concreta con horario medible.\n' +
        '4. **C (Consecuencias)**: Muestra el beneficio mutuo ganar-ganar.\n\n' +
        '¿Tienes una situación específica que quieras estructurar? Cuéntamela y te ayudo paso a paso.',
    });
  } catch (error: any) {
    console.error('Error in chat, using fallback:', error);
    return res.json({
      reply: 'En la Técnica DESC recuerda siempre describir hechos observables (D), expresar tu sentir con mensajes Yo (E), sugerir una acción concreta (S) y cerrar con el beneficio mutuo (C).',
    });
  }
});

// Register routes under both '/api' and '/'
// This ensures that whether Vercel preserves or strips the '/api' prefix, all calls resolve!
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
