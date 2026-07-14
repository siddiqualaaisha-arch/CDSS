import React, { useState } from "react";
import { Brain, Sparkles, Check, CheckCircle2, User, Calendar, Activity } from "lucide-react";
import { MultiAgentResponse } from "../types";

interface DiagnosisViewProps {
  data: MultiAgentResponse | null;
}

export default function DiagnosisView({ data }: DiagnosisViewProps) {
  const diagnosis = data?.diagnosisAgent;
  const matchExplanation = diagnosis?.symptomMatching || "Airway hyper-responsiveness matches bronchial inflammation protocols under current clinical guidelines. Suspected asthma or post-infectious bronchial airway reactivity.";

  const diseases = diagnosis?.possibleDiseases || [
    {
      diseaseName: "Cough-Variant Asthma",
      confidence: "80%",
      rationale: "Persistent non-productive cough lasting longer than 14 days without high-grade infectious signs, matching GINA guidelines.",
      recommendedTests: ["Spirometry / FVC", "Methacholine Challenge Test", "Peak Flow Monitoring"]
    },
    {
      diseaseName: "Post-Viral Bronchial Hyper-reactivity",
      confidence: "65%",
      rationale: "Lingering dry bronchial coughing commonly observed following standard acute rhinovirus clearance.",
      recommendedTests: ["Clinical Symptom Logs", "Trial bronchodilator therapy"]
    },
    {
      diseaseName: "Gastroesophageal Reflux Disease (GERD) Cough",
      confidence: "35%",
      rationale: "Extra-esophageal gastric micro-aspiration triggering cough-reflux laryngeal pathways.",
      recommendedTests: ["Empiric PPI trial", "24h pH monitoring"]
    }
  ];

  // Interactive checkable list of tests
  const initialTests = Array.from(new Set(diseases.flatMap(d => d.recommendedTests)));
  const [checkedTests, setCheckedTests] = useState<Record<string, boolean>>({});

  const toggleTest = (test: string) => {
    setCheckedTests(prev => ({
      ...prev,
      [test]: !prev[test]
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Active Patient Banner */}
      {data && (
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#08332E]" />
              <span className="text-xs text-[#8C877A] font-bold uppercase tracking-wider">Active Patient:</span>
              <span className="text-xs font-black text-[#08332E]">{data.patientName || "Aisha Siddiqua"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#08332E]" />
              <span className="text-xs text-[#8C877A] font-bold uppercase tracking-wider">Age/Gender:</span>
              <span className="text-xs font-bold text-[#08332E]">{data.age || 34} y/o ({data.gender || "Female"})</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#08332E]" />
              <span className="text-xs text-[#8C877A] font-bold uppercase tracking-wider">Complaint:</span>
              <span className="text-xs font-bold text-[#635F54] max-w-[200px] md:max-w-[350px] truncate" title={data.complaint || "Persistent dry cough..."}>
                {data.complaint || "Persistent dry cough..."}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#8C877A] bg-white px-2 py-1 rounded border border-[#E4DFD5]">
            MRN: PATIENT_{data.caseId?.replace("REG-", "") || "001"}
          </span>
        </div>
      )}
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7C4DFF]/10 flex items-center justify-center text-[#7C4DFF]">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-[#08332E]">
              Differential Diagnosis & Clinical Guidelines
            </h3>
            <p className="font-sans text-xs text-[#635F54] mt-0.5">
              Formulates clinical differential probabilities, outlines rationale, and suggests confirmatory pathways.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
          {diagnosis?.failoverTriggered && (
            <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-red-700 uppercase tracking-wider border border-red-100 animate-pulse">
              ⚠️ Backup Specialist Active
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-[#7C4DFF]/5 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#7C4DFF] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Diagnosis Active (Conf: {data?.agentConfidences?.diagnosisAgent || 88}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Differential Diagnosis list */}
        <div className="lg:col-span-8 space-y-4">
          
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
            Differential Diagnosis Matches
          </h4>

          {diseases.map((d, i) => {
            const confInt = parseInt(d.confidence) || 50;
            // Determine progress bar colors
            const barColor = confInt >= 80 ? "bg-emerald-600" : confInt >= 50 ? "bg-amber-500" : "bg-red-500";

            return (
              <div key={i} className="bg-white border border-[#E4DFD5] rounded-2xl p-5 shadow-xs space-y-4">
                
                {/* Header title & confidence */}
                <div className="flex items-center justify-between gap-4">
                  <h5 className="font-sans font-bold text-sm text-[#08332E]">
                    {d.diseaseName}
                  </h5>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-[#635F54]">
                      {d.confidence}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                      confInt >= 80 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                      confInt >= 50 ? "bg-amber-50 text-amber-800 border border-amber-200" :
                      "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {confInt >= 80 ? "PRIMARY" : confInt >= 50 ? "PROBABLE" : "POSSIBLE"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#E4DFD5]/40 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: d.confidence }} />
                </div>

                {/* Rationale and clinical guidance */}
                <div className="space-y-1">
                  <span className="block font-sans font-bold text-[9px] uppercase tracking-wider text-[#8C877A]">
                    Clinical Rationale & Symptom Correspondence
                  </span>
                  <p className="font-sans text-xs text-[#635F54] leading-relaxed">
                    {d.rationale}
                  </p>
                </div>

                {/* Recommended tests preview */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[9px] uppercase font-bold text-[#8C877A] mr-1.5">Tests:</span>
                  {d.recommendedTests.map((t, idx) => (
                    <span key={idx} className="bg-[#FAF8F5] border border-[#E4DFD5]/80 text-[#635F54] px-2.5 py-1 rounded text-[10px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

        {/* Right: Symptom guidelines match + checkable test checklist */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Clinical Guidelines Match */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
              Symptom Guidelines Matching
            </h4>
            <p className="font-sans text-xs text-[#635F54] leading-relaxed">
              {matchExplanation}
            </p>
          </div>

          {/* Interactive Test Checklist */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Actionable Diagnostics Checklist
            </h4>
            <p className="font-sans text-[11px] text-[#8C877A] leading-relaxed">
              Check the recommended diagnostic evaluations once performed to track patient intake completeness.
            </p>

            <div className="space-y-2 pt-1.5">
              {initialTests.map((test, i) => {
                const isChecked = !!checkedTests[test];
                return (
                  <div
                    key={i}
                    onClick={() => toggleTest(test)}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-150 ${
                      isChecked 
                        ? "bg-emerald-50/50 border-emerald-300 text-emerald-950 font-medium" 
                        : "bg-white border-[#E4DFD5]/80 hover:border-[#C4BEB3] text-[#635F54]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isChecked ? "bg-[#00A254] border-[#00A254] text-white" : "bg-white border-[#E4DFD5]"
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-sans text-xs select-none">
                      {test}
                    </span>
                  </div>
                );
              })}
            </div>

            {Object.values(checkedTests).filter(Boolean).length === initialTests.length && initialTests.length > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium mt-4 animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>All diagnostic steps configured & validated!</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
