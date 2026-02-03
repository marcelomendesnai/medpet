
export interface Medication {
  id: string;
  subjectName: string; // The person or pet (e.g., "Sijugrino" or "Lua")
  name: string;
  dosage: string;
  frequency: string; // "24h", "12h", "8h", etc.
  timeSlots: string[]; // List of calculated times
  obs1: string; // e.g., "Em Jejum"
  obs2: string; // e.g., "Dar 2ml de água"
  periodDays: number;
  startDate: string;
  status: 'active' | 'paused';
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  subjectName: string;
  timestamp: number;
  timeSlot: string; // The specific scheduled time this log refers to
  status: 'taken' | 'skipped';
}

export type ViewState = 'today' | 'meds' | 'history' | 'assistant';
