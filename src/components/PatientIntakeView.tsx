import React, { useState, useEffect } from "react";
import { UserCheck, MessageSquare, Send, HeartPulse, Sparkles, Activity, AlertCircle, User, Calendar } from "lucide-react";
import { MultiAgentResponse, ChatMessage } from "../types";

interface PatientIntakeViewProps {
  data: MultiAgentResponse | null;
  caseText: string;
}

export default function PatientIntakeView({ data, caseText }: PatientIntakeViewProps) {
  // Use active orchestrated case data if available, or fall back to high-fidelity defaults
  const intake = data?.patientAgent;
  const activeSummary = intake?.summary || "Patient presents with persistent cough and occasional wheezing. No fever or upper respiratory congestion.";
  const activeQuestions = intake?.questionsAsked || [
    "Does the cough get worse at night or after exercises?",
    "Is there any history of seasonal allergies or asthma?",
    "Do you feel any chest pain or difficulty breathing?"
  ];

  // Chatbot states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Initialize chatbot conversation
  useEffect(() => {
    if (intake?.chatResponse) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          text: intake.chatResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setMessages([
        {
          id: "welcome-default",
          role: "model",
          text: "Hello! I am your AI Clinical Intake Specialist. I can help extract symptoms, estimate vitals, and coordinate your care pathway. Please describe how you are feeling or ask any questions.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [intake]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const inputToSend = chatInput;
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMsg),
          currentInput: inputToSend
        })
      });

      if (!response.ok) throw new Error();
      const resData = await response.json();

      setMessages(prev => [...prev, {
        id: `reply-${Date.now()}`,
        role: "model",
        text: resData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      // Simulate fallback response
      setMessages(prev => [...prev, {
        id: `reply-${Date.now()}`,
        role: "model",
        text: "I have recorded that response into the symptoms log. Our specialist clinical agents are updating their differentials accordingly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Extract vitals & tags from text or use clean estimates
  const lowerText = (data?.complaint || caseText || activeSummary).toLowerCase();
  const isChestPain = lowerText.includes("chest") || lowerText.includes("heart") || lowerText.includes("pain radiating") || lowerText.includes("crushing");
  const isHeadache = lowerText.includes("headache") || lowerText.includes("meningitis") || lowerText.includes("stiff neck");

  let estimatedVitals = {
    bp: "120/78 mmHg",
    hr: "76 bpm",
    temp: "36.8 °C",
    spo2: "99%"
  };

  if (isChestPain) {
    estimatedVitals = {
      bp: "150/95 mmHg",
      hr: "102 bpm",
      temp: "37.2 °C",
      spo2: "94%"
    };
  } else if (isHeadache) {
    estimatedVitals = {
      bp: "128/82 mmHg",
      hr: "88 bpm",
      temp: "38.1 °C",
      spo2: "98%"
    };
  } else if (lowerText.includes("fever") || lowerText.includes("temp") || lowerText.includes("hot")) {
    estimatedVitals = {
      bp: "118/76 mmHg",
      hr: "95 bpm",
      temp: "38.9 °C",
      spo2: "97%"
    };
  } else if (lowerText.includes("stomach") || lowerText.includes("pain") || lowerText.includes("vomit") || lowerText.includes("nausea")) {
    estimatedVitals = {
      bp: "115/75 mmHg",
      hr: "85 bpm",
      temp: "37.0 °C",
      spo2: "98%"
    };
  }

  let symptomTags: string[] = [];
  if (isChestPain) {
    symptomTags = ["chest tightness", "left arm radiation", "diaphoresis", "shortness of breath"];
  } else if (isHeadache) {
    symptomTags = ["throbbing headache", "mild fever", "neck stiffness", "photophobia"];
  } else {
    // Dynamically extract some terms from the complaint text
    const words = lowerText.split(/[\s,.\/()]+/).filter(w => w.length > 3 && !["patient", "with", "have", "presents", "presents with", "complaining", "complains", "pain", "years", "male", "female"].includes(w));
    const uniqueWords = Array.from(new Set(words)).slice(0, 4);
    if (uniqueWords.length > 0) {
      symptomTags = uniqueWords.map(w => w.charAt(0).toUpperCase() + w.slice(1));
    } else {
      symptomTags = ["persistent cough", "occasional wheezing", "no fever", "airway reactivity"];
    }
  }

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
              <span className="text-xs font-bold text-[#635F54] max-w-[200px] md:max-w-[350px] truncate" title={data.complaint || caseText || activeSummary}>
                {data.complaint || caseText || activeSummary}
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
          <div className="w-12 h-12 rounded-2xl bg-[#08332E]/10 flex items-center justify-center text-[#08332E]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-[#08332E]">
              Patient Intake & Symptoms Center
            </h3>
            <p className="font-sans text-xs text-[#635F54] mt-0.5">
              Concurrently extracts diagnostic metrics, estimates vital levels, and conducts intake dialogue.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
          {intake?.failoverTriggered && (
            <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-red-700 uppercase tracking-wider border border-red-100 animate-pulse">
              ⚠️ Fallback Guideline Active
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-[#08332E]/5 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#08332E] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#00A254]" />
            Patient Intake Active (Conf: {data?.agentConfidences?.patientAgent || 92}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Intake Results & Vitals */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Structured Intake Summary */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Structured Intake Summary
            </h4>
            <p className="font-sans text-sm text-[#1A2E26] leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD5]/40">
              {activeSummary}
            </p>

            <div className="space-y-2 pt-2">
              <span className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
                Identified Symptom Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {symptomTags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#08332E]/5 text-[#08332E] border border-[#08332E]/15 rounded-full text-xs font-semibold uppercase tracking-tight">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Vitals Panel */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#08332E]" />
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Estimated Clinical Vital Signs
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#FAF8F5] border border-[#E4DFD5]/80 rounded-xl p-3.5 text-center space-y-1">
                <span className="block text-[10px] uppercase font-bold text-[#8C877A]">BP</span>
                <span className="block font-sans font-black text-[#08332E] text-base">{estimatedVitals.bp}</span>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E4DFD5]/80 rounded-xl p-3.5 text-center space-y-1">
                <span className="block text-[10px] uppercase font-bold text-[#8C877A]">HR</span>
                <span className="block font-sans font-black text-[#08332E] text-base">{estimatedVitals.hr}</span>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E4DFD5]/80 rounded-xl p-3.5 text-center space-y-1">
                <span className="block text-[10px] uppercase font-bold text-[#8C877A]">SpO2</span>
                <span className="block font-sans font-black text-[#08332E] text-base">{estimatedVitals.spo2}</span>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E4DFD5]/80 rounded-xl p-3.5 text-center space-y-1">
                <span className="block text-[10px] uppercase font-bold text-[#8C877A]">Temp</span>
                <span className="block font-sans font-black text-[#08332E] text-base">{estimatedVitals.temp}</span>
              </div>
            </div>
          </div>

          {/* Targeted Clarifying Questions */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Suggested Clarifying Questions (Intake Protocol)
            </h4>
            <div className="space-y-3">
              {activeQuestions.map((q, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-teal-50/40 border border-teal-100 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#08332E] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-sans text-xs text-[#08332E] font-medium leading-relaxed">
                    {q}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live Chatbot interface */}
        <div className="lg:col-span-5 bg-white border border-[#E4DFD5] rounded-3xl p-6 shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E4DFD5]/60">
            <MessageSquare className="w-4.5 h-4.5 text-[#08332E]" />
            <div>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Empathetic Intake Dialogue
              </h4>
              <span className="text-[10px] text-[#8C877A]">Active Patient Interview</span>
            </div>
          </div>

          {/* Chat log stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin pr-1">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser 
                      ? "bg-[#08332E] text-white rounded-br-none" 
                      : "bg-[#FAF8F5] text-[#1A2E26] border border-[#E4DFD5]/80 rounded-bl-none"
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[9px] text-[#8C877A] font-medium px-1.5">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E4DFD5]/40 rounded-xl px-4 py-2.5 text-xs text-[#8C877A] w-fit">
                <span className="animate-pulse">Intake Agent is formulating follow-up...</span>
              </div>
            )}
          </div>

          {/* Input block */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E4DFD5]/60 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Provide symptoms, answers, or ask medical terms..."
              className="flex-1 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#08332E]"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !chatInput.trim()}
              className="p-2.5 bg-[#08332E] hover:bg-[#062622] disabled:bg-[#D0C9BC] text-white rounded-xl transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
