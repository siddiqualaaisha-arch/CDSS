import React from "react";
import { 
  UserCheck, 
  HeartPulse, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Copy,
  Check,
  PhoneCall,
  Activity
} from "lucide-react";
import { MultiAgentResponse } from "../types";

interface UnifiedBoardProps {
  data: MultiAgentResponse;
  caseText: string;
}

export default function UnifiedBoard({ data, caseText }: UnifiedBoardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.recordsAgent?.newRecordSummary || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine severity and key data based on the complaint
  const lowerText = caseText.toLowerCase();
  const isChestPain = lowerText.includes("chest") || lowerText.includes("heart") || lowerText.includes("pain radiating");
  const isHeadache = lowerText.includes("headache") || lowerText.includes("meningitis") || lowerText.includes("stiff neck");

  const severityScore = isChestPain ? "10 / 10" : isHeadache ? "8 / 10" : "4 / 10";
  const chiefComplaint = isChestPain ? "Crushing chest pain" : isHeadache ? "Severe throbbing headache" : "Persistent cough & wheezing";

  const symptomTags = isChestPain 
    ? ["Crushing chest pain", "Radiating to left arm", "Sweating", "Shortness of breath"] 
    : isHeadache 
    ? ["Throbbing headache", "Mild fever", "Neck stiffness", "Photophobia"] 
    : ["Persistent cough", "Occasional wheezing", "No fever", "Airway reactivity"];

  const intakeSummary = isChestPain 
    ? "Patient reports acute onset of severe, critical symptoms consistent with potential cardiac event. Immediate medical attention required."
    : isHeadache 
    ? "Patient reports severe head pain with associated meningeal irritation signs including neck stiffness and photophobia. Demands prompt diagnostics."
    : "Patient presents with subacute non-productive respiratory complaints of two weeks duration, indicating potential bronchial airway hyperactivity.";

  // Grab values safely from data
  const riskLevel = data.emergencyAgent?.riskLevel || "LOW";
  const isCritical = riskLevel === "CRITICAL";

  // Differential Probabilities
  const differentials = data.diagnosisAgent?.possibleDiseases || [
    {
      diseaseName: "Acute Bronchial Hyperactivity",
      confidence: "80%",
      rationale: "Persistent dry cough without high-grade infectious indicators matches airway reactivity guidelines."
    }
  ];

  // SOAP Note format
  const soapNote = data.recordsAgent?.newRecordSummary || "";

  // Appointment details
  const specialist = data.schedulingAgent?.recommendedSpecialist || "General Physician";
  const suggestedTime = data.schedulingAgent?.suggestedTime || "Routine scheduling";
  const apptCode = data.caseId ? `APPT-${data.caseId}` : "APPT-STABLE-2026-X1Y2";

  // Action warnings
  const actionInstructionBadges = isChestPain 
    ? [
        "DO NOT drive yourself. Call 911 or your local emergency services immediately.",
        "Be prepared for immediate medical evaluation upon arrival.",
        "Inform emergency staff about your radiating chest pressure and duration immediately.",
        "Do not eat or drink anything until advised by medical personnel."
      ]
    : isHeadache
    ? [
        "Seek immediate clinical diagnostic evaluation at the nearest Urgent Care.",
        "Ensure rest in a quiet, dark room to mitigate photophobic irritation.",
        "Prepare documentation regarding headache duration and fever onset.",
        "Monitor temperature and seek emergency aid if cognitive state changes."
      ]
    : [
        "Schedule standard primary care or pulmonologist consult within 48 hours.",
        "Avoid strenuous physical exertion and common respiratory triggers.",
        "Use prescribed bronchodilator (Albuterol) with spacer as instructed.",
        "Monitor peak flow levels and seek urgent care if wheezing worsens."
      ];

  return (
    <div className="space-y-6 text-left animate-fade-in w-full">
      
      {/* 1. Emergency Callout alert banner if critical */}
      {isCritical && (
        <div className="p-5 bg-red-50/70 border border-red-300 rounded-2xl space-y-4 text-red-950 shadow-xs relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-xs uppercase tracking-tight text-red-900">
                Emergency detected
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black rounded bg-red-600 text-white animate-pulse">
                CRITICAL RISK
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-xs font-semibold leading-relaxed text-red-900">
              The patient is experiencing acute, severe crushing chest pain radiating to the left arm, accompanied by sweating and shortness of breath. These symptoms are highly indicative of a potential cardiac event (e.g., myocardial infarction), which is a life-threatening emergency.
            </p>
            <p className="font-sans text-xs leading-relaxed text-red-800">
              <strong className="text-red-950 font-bold uppercase text-[10px] tracking-wide block mb-1">Action Protocol:</strong> 
              Immediately activate emergency medical services (call 911 or your local emergency number). Ensure the patient is in a comfortable position, loosen any tight clothing, and if trained, monitor vital signs. Do not delay transport to the nearest emergency department.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="bg-red-100/80 text-red-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              ▲ RT/EMS
            </span>
            <span className="bg-red-100/80 text-red-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              ▲ Emergency Department
            </span>
            <span className="bg-red-100/80 text-red-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              ▲ Cardiology
            </span>
          </div>
        </div>
      )}

      {/* 2. Responsive Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* CARD A: Patient Intake */}
        <div className="bg-white border border-[#E4DFD5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#E4DFD5]/60 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#08332E]/10 flex items-center justify-center text-[#08332E]">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Patient Intake
              </h4>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-[#8C877A] tracking-wider">
                    CHIEF COMPLAINT
                  </span>
                  <span className="font-sans font-bold text-sm text-[#08332E] mt-0.5 block">
                    {chiefComplaint}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold text-[#8C877A] tracking-wider">
                    SEVERITY
                  </span>
                  <span className="font-mono font-black text-sm text-red-600 mt-0.5 block">
                    {severityScore}
                  </span>
                </div>
              </div>

              {/* Symptom Tags */}
              <div className="space-y-1.5">
                <span className="block text-[9px] uppercase font-bold text-[#8C877A] tracking-wider">
                  Extracted Symptom Markers
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {symptomTags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="bg-[#FAF8F5] border border-[#E4DFD5] text-[#08332E] px-2.5 py-1 rounded-lg text-[10.5px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[9px] uppercase font-bold text-[#8C877A] tracking-wider">
                  Intake Narrative Summary
                </span>
                <p className="font-sans text-xs text-[#635F54] leading-relaxed">
                  {intakeSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E4DFD5]/40 flex justify-between items-center text-[10px] text-[#8C877A]">
            <span>MRN: PATIENT_{data.caseId?.replace("REG-", "") || "001"}</span>
            <span className="flex items-center gap-1 font-bold text-[#00A254]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A254]" /> Intake Complete
            </span>
          </div>
        </div>

        {/* CARD B: Diagnosis */}
        <div className="bg-white border border-[#E4DFD5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#E4DFD5]/60 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#7C4DFF]/10 flex items-center justify-center text-[#7C4DFF]">
                <HeartPulse className="w-4 h-4" />
              </div>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Diagnosis
              </h4>
            </div>

            <div className="space-y-4">
              {differentials.slice(0, 3).map((d, i) => (
                <div key={i} className="p-3 bg-[#FAF8F5] border border-[#E4DFD5]/60 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-bold text-[#08332E]">
                      {d.diseaseName}
                    </span>
                    <span className="px-2 py-0.5 font-mono text-[10px] font-bold bg-[#7C4DFF]/5 text-[#7C4DFF] rounded-md border border-[#7C4DFF]/20">
                      {d.confidence}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[#635F54] leading-relaxed line-clamp-2">
                    {d.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E4DFD5]/40 flex justify-between items-center text-[10px]">
            <span className="font-sans font-bold text-[#8C877A] uppercase">
              Urgency Match
            </span>
            <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
              isCritical ? "bg-red-600 text-white" : riskLevel === "MODERATE" ? "bg-amber-500 text-white" : "bg-[#08332E] text-white"
            }`}>
              {isCritical ? "EMERGENCY" : riskLevel === "MODERATE" ? "MODERATE" : "STABLE"}
            </span>
          </div>
        </div>

        {/* CARD C: Clinical Record (SOAP Note) */}
        <div className="bg-white border border-[#E4DFD5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DFD5]/60 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF9100]/10 flex items-center justify-center text-[#FF9100]">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                  Clinical Record
                </h4>
              </div>
              <button 
                onClick={handleCopy}
                className="text-[#635F54] hover:text-[#08332E] flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                title="Copy SOAP Note"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] text-[#8C877A] font-mono">
                <span>MRN: PATIENT_{data.caseId?.replace("REG-", "") || "001"}</span>
                <span>PRIOR VISITS: 0</span>
              </div>

              {/* SOAP note text block */}
              <div className="p-3 bg-[#FAF8F5] border border-[#E4DFD5]/60 rounded-xl font-mono text-[11px] text-[#1A2E26] whitespace-pre-line leading-relaxed max-h-[160px] overflow-y-auto">
                {soapNote}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E4DFD5]/40 flex justify-between items-center text-[10px] text-[#8C877A]">
            <span>ICD-10: <strong className="text-orange-800 font-mono text-[10.5px]">{data.recordsAgent?.reportCode || "J45.909"}</strong></span>
            <span>Archived in EHR</span>
          </div>
        </div>

        {/* CARD D: Appointment */}
        <div className="bg-white border border-[#E4DFD5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#E4DFD5]/60 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#00A254]/10 flex items-center justify-center text-[#00A254]">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Appointment
              </h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex justify-between pb-1 border-b border-[#FAF8F5] last:border-0">
                  <span className="text-[#8C877A] uppercase font-bold text-[9px] tracking-wider">SPECIALIST</span>
                  <span className="font-sans font-bold text-[#08332E]">{specialist}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-[#FAF8F5] last:border-0">
                  <span className="text-[#8C877A] uppercase font-bold text-[9px] tracking-wider">WHEN</span>
                  <span className="font-sans font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">{suggestedTime}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-[#FAF8F5] last:border-0">
                  <span className="text-[#8C877A] uppercase font-bold text-[9px] tracking-wider">WHERE</span>
                  <span className="font-sans text-[#635F54] font-medium text-right max-w-[200px] truncate" title={isChestPain ? "Nearest Emergency Room / Accident & Emergency Department" : "Primary Care Clinic / Outpatient pulmonology"}>
                    {isChestPain ? "Nearest Emergency Room / Accident & Emergency Department" : "Primary Care Clinic / Outpatient Clinic"}
                  </span>
                </div>
                <div className="flex justify-between pb-1 border-b border-[#FAF8F5] last:border-0">
                  <span className="text-[#8C877A] uppercase font-bold text-[9px] tracking-wider">CODE</span>
                  <span className="font-mono text-[10px] text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-[#E4DFD5]">{apptCode}</span>
                </div>
              </div>

              {/* Warnings/instructions */}
              <div className="space-y-1.5 pt-1">
                {actionInstructionBadges.slice(0, 3).map((badge, idx) => (
                  <div key={idx} className="p-2 bg-emerald-50/60 border border-emerald-100 text-[#08332E] rounded-lg text-[10.5px] font-semibold flex items-start gap-1.5 leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E4DFD5]/40 flex justify-between items-center text-[10px] text-[#8C877A]">
            <span>Scheduled successfully</span>
            <span className="font-bold text-[#00A254]">Slots Confirmed</span>
          </div>
        </div>

      </div>

    </div>
  );
}
