export interface DescBreakdown {
  describir: string;
  expresar: string;
  sugerir: string;
  consecuencias: string;
  mensajeCompleto: string;
  analisisErroresEvitados?: string[];
  consejosEntrega?: string;
}

export type StepFeedbackStatus = 'excelente' | 'bueno' | 'a_mejorar';

export interface StepFeedback {
  status: StepFeedbackStatus;
  feedback: string;
}

export interface PracticeEvaluation {
  puntajeGlobal: number; // 1 to 5
  retroalimentacionD: StepFeedback;
  retroalimentacionE: StepFeedback;
  retroalimentacionS: StepFeedback;
  retroalimentacionC: StepFeedback;
  ejemploMejora: DescBreakdown;
  puntosClave: string[];
  mensajeMotivador: string;
}

export interface PracticeCase {
  id: string;
  titulo: string;
  categoria: string;
  dificultad: 'facil' | 'medio' | 'desafiante';
  descripcionCaso: string;
  personajes: string;
  trampaComun: string;
  criteriosEvaluacion: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface UserStats {
  casesCompleted: number;
  totalScore: number;
  highScore: number;
  streak: number;
}
