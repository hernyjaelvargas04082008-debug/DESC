import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient model fallback cascade to handle temporary 503 spikes in demand
// gemini-2.5-flash and gemini-3.1-flash-lite are fastest and highly available
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

async function callGeminiWithFallback(params: {
  contents: any;
  config?: any;
}): Promise<any> {
  if (!ai) return null;

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      // Immediately fail-over to next healthy candidate model without hanging or logging noisy stack traces
      console.warn(`Model ${model} unavailable (${errMsg.slice(0, 90)}...), attempting next model...`);
    }
  }

  console.warn('All Gemini candidate models were unavailable or in high demand. Engaging intelligent local heuristics.', lastError?.message);
  return null;
}

// Fallback educational cases in case API is missing or unavailable
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
  {
    id: 'case-5',
    titulo: 'Compañero que envía su parte copiada textualmente de internet (Riesgo de Plagio)',
    categoria: 'trabajo_en_equipo',
    dificultad: 'desafiante',
    descripcionCaso:
      'Al pasar el informe grupal por el software antiplagio de la universidad, descubres que la sección de Rodrigo tiene un 85% de coincidencia textual de un blog de internet sin citar. Si lo envían así, el grupo entero podría ser reprobado por deshonestidad académica.',
    personajes: 'Tú y Rodrigo (integrante del grupo).',
    trampaComun:
      'Insultarlo diciendo que es un tramposo o reescribir todo su trabajo en secreto sin decirle nada.',
    criteriosEvaluacion: [
      'Describir el hecho objetivo: el informe arrojó 85% de similitud en la sección asignada.',
      'Expresar el riesgo y preocupación sobre la sanción académica para el equipo.',
      'Sugerir parafrasear e incluir las citas bibliográficas en formato APA antes de las 20:00.',
      'Explicar el beneficio de proteger la reputación académica del grupo y asegurar la aprobación.',
    ],
  },
  {
    id: 'case-6',
    titulo: 'Falta de respuesta y "ghosting" en el grupo de mensajería',
    categoria: 'reuniones',
    dificultad: 'medio',
    descripcionCaso:
      'Se creó un grupo de WhatsApp hace 3 días para coordinar el trabajo final. Has escrito varias veces preguntando por la disponibilidad para reunirnos. Dos compañeros leen los mensajes (sale el visto azul) pero nadie responde nada.',
    personajes: 'Tú y los compañeros de grupo.',
    trampaComun:
      'Enviar mensajes sarcásticos con signos de interrogación o quejarse amargamente sin proponer un llamado a la acción.',
    criteriosEvaluacion: [
      'Describir con precisión los mensajes enviados y la fecha de entrega del proyecto.',
      'Expresar la incertidumbre respecto al avance y los tiempos de entrega.',
      'Sugerir dos opciones concretas de horario para una reunión de 15 minutos.',
      'Explicar que definir roles hoy evitará amanecidas y estrés en los días posteriores.',
    ],
  },
];

// Helper to sanitize and build smart local DESC response when AI API is unavailable
function buildLocalDescGeneration(conflict: string, tone: string, context?: string) {
  const cleanConflict = conflict.trim();
  const lower = cleanConflict.toLowerCase();

  let describirse = `He observado que respecto a lo previsto (${context || 'la actividad coordinada'}), se han presentado demoras y desacuerdos en el cumplimiento de los acuerdos.`;
  if (lower.includes('tarde') || lower.includes('hora') || lower.includes('reunión') || lower.includes('zoom')) {
    describirse = 'En nuestras dos últimas reuniones programadas registramos un desfase de horario respecto a la hora de inicio acordada.';
  } else if (lower.includes('informe') || lower.includes('entrega') || lower.includes('trabajo') || lower.includes('drive') || lower.includes('avance')) {
    describirse = 'Acordamos tener el avance consolidado en la plataforma y aún no figura la sección que correspondía a tu tema.';
  } else if (lower.includes('nota') || lower.includes('profesor') || lower.includes('examen') || lower.includes('rúbrica')) {
    describirse = 'Al revisar la publicación de calificaciones de la última evaluación, noté que la puntuación asignada no cuenta con retroalimentación en los criterios evaluados.';
  } else if (lower.includes('interrumpe') || lower.includes('hablar') || lower.includes('escucha')) {
    describirse = 'En las intervenciones grupales recientes, noté que mis propuestas se quedaron incompletas debido a interrupciones en el uso de la palabra.';
  }

  let expresarse = 'Me genera inquietud y preocupación porque el cronograma del equipo se ve afectado y deseo que mantengamos una buena calidad de entrega.';
  if (tone === 'formal') {
    expresarse = 'Tengo gran interés en comprender los criterios aplicados y me preocupa no tener claridad sobre los aspectos de mejora de nuestro desempeño.';
  } else if (tone === 'directo') {
    expresarse = 'Nos coloca en una situación crítica de tiempo y me preocupa seriamente que el resultado grupal resulte perjudicado.';
  }

  let sugerirse = 'Te propongo que fijemos una hora límite hoy mismo (antes de las 20:00) para revisar el avance y alinear nuestras partes pendientes.';
  if (tone === 'formal') {
    sugerirse = 'Le solicito amablemente si fuera posible concederme una breve asesoría de 10 minutos para revisar los puntos específicos de la rúbrica.';
  } else if (tone === 'directo') {
    sugerirse = 'Es indispensable que me envíes tu aporte puntual antes de las 19:00 o coordinemos una llamada de 10 minutos para cerrar el tema.';
  }

  let consecuenciase = 'De esta manera podremos integrar todo el material con calma, optimizar nuestro tiempo y asegurar una excelente calificación para todos.';
  if (tone === 'formal') {
    consecuenciase = 'Esto me permitirá incorporar sus sugerencias con rigor en los siguientes trabajos y fortalecer mi aprendizaje en el curso.';
  }

  let saludo = tone === 'formal' ? 'Estimado(a):' : tone === 'directo' ? 'Hola:' : '¡Hola!';
  let mensajeCompleto = `${saludo}\n${describirse} ${expresarse} ${sugerirse} ${consecuenciase}`;

  return {
    describir: describirse,
    expresar: expresarse,
    sugerir: sugerirse,
    consecuencias: consecuenciase,
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

// Helper to evaluate user DESC submission locally if API is 503
function evaluateLocally(promptText: string, submissionText: string, breakdown?: { d?: string; e?: string; s?: string; c?: string }) {
  const text = `${submissionText || ''} ${breakdown?.d || ''} ${breakdown?.e || ''} ${breakdown?.s || ''} ${breakdown?.c || ''}`.toLowerCase();
  
  // Checking harmful traits
  const toxicWords = ['irresponsable', 'flojo', 'vago', 'inútil', 'malo', 'idiota', 'estúpido', 'siempre', 'nunca', 'culpa tuya'];
  const hasToxicWords = toxicWords.some((w) => text.includes(w));

  // Checking Phase D (facts, timestamps, data)
  const dKeywords = ['ayer', 'martes', 'miércoles', 'hora', 'minuto', 'acordamos', 'fecha', 'plazo', 'reunión', 'avance', 'drive', 'documento', 'rúbrica', 'nota'];
  const hasD = breakdown?.d?.trim() || dKeywords.some((w) => text.includes(w));

  // Checking Phase E (first person)
  const eKeywords = ['yo siento', 'siento', 'me preocupa', 'me genera', 'a mí', 'nosotros', 'me frustra', 'inquietud', 'deseo'];
  const hasE = breakdown?.e?.trim() || eKeywords.some((w) => text.includes(w));

  // Checking Phase S (specific proposal)
  const sKeywords = ['propongo', 'te sugiero', 'podrías', 'antes de', 'a las', 'revisemos', 'dividamos', 'minutos', 'reunión', 'enviar'];
  const hasS = breakdown?.s?.trim() || sKeywords.some((w) => text.includes(w));

  // Checking Phase C (win-win)
  const cKeywords = ['así', 'de esta manera', 'beneficio', 'ambos', 'equipo', 'nota', 'tiempo', 'calma', 'éxito', 'aprobar'];
  const hasC = breakdown?.c?.trim() || cKeywords.some((w) => text.includes(w));

  let score = 3;
  if (hasToxicWords) {
    score = 2;
  } else {
    let matches = (hasD ? 1 : 0) + (hasE ? 1 : 0) + (hasS ? 1 : 0) + (hasC ? 1 : 0);
    if (matches >= 4) score = 5;
    else if (matches === 3) score = 4;
    else score = 3;
  }

  return {
    puntajeGlobal: score,
    retroalimentacionD: {
      status: hasToxicWords ? 'a_mejorar' : hasD ? 'excelente' : 'bueno',
      feedback: hasToxicWords 
        ? 'Cuidado: detectamos calificativos que provocan actitud defensiva. Enfócate exclusivamente en hechos verificables (fechas, horas, acuerdos).'
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

// 1. GENERADOR / REESCRITOR DESC
app.post('/api/desc/generate', async (req: Request, res: Response) => {
  try {
    const { rawConflict, tone = 'cercano', context = '' } = req.body;

    if (!rawConflict || typeof rawConflict !== 'string') {
      return res.status(400).json({ error: 'Debes proporcionar la situación de conflicto o texto a transformar.' });
    }

    const systemInstruction = `
Eres "DESC Bot", un tutor interactivo y experto en comunicación asertiva especializado en la Técnica DESC (Describir, Expresar, Sugerir, Consecuencias).
Tu misión es convertir situaciones de conflicto o mensajes impulsivos/agresivos/pasivos en mensajes asertivos impecables desglosados en las 4 fases:

1. Describir (D): Hechos concretos, objetivos, observables y verificables. ESTRICTAMENTE PROHIBIDO usar juicios de valor, etiquetas descalificadoras o acusaciones (evita palabras absolutas como "siempre", "nunca", "irresponsable", "flojo", "tóxico").
2. Expresar (E): Transmite el impacto personal o del equipo hablando en primera persona ("Yo siento...", "A mí me preocupa...", "A nosotros nos dificulta...") sin proyectar culpa.
3. Sugerir (S): Propón una solución o alternativa específica, viable, realista y orientada al futuro.
4. Consecuencias (C): Explica el beneficio mutuo (ganar-ganar) y el impacto positivo de aplicar la solución.

El tono solicitado es: ${tone} (formal = respetuoso para docentes o autoridades; cercano = empático para compañeros de clase o amigos; directo = firme pero educado para urgencias o plazos críticos).
Contexto adicional: ${context || 'Ámbito universitario o interpersonal'}.
`;

    const prompt = `
Transforma la siguiente situación o mensaje de conflicto aplicando la Técnica DESC:
"${rawConflict}"

Devuelve un JSON estrictamente estructurado.
`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            describir: {
              type: Type.STRING,
              description: 'Fase D: Hechos verificables y observables sin juicios ni etiquetas.',
            },
            expresar: {
              type: Type.STRING,
              description: 'Fase E: Sentimientos e impacto en primera persona.',
            },
            sugerir: {
              type: Type.STRING,
              description: 'Fase S: Solución concreta, viable y medible.',
            },
            consecuencias: {
              type: Type.STRING,
              description: 'Fase C: Beneficios positivos mutuos y consecuencias constructivas.',
            },
            mensajeCompleto: {
              type: Type.STRING,
              description: 'El mensaje final asertivo completo integrado y listo para decir o enviar.',
            },
            analisisErroresEvitados: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de 3 a 4 errores o trampas (agresividad/pasividad) que se evitaron o corrigieron.',
            },
            consejosEntrega: {
              type: Type.STRING,
              description: 'Consejo práctico sobre canal (privado, presencial), momento y lenguaje corporal/tono.',
            },
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

    // Graceful intelligent fallback if AI was busy or returned incomplete text
    const localResult = buildLocalDescGeneration(rawConflict, tone, context);
    return res.json(localResult);
  } catch (error: any) {
    console.error('Error generating DESC, using local engine fallback:', error);
    const fallback = buildLocalDescGeneration(req.body?.rawConflict || 'Conflicto de equipo', req.body?.tone || 'cercano', req.body?.context);
    return res.json(fallback);
  }
});

// 2. SIMULADOR DE PRÁCTICA - EVALUACIÓN
app.post('/api/desc/evaluate', async (req: Request, res: Response) => {
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
Eres "DESC Bot", un riguroso pero empático tutor y juez de comunicación asertiva especializado en la Técnica DESC (Describir, Expresar, Sugerir, Consecuencias).
Evalúa la respuesta del usuario para el caso presentado usando ESTRICTAMENTE la siguiente rúbrica:

1. Puntaje global: De 1 a 5 estrellas (número entero del 1 al 5).
   - 1 estrella: Agresivo, pasivo, insultos o ignora la técnica DESC por completo.
   - 2 estrellas: Contiene juicios graves, acusaciones directas ("tú eres irresponsable") o es excesivamente sumiso.
   - 3 estrellas: Cumple con algunos pasos pero mezcla juicios con hechos, o la sugerencia es vaga ("hazlo bien").
   - 4 estrellas: Muy buena aplicación, hechos claros, expresión en primera persona, sugerencia viable, beneficio mutuo claro. Pequeños detalles de precisión fáctica o temporal.
   - 5 estrellas: Impecable. Hechos observables al 100%, mensajes Yo impecables, propuesta específica con tiempos claros, consecuencias ganar-ganar constructivas.

2. Retroalimentación por paso (D, E, S, C):
   - Indica con franqueza qué hizo bien y en qué falló en cada una de las 4 fases.
   - Ejemplo de error a señalar: "En Describir usaste un juicio como 'eres flojo', cámbialo por un hecho observable como 'no enviaste el documento en la fecha fijada'".

3. Ejemplo de mejora: Muestra cómo habría sido la versión ideal desglosada y el mensaje completo integrado.
4. Cierre motivador: Pregunta si desea intentar con otro caso o ajustar su respuesta.
`;

    const prompt = `
CASO PRESENTADO:
${casePrompt}

RESPUESTA DEL ESTUDIANTE / USUARIO:
${fullSubmission}

Evalúa minuciosamente según la rúbrica y devuelve el resultado en formato JSON.
`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            puntajeGlobal: {
              type: Type.INTEGER,
              description: 'Calificación de 1 a 5 estrellas.',
            },
            retroalimentacionD: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING, description: 'Retroalimentación detallada de la fase Describir (hechos vs juicios).' },
              },
              required: ['status', 'feedback'],
            },
            retroalimentacionE: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING, description: 'Retroalimentación de la fase Expresar (1ra persona vs culpar).' },
              },
              required: ['status', 'feedback'],
            },
            retroalimentacionS: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING, description: 'Retroalimentación de la fase Sugerir (específico y viable vs vago).' },
              },
              required: ['status', 'feedback'],
            },
            retroalimentacionC: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['excelente', 'bueno', 'a_mejorar'] },
                feedback: { type: Type.STRING, description: 'Retroalimentación de la fase Consecuencias (ganar-ganar vs amenaza).' },
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
              description: 'Resumen de aciertos y trampas detectadas.',
            },
            mensajeMotivador: {
              type: Type.STRING,
              description: 'Cierre motivador invitando a reintentar o probar otro caso.',
            },
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

    // Graceful intelligent fallback if AI was busy
    const localEval = evaluateLocally(casePrompt, fullSubmission, breakdown);
    return res.json(localEval);
  } catch (error: any) {
    console.error('Error evaluating DESC, using local evaluation engine:', error);
    const localEval = evaluateLocally(req.body?.casePrompt || '', req.body?.userResponse || '', req.body?.breakdown);
    return res.json(localEval);
  }
});

// 3. GENERAR CASOS DE PRÁCTICA REALISTAS
app.post('/api/desc/generate-case', async (req: Request, res: Response) => {
  try {
    const { category, difficulty } = req.body;

    const systemInstruction = `
Eres "DESC Bot", creador de escenarios y casos de entrenamiento para estudiantes universitarios y profesionales jóvenes en comunicación asertiva.
Genera un caso breve, realista, de alta tensión cotidiana pero creíble (ej. trabajo en equipo, exposiciones, retrasos de entrega, desacuerdos de horarios, reparto de temas, dinámicas con profesores o jefes de práctica).
`;

    const prompt = `
Genera un nuevo caso práctico de entrenamiento en Técnica DESC.
Categoría preferida: ${category || 'Ámbito universitario general'}
Nivel de dificultad: ${difficulty || 'medio'}

Devuelve un JSON con el título, descripción detallada del conflicto, personajes involucrados, la trampa común de agresividad/pasividad en la que la gente suele caer, y 3-4 criterios clave que debe cumplir la solución DESC.
`;

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
    console.error('Error generating case, returning preset case:', error);
    const randomCase = PRESET_CASES[Math.floor(Math.random() * PRESET_CASES.length)];
    return res.json(randomCase);
  }
});

// 4. CHAT TUTOR INTERACTIVO CON DESC BOT
app.post('/api/desc/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'El historial de mensajes es requerido.' });
    }

    const lastMsg = messages[messages.length - 1]?.content || '';
    const lowerLast = lastMsg.toLowerCase();

    const systemInstruction = `
Eres "DESC Bot", un tutor interactivo y experto en comunicación asertiva especializado en la Técnica DESC (Describir, Expresar, Sugerir, Consecuencias).
Tu objetivo es guiar al usuario para resolver conflictos interpersonales y académicos con un enfoque claro, firme y respetuoso, sin caer en agresividad ni pasividad.

Tus normas fundamentales:
- Tono: Empático, constructivo, directo y conciso.
- Formato: Usa Markdown con negritas, listas y emojis didácticos para facilitar la lectura.
- Si el usuario te cuenta un conflicto: Desglósalo de inmediato en las 4 fases (D, E, S, C) y ofrécele el mensaje final unificado.
- Si el usuario te pide practicar o entrenar: Preséntale un caso breve y realista de ámbito universitario o guíalo hacia el simulador.
- Si el usuario tiene dudas conceptuales (ej. "¿Cómo no sonar grosero al decir que no?", "¿Cuál es la diferencia entre un juicio y un hecho?"): Respóndele con ejemplos contrastados de la vida real (Fórmula: "Lo que NO debes decir ❌ vs Lo que SÍ funciona con DESC ✔️").
`;

    // Map conversation history
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await callGeminiWithFallback({
      contents,
      config: {
        systemInstruction,
      },
    });

    if (response?.text) {
      return res.json({ reply: response.text });
    }

    // Fallback tutor answers tailored to popular questions
    let reply = '¡Hola! Te ayudo con la Técnica DESC:\n\n' +
      '• **D (Describir)**: Hechos observables ("Ayer a las 18:00 no llegó el archivo").\n' +
      '• **E (Expresar)**: Mensajes Yo ("Me preocupa la entrega").\n' +
      '• **S (Sugerir)**: Solución concreta ("¿Podrías subirlo antes de las 20:00?").\n' +
      '• **C (Consecuencias)**: Beneficio mutuo ("Así aseguramos la nota de todos").';

    if (lowerLast.includes('hecho') || lowerLast.includes('juicio') || lowerLast.includes('diferencia')) {
      reply = '### 🔍 Hechos vs. Juicios en la Fase D\n\n' +
        'El secreto de la asertividad es la **regla de la cámara de video**: solo puedes describir lo que una cámara registraría.\n\n' +
        '❌ **Juicio**: "Eres un irresponsable y no te importa el trabajo." *(Ataca la identidad y activa modo defensivo)*.\n' +
        '✔️ **Hecho**: "Ayer a las 18:00 no recibimos tu parte y no tuvimos respuesta en el chat grupal." *(Dato fáctico indiscutible)*.\n\n' +
        'Al usar hechos, la otra persona no puede negar lo ocurrido ni argumentar que la estás atacando.';
    } else if (lowerLast.includes('defensiva') || lowerLast.includes('enoja') || lowerLast.includes('grita')) {
      reply = '### 🛡️ ¿Qué hacer si la persona reacciona a la defensiva?\n\n' +
        '1. **Técnica del Disco Rayado**: Mantén la calma y repite tu objetivo sin subir el volumen: *"Comprendo que estés ocupado, pero necesitamos el borrador hoy a las 20:00 para no perder puntos."*\n' +
        '2. **Banco de Niebla (Fogging)**: Valida su emoción sin ceder en tu límite: *"Entiendo perfectamente que hayas tenido una semana pesada; aun así, el equipo necesita cerrar el informe hoy."*\n' +
        '3. **No muerdas el anzuelo**: Si te insulta o desvía el tema, regresa al hecho: *"No estamos discutiendo quién trabaja más, sino cómo entregar el informe a tiempo."*';
    } else if (lowerLast.includes('profesor') || lowerLast.includes('examen') || lowerLast.includes('nota')) {
      reply = '### 🎓 Cómo abordar a un profesor estricto con DESC\n\n' +
        '• **D**: *"Profesor, en la rúbrica del ensayo obtuve 12 puntos y no identifiqué comentarios específicos en la sección de conclusiones."*\n' +
        '• **E**: *"Tengo mucho interés en comprender mis oportunidades de mejora para los próximos entregables."*\n' +
        '• **S**: *"¿Sería posible contar con 5 minutos en sus horas de asesoría para revisar los puntos que debo reforzar?"*\n' +
        '• **C**: *"Así podré aplicar sus correcciones con total precisión en el proyecto final."*';
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in chat, using smart tutor fallback:', error);
    return res.json({
      reply: 'Recuerda que con la **Técnica DESC** convertimos reclamos en acuerdos:\n\n' +
        '1. **D (Describir)**: Registra la fecha, hora y acción puntual.\n' +
        '2. **E (Expresar)**: Di cómo te afecta en primera persona ("A mí me genera inquietud").\n' +
        '3. **S (Sugerir)**: Da una alternativa concreta con horario medible.\n' +
        '4. **C (Consecuencias)**: Muestra el beneficio mutuo ganar-ganar.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
