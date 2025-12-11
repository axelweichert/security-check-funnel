export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// von Busch Security Funnel Lead Type
export interface Lead {
  id: string;
  createdAt: number;
  company: string;
  contact: string;
  employeesRange: string;
  email: string;
  phone: string;
  role?: string;
  notes?: string;
  consent: boolean;
  scoreSummary: {
    areaA: number;
    areaB: number;
    areaC: number;
    average: number;
  };
}