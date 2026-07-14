export interface PatientAgentData {
  summary: string;
  chatResponse: string;
  questionsAsked: string[];
  failoverTriggered?: boolean;
}

export interface DiseaseInfo {
  diseaseName: string;
  confidence: string;
  rationale: string;
  recommendedTests: string[];
}

export interface DiagnosisAgentData {
  possibleDiseases: DiseaseInfo[];
  symptomMatching: string;
  failoverTriggered?: boolean;
}

export interface EmergencyAgentData {
  riskLevel: "CRITICAL" | "MODERATE" | "LOW" | string;
  isEmergency: boolean;
  triageDetails: string;
  alertDispatched: boolean;
  hospitalDoctorNotification: string;
  failoverTriggered?: boolean;
}

export interface RecordsAgentData {
  ehrHistoryMatched: string;
  newRecordSummary: string;
  reportCode: string;
  failoverTriggered?: boolean;
}

export interface MedicineReminder {
  medName: string;
  dosage: string;
  frequency: string;
  purpose: string;
}

export interface SchedulingAgentData {
  appointmentNeeded: boolean;
  recommendedSpecialist: string;
  suggestedTime: string;
  medicineReminders: MedicineReminder[];
  failoverTriggered?: boolean;
}

export interface MultiAgentResponse {
  patientAgent: PatientAgentData;
  diagnosisAgent: DiagnosisAgentData;
  emergencyAgent: EmergencyAgentData;
  recordsAgent: RecordsAgentData;
  schedulingAgent: SchedulingAgentData;
  caseId?: string;
  allergies?: string;
  currentMeds?: string;
  patientName?: string;
  age?: number;
  gender?: string;
  complaint?: string;
  agentConfidences?: {
    patientAgent: number;
    diagnosisAgent: number;
    emergencyAgent: number;
    recordsAgent: number;
    schedulingAgent: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
}
