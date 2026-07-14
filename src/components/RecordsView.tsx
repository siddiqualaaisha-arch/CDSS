import React, { useState } from "react";
import { FileText, Copy, Check, Sparkles, FolderOpen, HeartHandshake, User, Calendar, Activity } from "lucide-react";
import { MultiAgentResponse } from "../types";

interface RecordsViewProps {
  data: MultiAgentResponse | null;
}

export default function RecordsView({ data }: RecordsViewProps) {
  const records = data?.recordsAgent;
  const matchHistory = records?.ehrHistoryMatched || "Patient demographic check matches primary record history: Female, 34, allergic rhinitis history, currently stable, non-smoker, with no historic cardiorespiratory complaints.";
  const billingCode = records?.reportCode || "ICD-10: J45.909 (Unspecified asthma, uncomplicated)";
  const soapNote = records?.newRecordSummary || "SOAP NOTES\nS — Subjective: Dry cough for 14 days, occasional wheezing. No fever, sore throat, or sinus pressure reported.\nO — Objective: Patient alert and breathing comfortably. Vital estimates: HR 76, BP 120/78, SpO2 99%, Temp 36.8°C.\nA — Assessment: Non-acute bronchial airway reactivity vs cough-variant asthma.\nP — Plan: Pulmonology referral, outpatient spirometry diagnostic scheduling, prescribe Albuterol Inhaler (90mcg) and spacer.";

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(soapNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-[#08332E]">
              Clinical Records & Documentation
            </h3>
            <p className="font-sans text-xs text-[#635F54] mt-0.5">
              Drafts professional clinical SOAP notes and suggests appropriate ICD billing codes based on active patient diagnostics.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
          {records?.failoverTriggered && (
            <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-red-700 uppercase tracking-wider border border-red-100 animate-pulse">
              ⚠️ Backup Archivist Active
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Records Active (Conf: {data?.agentConfidences?.recordsAgent || 95}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: EHR Matches & SOAP Note Display */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SOAP note card */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs relative">
            <div className="flex justify-between items-center pb-2 border-b border-[#E4DFD5]/60">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Generated SOAP Clinical Progress Notes
              </h4>
              <button
                onClick={handleCopyToClipboard}
                className="p-2 border border-[#E4DFD5] rounded-xl text-xs font-semibold text-[#635F54] hover:text-[#08332E] hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Copy SOAP note to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Soap draft area */}
            <div className="p-5 bg-[#FAF8F5] border border-[#E4DFD5]/70 rounded-xl font-mono text-xs text-[#1A2E26] whitespace-pre-line leading-relaxed h-[360px] overflow-y-auto">
              {soapNote}
            </div>

            {copied && (
              <div className="absolute top-16 right-6 p-2 bg-emerald-50 border border-emerald-200 text-emerald-850 font-sans text-[11px] font-semibold rounded-lg animate-fade-in">
                SOAP progress note copied!
              </div>
            )}
          </div>

        </div>

        {/* Right: EHR matching log & ICD billing suggestions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* EHR demographic record checking */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#08332E]" />
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Electronic Health Records (EHR) Match
              </h4>
            </div>
            
            <p className="font-sans text-xs text-[#635F54] leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD5]/40">
              {matchHistory}
            </p>
          </div>

          {/* ICD-10 suggestion block */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4.5 h-4.5 text-[#08332E]" />
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                ICD-10 Diagnostic Billing suggestions
              </h4>
            </div>

            <p className="font-sans text-[11px] text-[#8C877A] leading-relaxed">
              These billing codes correlate directly to the documented findings inside the SOAP note above for medical insurance indexing:
            </p>

            <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl">
              <span className="block font-sans font-bold text-[9px] uppercase tracking-wider text-orange-700">
                Primary Billing Target
              </span>
              <span className="block font-mono text-xs font-extrabold text-orange-950 mt-1 leading-relaxed">
                {billingCode}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
