import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, Sparkles, Send, BellRing, User, Calendar, Activity } from "lucide-react";
import { MultiAgentResponse } from "../types";

interface EmergencyViewProps {
  data: MultiAgentResponse | null;
}

export default function EmergencyView({ data }: EmergencyViewProps) {
  const emergency = data?.emergencyAgent;
  const riskLevel = emergency?.riskLevel || "LOW";
  const triageDetails = emergency?.triageDetails || "No immediate red flags detected. Breathing is stable, oxygenation level satisfies guidelines (>95%), and there are no signs of cardiovascular retrosternal radiating pressure.";
  const doctorNotification = emergency?.hospitalDoctorNotification || "No immediate emergency notifications triggered. Routine diagnostic pathways are recommended.";

  const [simulatedAlertActive, setSimulatedAlertActive] = useState<boolean>(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const handleSimulateAlert = () => {
    setSimulatedAlertActive(true);
    setAlertSuccess(null);
    setTimeout(() => {
      setSimulatedAlertActive(false);
      setAlertSuccess(`Simulated SMS Alert successfully dispatched to the on-call specialist and local ER Trauma Dispatch! (Triage Level: ${riskLevel})`);
    }, 1200);
  };

  const isCritical = riskLevel === "CRITICAL";
  const isModerate = riskLevel === "MODERATE";

  // Determine styles
  const headerBg = isCritical ? "bg-red-50 border-red-200 text-red-800" : isModerate ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800";
  const badgeClass = isCritical ? "bg-red-600 text-white" : isModerate ? "bg-amber-500 text-white" : "bg-emerald-600 text-white";

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
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-[#08332E]">
              Emergency Triage & Red-Flag Triage
            </h3>
            <p className="font-sans text-xs text-[#635F54] mt-0.5">
              Continuously monitors patient complaints for acute cardiovascular, neurologic, or airway emergencies.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
          {emergency?.failoverTriggered && (
            <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-red-700 uppercase tracking-wider border border-red-100 animate-pulse">
              ⚠️ Backup Protocols Triggered
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-red-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Emergency Active (Conf: {data?.agentConfidences?.emergencyAgent || 99}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Triage Evaluation Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Risk Status card */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-5 shadow-xs">
            
            {/* Risk Indicator Panel */}
            <div className={`p-5 rounded-2xl border flex items-start gap-4 ${headerBg}`}>
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-xs">
                <AlertTriangle className={`w-5.5 h-5.5 ${isCritical ? "text-red-600 animate-bounce" : isModerate ? "text-amber-500" : "text-emerald-600"}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black tracking-tight text-xs uppercase">
                    Risk Category Level
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${badgeClass}`}>
                    {riskLevel}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-lg">
                  {isCritical ? "CRITICAL SYSTEM PROTOCOL ACTIVATED" : isModerate ? "MODERATE CLINICAL ATTENTION RECOMMENDED" : "CLINICALLY STABLE STATE CONFIRMED"}
                </h4>
              </div>
            </div>

            {/* Red flag rationales */}
            <div className="space-y-2">
              <span className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
                Triage Rationale & Red-Flag Warnings
              </span>
              <p className="font-sans text-xs text-[#635F54] leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD5]/40">
                {triageDetails}
              </p>
            </div>

            {/* Alert dispatched toggle status */}
            <div className="flex justify-between items-center py-3 border-t border-[#E4DFD5]/40 text-xs">
              <span className="font-sans font-bold text-[#8C877A] uppercase tracking-wider text-[10px]">
                Pre-Activated Alert Dispatchers
              </span>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${emergency?.alertDispatched || isCritical ? "bg-red-600" : "bg-[#D0C9BC]"}`} />
                <span className="font-mono text-xs font-semibold text-[#635F54]">
                  {emergency?.alertDispatched || isCritical ? "ER Alert Dispatch Active" : "No emergency dispatches triggered"}
                </span>
              </div>
            </div>

          </div>

          {/* Interactive Trigger block */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
              Specialist Emergency Fail-safe Dispatcher
            </h4>
            <p className="font-sans text-xs text-[#635F54] leading-relaxed">
              In cases where secondary visual observations differ from intake descriptors, you can manually trigger specialist emergency notifications.
            </p>

            <button
              onClick={handleSimulateAlert}
              disabled={simulatedAlertActive}
              className="px-5 py-3.5 bg-red-700 hover:bg-red-800 disabled:bg-gray-200 text-white disabled:text-gray-500 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
            >
              <BellRing className={`w-4 h-4 ${simulatedAlertActive ? "animate-spin" : ""}`} />
              {simulatedAlertActive ? "Dispatching simulated emergency SMS alerts..." : "Dispatch Specialist Triage Alert"}
            </button>

            {alertSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800 leading-relaxed font-semibold animate-fade-in">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{alertSuccess}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right: Hospital Doctor Notification / Triage channels */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dispatch Notification Log */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
              Hospital Doctor Dispatch Log
            </h4>
            <p className="font-sans text-[11px] text-[#8C877A] leading-relaxed">
              This message was compiled and formatted by the Emergency Agent to direct clinicians or dispatcher crews instantly:
            </p>

            <div className="p-4 bg-[#FAF8F5] border border-red-100 rounded-xl font-mono text-[11.5px] text-red-950 leading-relaxed whitespace-pre-line">
              {doctorNotification}
            </div>
          </div>

          {/* Active Triage Alert Channels */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Active Warning Channels
            </h4>
            
            <div className="space-y-2 pt-1.5 text-xs font-semibold">
              <div className="flex justify-between items-center p-3 bg-red-50/40 border border-red-100 rounded-xl">
                <span className="text-[#08332E]">Emergency Department Crew</span>
                <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full ${isCritical ? "bg-red-600 text-white" : "bg-[#D0C9BC] text-gray-600"}`}>
                  {isCritical ? "ACTIVE" : "STANDBY"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50/40 border border-red-100 rounded-xl">
                <span className="text-[#08332E]">On-Call Cardiac Telemetry Team</span>
                <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full ${isCritical ? "bg-red-600 text-white" : "bg-[#D0C9BC] text-gray-600"}`}>
                  {isCritical ? "ACTIVE" : "STANDBY"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50/40 border border-red-100 rounded-xl">
                <span className="text-[#08332E]">General Practitioner / Clinic</span>
                <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full ${!isCritical ? "bg-emerald-600 text-white" : "bg-[#D0C9BC] text-gray-600"}`}>
                  {!isCritical ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
