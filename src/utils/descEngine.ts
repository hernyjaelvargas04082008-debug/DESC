/**
 * Motor de comunicación asertiva DESC local inteligente
 * Proporciona generación, evaluación y tutoría inmediata
 * Sirve como motor directo o respaldo de alta disponibilidad si la API remota no está accesible.
 */

import { DescBreakdown, PracticeEvaluation, PracticeCase } from '../types/desc';
import { INITIAL_CASES } from '../data/presetCases';

export function buildLocalDesc(conflict: string, tone: 'cercano' | 'formal' | 'directo' = 'cercano', context?: string): DescBreakdown {
  const cleanConflict = conflict.trim();
  const lower = cleanConflict.toLowerCase();

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
      'Se eliminaron acusaciones destructivas o adjetivos calificativos ("irresponsable", "flojo").',
      'Se sustituyeron términos absolutos ("siempre", "nunca") por hechos fácticos comprobables.',
      'Se comunicó el impacto en primera persona ("Me preocupa") sin proyectar culpa directa.',
      'Se planteó una propuesta ganar-ganar con horario o acción concreta.',
    ],
    consejosEntrega: tone === 'formal'
      ? 'Envía la solicitud a través del correo institucional o solicita una breve reunión en horario de asesoría académica.'
      : 'Conversa en privado por chat personal o llamada breve, evitando exponer el asunto en el grupo general.',
  };
}

export function evaluateLocally(promptText: string, submissionText: string, breakdown?: { d?: string; e?: string; s?: string; c?: string }): PracticeEvaluation {
  const text = `${submissionText || ''} ${breakdown?.d || ''} ${breakdown?.e || ''} ${breakdown?.s || ''} ${breakdown?.c || ''}`.toLowerCase();

  const toxicWords = ['irresponsable', 'flojo', 'vago', 'inútil', 'malo', 'idiota', 'estúpido', 'siempre', 'nunca', 'culpa tuya'];
  const hasToxicWords = toxicWords.some((w) => text.includes(w));

  const dKeywords = ['ayer', 'martes', 'miércoles', 'hora', 'minuto', 'acordamos', 'fecha', 'plazo', 'reunión', 'avance', 'drive', 'documento', 'rúbrica', 'nota'];
  const hasD = Boolean(breakdown?.d?.trim()) || dKeywords.some((w) => text.includes(w));

  const eKeywords = ['yo siento', 'siento', 'me preocupa', 'me genera', 'a mí', 'nosotros', 'me frustra', 'inquietud', 'deseo'];
  const hasE = Boolean(breakdown?.e?.trim()) || eKeywords.some((w) => text.includes(w));

  const sKeywords = ['propongo', 'te sugiero', 'podrías', 'antes de', 'a las', 'revisemos', 'dividamos', 'minutos', 'reunión', 'enviar'];
  const hasS = Boolean(breakdown?.s?.trim()) || sKeywords.some((w) => text.includes(w));

  const cKeywords = ['así', 'de esta manera', 'beneficio', 'ambos', 'equipo', 'nota', 'tiempo', 'calma', 'éxito', 'aprobar'];
  const hasC = Boolean(breakdown?.c?.trim()) || cKeywords.some((w) => text.includes(w));

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
        ? 'Cuidado: detectamos calificativos que provocan actitud defensiva. Enfócate exclusivamente en hechos verificables (fechas, horas, acuerdos).'
        : 'Bien planteada la situación observable sin emitir juicios de valor destructivos.',
    },
    retroalimentacionE: {
      status: hasE ? 'excelente' : 'bueno',
      feedback: hasE
        ? 'Excelente uso de Mensajes Yo ("Me preocupa", "Siento inquietud") asumiendo tus emociones sin proyectar culpa directa.'
        : 'Recuerda expresar explícitamente el impacto emocional en primera persona ("Yo siento...", "Me preocupa...") para generar empatía.',
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

export function getRandomPresetCase(): PracticeCase {
  return INITIAL_CASES[Math.floor(Math.random() * INITIAL_CASES.length)];
}

export function getLocalChatReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('hecho') || lower.includes('juicio') || lower.includes('diferencia')) {
    return '### 🔍 Hechos vs. Juicios en la Fase D\n\n' +
      'El secreto de la asertividad es la **regla de la cámara de video**: solo puedes describir lo que una cámara registraría.\n\n' +
      '❌ **Juicio**: *"Eres un irresponsable y no te importa el trabajo."* (Ataca la identidad y activa modo defensivo).\n' +
      '✔️ **Hecho**: *"Ayer a las 18:00 no recibimos tu parte y no tuvimos respuesta en el chat grupal."* (Dato fáctico indiscutible).\n\n' +
      'Al usar hechos, la otra persona no puede negar lo ocurrido ni argumentar que la estás atacando.';
  }

  if (lower.includes('defensiva') || lower.includes('enoja') || lower.includes('grita') || lower.includes('molesta')) {
    return '### 🛡️ ¿Qué hacer si la persona reacciona a la defensiva?\n\n' +
      '1. **Técnica del Disco Rayado**: Mantén la calma y repite tu objetivo sin subir el volumen: *"Comprendo que estés ocupado, pero necesitamos el borrador hoy a las 20:00 para no perder puntos."*\n' +
      '2. **Banco de Niebla (Fogging)**: Valida su emoción sin ceder en tu límite: *"Entiendo perfectamente que hayas tenido una semana pesada; aun así, el equipo necesita cerrar el informe hoy."*\n' +
      '3. **No muerdas el anzuelo**: Si te insulta o desvía el tema, regresa al hecho: *"No estamos discutiendo quién trabaja más, sino cómo entregar el informe a tiempo."*';
  }

  if (lower.includes('profesor') || lower.includes('examen') || lower.includes('nota') || lower.includes('docente')) {
    return '### 🎓 Cómo abordar a un profesor estricto con DESC\n\n' +
      '• **D**: *"Profesor, en la rúbrica del ensayo obtuve 12 puntos y no identifiqué comentarios específicos en la sección de conclusiones."*\n' +
      '• **E**: *"Tengo mucho interés en comprender mis oportunidades de mejora para los próximos entregables."*\n' +
      '• **S**: *"¿Sería posible contar con 5 minutos en sus horas de asesoría para revisar los puntos que debo reforzar?"*\n' +
      '• **C**: *"Así podré aplicar sus correcciones con total precisión en el proyecto final."*';
  }

  return 'Recuerda que con la **Técnica DESC** convertimos reclamos en acuerdos:\n\n' +
    '1. **D (Describir)**: Registra la fecha, hora y acción puntual sin juicios.\n' +
    '2. **E (Expresar)**: Di cómo te afecta en primera persona (*"A mí me genera inquietud"*).\n' +
    '3. **S (Sugerir)**: Da una alternativa concreta con horario medible.\n' +
    '4. **C (Consecuencias)**: Muestra el beneficio mutuo ganar-ganar.\n\n' +
    '¿Tienes una situación específica que quieras estructurar? Cuéntamela y te ayudo paso a paso.';
}
