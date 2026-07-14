import React, { useState, useEffect, useRef } from "react";
import { 
  UserCheck, HeartPulse, ShieldAlert, FileText, CalendarCheck, 
  Send, Copy, Check, Bell, Calendar, AlertTriangle, Sparkles, Clock, FileSpreadsheet
} from "lucide-react";
import { MultiAgentResponse, ChatMessage } from "../types";

interface CaseResponseProps {
  data: MultiAgentResponse;
  caseText: string;
}

export default function CaseResponse({ data, caseText }: CaseResponseProps) {
  const [activeTab, setActiveTab] = useState<string>("patient");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // Chat state for Patient Agent Chatbot
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Diagnostic checklist state
  const [completedTests, setCompletedTests] = useState<Record<string, boolean>>({});

  // Scheduling states
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-06");
  const [selectedTime, setSelectedTime] = useState<string>("10:30 AM");
  const [isBooked, setIsBooked] = useState<boolean>(false);

  // Reminders states
  const [reminderToggles, setReminderToggles] = useState<Record<string, boolean>>({});
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Initialize chat message from Patient Agent once data is loaded
  useEffect(() => {
    if (data?.patientAgent?.chatResponse) {
      setChatMessages([
        {
          id: "welcome",
          role: "model",
          text: data.patientAgent.chatResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    // Reset states for new search
    setCompletedTests({});
    setIsBooked(false);
    setReminderToggles({});
  }, [data]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const inputToSend = chatInput;
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages.concat(userMsg),
          currentInput: inputToSend
        })
      });

      if (!res.ok) throw new Error("Chat failed");
      const result = await res.json();

      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: "model",
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: "model",
        text: "I experienced a temporary communication hiccup. Please try asking your question again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const copySOAPNote = () => {
    if (!data?.recordsAgent?.newRecordSummary) return;
    navigator.clipboard.writeText(data.recordsAgent.newRecordSummary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleTest = (test: string) => {
    setCompletedTests(prev => ({ ...prev, [test]: !prev[test] }));
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
  };

  const toggleReminder = (medName: string) => {
    setReminderToggles(prev => {
      const updated = { ...prev, [medName]: !prev[medName] };
      if (updated[medName]) {
        // Trigger alert toast
        setActiveNotification(`Successfully configured active reminders for ${medName}!`);
        setTimeout(() => setActiveNotification(null), 4000);
      }
      return updated;
    });
  };

  const triggerTestReminder = (reminder: any) => {
    setActiveNotification(`⏰ REMINDER: Take ${reminder.dosage} of ${reminder.medName} now for ${reminder.purpose}.`);
    setTimeout(() => setActiveNotification(null), 5000);
  };

  // Status-dependent classes
  const risk = data?.emergencyAgent?.riskLevel || "LOW";
  const riskBadgeColor = 
    risk === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200" :
    risk === "MODERATE" ? "bg-amber-50 text-amber-800 border-amber-200" :
    "bg-green-50 text-green-700 border-green-200";

  return (
    <div className="w-full bg-[#FAF8F5] border border-[#E4DFD5] rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      
      {/* Dynamic Toast Notification for Medicine Reminders / Action updates */}
      {activeNotification && (
        <div className="bg-[#08332E] text-[#FDFBF7] px-4 py-3 text-xs font-medium flex items-center justify-between shadow-md transition-all duration-300 animate-slide-in">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>{activeNotification}</span>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="text-emerald-400 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap border-b border-[#E4DFD5] bg-white">
        <button
          onClick={() => setActiveTab("patient")}
          className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "patient"
              ? "border-[#08332E] text-[#08332E] bg-[#FAF8F5]"
              : "border-transparent text-[#635F54] hover:text-[#08332E]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Patient Intake
        </button>
        <button
          onClick={() => setActiveTab("diagnosis")}
          className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "diagnosis"
              ? "border-[#7C4DFF] text-[#7C4DFF] bg-[#FAF8F5]"
              : "border-transparent text-[#635F54] hover:text-[#7C4DFF]"
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Diagnosis
        </button>
        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "emergency"
              ? "border-[#FF5252] text-[#FF5252] bg-[#FAF8F5]"
              : "border-transparent text-[#635F54] hover:text-[#FF5252]"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Triage & Emergency
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "records"
              ? "border-[#FF9100] text-[#FF9100] bg-[#FAF8F5]"
              : "border-transparent text-[#635F54] hover:text-[#FF9100]"
          }`}
        >
          <FileText className="w-4 h-4" />
          Records (SOAP)
        </button>
        <button
          onClick={() => setActiveTab("scheduling")}
          className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "scheduling"
              ? "border-[#00E676] text-[#00A254] bg-[#FAF8F5]"
              : "border-transparent text-[#635F54] hover:text-[#00A254]"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Scheduling & Meds
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 flex-1 bg-white">
        
        {/* TAB 1: PATIENT INTAKE AGENT */}
        {activeTab === "patient" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Summary of Symptoms */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E4DFD5]/80">
                  <div className="flex items-center gap-2 mb-2 text-[#08332E]">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider">
                      Structured Intake Summary
                    </h4>
                  </div>
                  <p className="font-sans text-sm text-[#1A2E26] leading-relaxed">
                    {data.patientAgent.summary}
                  </p>
                </div>

                {/* Follow up clarifying questions */}
                <div className="bg-emerald-50/50 p-5 rounded-xl border border-[#CDE5D6]">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1E5631] mb-3">
                    Clarifying Questions Asked by Patient Agent
                  </h4>
                  <ul className="space-y-2">
                    {data.patientAgent.questionsAsked.map((q, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800">
                          {i + 1}
                        </span>
                        <p className="font-sans text-xs text-[#1E5631] mt-0.5">{q}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Patient Chatbot Support Area */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD5]/80 flex flex-col h-[320px]">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#E4DFD5]/60 mb-3">
                  <UserCheck className="w-4 h-4 text-[#08332E]" />
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                      Patient Chatbot
                    </h4>
                    <p className="font-sans text-[10px] text-[#635F54]">Ask follow-up questions</p>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3">
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[85%] ${
                        m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl leading-relaxed ${
                          m.role === "user"
                            ? "bg-[#08332E] text-white rounded-br-none"
                            : "bg-white border border-[#E4DFD5]/60 text-[#1A2E26] rounded-bl-none shadow-xs"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-[#8C877A] mt-1 px-1">{m.timestamp}</span>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex items-center gap-1.5 p-2 bg-white border border-[#E4DFD5]/40 rounded-xl max-w-[60%]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#08332E] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#08332E] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#08332E] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChatMessage} className="flex gap-1.5">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about symptoms, medication, etc..."
                    className="flex-1 px-3 py-2 bg-white border border-[#E4DFD5] rounded-lg text-xs focus:outline-hidden focus:border-[#08332E]"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-[#08332E] hover:bg-[#062622] text-[#F3EFE0] rounded-lg transition-colors flex-shrink-0"
                    disabled={isChatLoading}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: DIAGNOSIS AGENT */}
        {activeTab === "diagnosis" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Column: Differential Diagnoses */}
              <div className="flex-1 space-y-4">
                <div className="pb-1 border-b border-[#E4DFD5]/60">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#7C4DFF]">
                    Differential Diagnosis Analysis
                  </h4>
                  <p className="font-sans text-xs text-[#635F54] mt-0.5">
                    Suggested primary diagnostic theories and matching confidence
                  </p>
                </div>

                <div className="space-y-4">
                  {data.diagnosisAgent.possibleDiseases.map((d, i) => (
                    <div
                      key={i}
                      className="p-4 border border-[#E4DFD5] rounded-xl hover:border-[#7C4DFF]/40 transition-all bg-[#FAF8F5]"
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div>
                          <h5 className="font-sans font-bold text-sm text-[#1A2E26]">
                            {d.diseaseName}
                          </h5>
                          <span className="font-sans text-[11px] text-[#635F54]">
                            Confidence Level
                          </span>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-[#7C4DFF]/10 text-[#7C4DFF] font-mono text-xs font-bold">
                          {d.confidence}
                        </div>
                      </div>

                      {/* Confidence Bar */}
                      <div className="w-full bg-[#E4DFD5]/50 h-2 rounded-full overflow-hidden mb-3.5">
                        <div
                          className="bg-[#7C4DFF] h-full rounded-full transition-all duration-1000"
                          style={{ width: d.confidence }}
                        />
                      </div>

                      <p className="font-sans text-xs text-[#635F54] leading-relaxed mb-3">
                        <strong className="text-[#1A2E26]">Clinical Rationale:</strong> {d.rationale}
                      </p>

                      {/* Diagnostic tests */}
                      <div className="border-t border-[#E4DFD5]/40 pt-3">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#635F54] block mb-2">
                          Recommended Clinical Investigations
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {d.recommendedTests.map((t, idx) => {
                            const testId = `${i}-${idx}`;
                            const isDone = !!completedTests[testId];
                            return (
                              <button
                                key={idx}
                                onClick={() => toggleTest(testId)}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors ${
                                  isDone
                                    ? "bg-emerald-50 border-emerald-300 text-[#1E5631]"
                                    : "bg-white border-[#E4DFD5]/60 text-[#635F54] hover:bg-[#FAF8F5]"
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                  isDone ? "bg-emerald-600 border-emerald-600 text-white" : "border-[#C4BEB3]"
                                }`}>
                                  {isDone && <Check className="w-2.5 h-2.5" />}
                                </span>
                                <span className="line-clamp-1">{t}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Symptoms matched guidelines */}
              <div className="lg:w-[320px] bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 space-y-4 h-fit">
                <div className="flex items-center gap-2 text-[#7C4DFF]">
                  <HeartPulse className="w-5 h-5 animate-pulse" />
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider">
                    Symptom Matching Guide
                  </h4>
                </div>
                <p className="font-sans text-xs text-indigo-950 leading-relaxed">
                  {data.diagnosisAgent.symptomMatching}
                </p>
                <div className="pt-3 border-t border-indigo-100/60 font-sans text-[10px] text-[#635F54] leading-relaxed">
                  Clinical references matched against CDC airway standards and standard cardiovascular risk frameworks.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: EMERGENCY TRIAGE AGENT */}
        {activeTab === "emergency" && (
          <div className="space-y-6">
            {/* Risk Banner */}
            <div className={`p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${riskBadgeColor}`}>
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-lg bg-white/80 border border-current/20">
                  <ShieldAlert className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold opacity-80 block">
                    Assessed Emergency Category
                  </span>
                  <h4 className="font-sans font-black text-2xl tracking-tight leading-none mt-1">
                    {risk} RISK STATUS
                  </h4>
                </div>
              </div>

              {/* Status Action Indicator */}
              <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg border border-current/10 text-xs font-semibold">
                {risk === "CRITICAL" ? (
                  <span className="text-red-700 animate-pulse">● IMMEDIATE RESCUE DISPATCHED</span>
                ) : risk === "MODERATE" ? (
                  <span className="text-amber-800">● RECOMMENDED OUTPATIENT EVALUATION</span>
                ) : (
                  <span className="text-green-700">● SAFE FOR COMFORT HOME CARE</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Triage Justification */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E4DFD5]">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1A2E26] mb-2">
                    Emergency Rationale & Triage Log
                  </h4>
                  <p className="font-sans text-sm text-[#635F54] leading-relaxed">
                    {data.emergencyAgent.triageDetails}
                  </p>
                </div>

                {/* Action steps */}
                <div className="bg-red-50/20 p-5 rounded-xl border border-red-100">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-red-800 mb-2.5">
                    Required Safe Protocols
                  </h4>
                  <ul className="space-y-2 font-sans text-xs text-red-950">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      If symptoms worsen suddenly, contact 911 or go to the nearest emergency center.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Do not self-prescribe medications without clinical diagnostics.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Keep emergency contacts and diagnostic logs readily available.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Hospital notification box */}
              <div className="bg-white p-5 rounded-xl border border-red-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-600 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <h5 className="font-sans font-bold text-xs uppercase tracking-wider">
                      ER Dispatcher Log
                    </h5>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-red-100 font-mono text-[11px] text-[#FF5252] leading-relaxed min-h-[140px] whitespace-pre-line shadow-xs">
                    {data.emergencyAgent.hospitalDoctorNotification}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveNotification("🚨 SIMULATION: Emergency alert re-sent to closest level-1 trauma center.");
                    setTimeout(() => setActiveNotification(null), 4000);
                  }}
                  className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs"
                >
                  Trigger Emergency Test
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: RECORDS SOAP AGENT */}
        {activeTab === "records" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Demographics / Profile match */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E4DFD5]">
                  <div className="flex items-center gap-2 text-[#FF9100] mb-3">
                    <FileSpreadsheet className="w-4 h-4" />
                    <h5 className="font-sans font-bold text-xs uppercase tracking-wider">
                      Electronic Health Record Match
                    </h5>
                  </div>
                  <p className="font-sans text-xs text-[#635F54] leading-relaxed">
                    {data.recordsAgent.ehrHistoryMatched}
                  </p>
                </div>

                {/* ICD Coding box */}
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-[#FF9100] block mb-1">
                    Suggested ICD-10 Billing Code
                  </span>
                  <span className="font-mono text-lg font-bold text-orange-950">
                    {data.recordsAgent.reportCode}
                  </span>
                </div>
              </div>

              {/* SOAP progress note draft */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-[#E4DFD5]/60">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#FF9100]">
                    Generated Clinical SOAP Progress Note
                  </h4>
                  <button
                    onClick={copySOAPNote}
                    className="flex items-center gap-1.5 text-xs text-[#FF9100] hover:text-orange-700 font-semibold transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Note
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl font-mono text-xs text-[#1A2E26] whitespace-pre-line leading-relaxed shadow-xs max-h-[350px] overflow-y-auto">
                  {data.recordsAgent.newRecordSummary}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SCHEDULING & MEDS AGENT */}
        {activeTab === "scheduling" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Scheduling booking system */}
              <div className="space-y-4">
                <div className="pb-1 border-b border-[#E4DFD5]/60">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#00A254]">
                    Interactive Appointment Booking
                  </h4>
                  <p className="font-sans text-xs text-[#635F54] mt-0.5">
                    Configure and confirm an outpatient visit for further diagnostics.
                  </p>
                </div>

                {isBooked ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center space-y-3 animate-fade-in">
                    <CalendarCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                    <div>
                      <h5 className="font-sans font-bold text-sm text-[#1E5631]">
                        Appointment Successfully Confirmed!
                      </h5>
                      <p className="font-sans text-xs text-[#1E5631] mt-1">
                        Booked with <strong className="font-bold">{data.schedulingAgent.recommendedSpecialist}</strong> on <strong className="font-bold">{selectedDate}</strong> at <strong className="font-bold">{selectedTime}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsBooked(false)}
                      className="text-xs text-[#00A254] font-bold hover:underline transition-all"
                    >
                      Reschedule appointment
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointment} className="bg-[#FAF8F5] p-5 border border-[#E4DFD5] rounded-xl space-y-4 shadow-xs">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#635F54] font-bold">
                        Specialist Recommendation
                      </span>
                      <div className="font-sans font-bold text-sm text-[#08332E] mt-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        {data.schedulingAgent.recommendedSpecialist}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-wider text-[#635F54] font-bold mb-1">
                          Select Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full p-2 bg-white border border-[#E4DFD5] rounded-lg text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-[10px] uppercase tracking-wider text-[#635F54] font-bold mb-1">
                          Select Time
                        </label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full p-2 bg-white border border-[#E4DFD5] rounded-lg text-xs"
                          required
                        >
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="01:15 PM">01:15 PM</option>
                          <option value="03:45 PM">03:45 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-[#E4DFD5]/60 rounded-lg flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#00A254]" />
                      <span className="font-sans text-xs text-[#635F54]">
                        Orchestrator Suggestion: <strong className="text-[#08332E]">{data.schedulingAgent.suggestedTime}</strong>
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#00E676] hover:bg-[#00C853] text-[#003816] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs"
                    >
                      Book Appointment Now
                    </button>
                  </form>
                )}
              </div>

              {/* Medicine reminders list */}
              <div className="space-y-4">
                <div className="pb-1 border-b border-[#E4DFD5]/60">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#00A254]">
                    Prescription & Dosage Reminders
                  </h4>
                  <p className="font-sans text-xs text-[#635F54] mt-0.5">
                    Automated calendar schedules for comfort & curative medicine
                  </p>
                </div>

                <div className="space-y-3">
                  {data.schedulingAgent.medicineReminders.map((r, i) => {
                    const isToggled = !!reminderToggles[r.medName];
                    return (
                      <div
                        key={i}
                        className="p-4 bg-white border border-[#E4DFD5] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-emerald-200 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold text-[10px] tracking-wide">
                              {r.dosage}
                            </span>
                            <h5 className="font-sans font-bold text-sm text-[#1A2E26]">
                              {r.medName}
                            </h5>
                          </div>
                          <p className="font-sans text-xs text-[#635F54] mt-1.5">
                            <strong className="text-[#1A2E26]">Schedule:</strong> {r.frequency}
                          </p>
                          <p className="font-sans text-[11px] text-[#8C877A] mt-0.5">
                            <strong className="text-[#635F54]">Clinical Purpose:</strong> {r.purpose}
                          </p>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => toggleReminder(r.medName)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-colors ${
                              isToggled
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-[#E4DFD5]/80 text-[#635F54] hover:bg-[#FAF8F5]"
                            }`}
                          >
                            {isToggled ? "Active SMS Alerts" : "Set SMS Alerts"}
                          </button>
                          <button
                            onClick={() => triggerTestReminder(r)}
                            className="p-1.5 bg-[#FAF8F5] border border-[#E4DFD5] text-[#635F54] hover:text-[#08332E] rounded-lg transition-colors"
                            title="Test trigger dosage notification"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
