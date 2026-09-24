import { PracticeCase } from '../types/desc';

export const INITIAL_CASES: PracticeCase[] = [
  {
    id: 'case-1',
    titulo: 'Retraso crítico en la entrega del informe final grupal',
    categoria: 'Entregas Grupales',
    dificultad: 'medio',
    descripcionCaso:
      'Faltan solo 18 horas para el cierre definitivo de la plataforma virtual. El proyecto grupal representa el 40% del curso. Acordaron por unanimidad enviar sus partes el martes a las 18:00 para compilar. Es miércoles por la tarde, Juan no ha enviado su sección y no ha contestado los últimos 3 mensajes en el grupo.',
    personajes: 'Tú (coordinador o integrante del equipo) y Juan (compañero ausente).',
    trampaComun:
      'Escribirle furioso: "Eres un irresponsable, si no mandas nada en 10 minutos te saco del informe y le aviso al profesor". (Agresivo)',
    criteriosEvaluacion: [
      'Describir: Citar el plazo acordado (martes 18:00) y el hecho exacto de que la sección aún no está en la carpeta.',
      'Expresar: Hablar del impacto en la nota del equipo y la preocupación en primera persona ("Me preocupa...", "Nos genera incertidumbre...").',
      'Sugerir: Fijar una hora límite inmediata (ej. "antes de las 20:00 hoy") o consultar si tuvo un imprevisto específico.',
      'Consecuencias: Explicar el beneficio de incluirlo a tiempo versus la consecuencia natural de enviar sin su nombre si no hay entrega.',
    ],
  },
  {
    id: 'case-2',
    titulo: 'Desbalance en la repartición de temas para la exposición',
    categoria: 'Exposiciones',
    dificultad: 'facil',
    descripcionCaso:
      'En la reunión de preparación para la exposición final, Laura decidió unilateralmente encargarse de la portada e introducción (que duran 1 minuto en total) y te asignó a ti todo el marco conceptual y los casos de estudio (que toman 8 minutos), justificando que "a ti se te da más fácil exponer frente a la clase". Sientes que la evaluación individual se verá perjudicada.',
    personajes: 'Tú y Laura (compañera de exposición).',
    trampaComun:
      'Aceptar en silencio con resignación y resentimiento (Pasivo) o decirle "Qué viva eres, siempre te quedas con lo más fácil" (Agresivo).',
    criteriosEvaluacion: [
      'Describir: Comparar objetivamente los tiempos estimados (1 min vs 8 min) y la cantidad de diapositivas asignadas.',
      'Expresar: Manifestar la incomodidad con la disparidad de carga y el deseo de que ambos demuestren dominio.',
      'Sugerir: Proponer una división equitativa de tiempo (ej. 4 a 5 minutos cada uno repartiendo casos).',
      'Consecuencias: Destacar que el docente valora la complementariedad y que ambos obtendrán una mejor calificación.',
    ],
  },
  {
    id: 'case-3',
    titulo: 'Compañero que interrumpe e invalida opiniones en Zoom',
    categoria: 'Reuniones de Equipo',
    dificultad: 'medio',
    descripcionCaso:
      'Durante las reuniones virtuales de coordinación, cada vez que comienzas a plantear tu propuesta de metodología, Carlos te interrumpe a mitad de frase diciendo cosas como "no, eso no sirve, escuchen lo mío". Esto ha sucedido en 3 ocasiones distintas hoy y te impide exponer tus argumentos.',
    personajes: 'Tú y Carlos (integrante del equipo).',
    trampaComun:
      'Gritarle "¡Cállate la boca y respeta!" o desconectarte de la llamada y desentenderte del proyecto.',
    criteriosEvaluacion: [
      'Describir: Señalar el momento fáctico de la interrupción en tiempo real de forma serena ("Carlos, estaba a la mitad de explicar el punto 2 cuando tomaste la palabra").',
      'Expresar: Compartir la dificultad para concluir la idea y cómo fragmenta la discusión.',
      'Sugerir: Pedir 2 minutos ininterrumpidos para terminar la idea y luego abrir el espacio para sus comentarios.',
      'Consecuencias: Resaltar que escuchar todas las propuestas completas permite tomar la mejor decisión para el equipo.',
    ],
  },
  {
    id: 'case-4',
    titulo: 'Discrepancia en la calificación con un docente universitario',
    categoria: 'Relación con Docentes',
    dificultad: 'desafiante',
    descripcionCaso:
      'Te entregaron la nota de la monografía de mitad de ciclo. Obtuviste 11/20, pero en la hoja de rúbrica no hay ninguna observación, corrección ni justificación de puntaje. Revisaste la guía y tu trabajo cumple con las 15 referencias bibliográficas en formato APA y la estructura exigida.',
    personajes: 'Tú y el Docente del curso.',
    trampaComun:
      'Mandar un correo diciendo "Profesor, usted me calificó injustamente porque no leyó mi trabajo" o no reclamar nada por miedo a represalias.',
    criteriosEvaluacion: [
      'Describir: Mencionar el curso, la monografía entregada, la nota de 11 y el hecho de que la rúbrica no detalla observaciones.',
      'Expresar: Enfatizar el interés por entender las áreas de mejora académica y el esfuerzo dedicado al documento.',
      'Sugerir: Solicitar amablemente 10 minutos durante sus horas de asesoría o por correo para revisar los puntos de retroalimentación.',
      'Consecuencias: Mostrar la disposición a aprender de las observaciones para aplicarlas con rigor en el examen final.',
    ],
  },
  {
    id: 'case-5',
    titulo: 'Ghosting y falta de comunicación en el grupo de chat',
    categoria: 'Comunicación en Equipo',
    dificultad: 'facil',
    descripcionCaso:
      'Escribiste al grupo de WhatsApp hace 2 días preguntando qué horario tienen libre para ensayar la presentación del viernes. Tres integrantes leyeron el mensaje (figura doble check azul), pero nadie respondió nada.',
    personajes: 'Tú y el grupo de trabajo.',
    trampaComun:
      'Enviar stickers sarcásticos, insultar al grupo ("son unos fantasmas") o asumir todo el trabajo sin consultar.',
    criteriosEvaluacion: [
      'Describir: Citar el mensaje enviado hace 48 horas sobre el ensayo y la falta de confirmación de horario.',
      'Expresar: Compartir la urgencia y el estrés de coordinar a última hora con el ensayo pendiente.',
      'Sugerir: Proponer dos opciones fijas de horario (ej. "Jueves 17:00 o 20:00") y pedir que voten con una reacción antes de las 14:00.',
      'Consecuencias: Asegurar que con solo 30 minutos de ensayo coordinado la presentación saldrá fluida y con alta nota.',
    ],
  },
];
