import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import AgentMesh from "./components/AgentMesh";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

// Import modular agent views
import PatientIntakeView from "./components/PatientIntakeView";
import DiagnosisView from "./components/DiagnosisView";
import EmergencyView from "./components/EmergencyView";
import RecordsView from "./components/RecordsView";
import SchedulingView from "./components/SchedulingView";
import ReportAnalyzerView from "./components/ReportAnalyzerView";
import SummaryView from "./components/SummaryView";
import PresentationView from "./components/PresentationView";
import UnifiedBoard from "./components/UnifiedBoard";

import { MultiAgentResponse } from "./types";
import { 
  Sparkles, 
  Send, 
  Brain, 
  AlertCircle, 
  LayoutDashboard, 
  UserCheck, 
  HeartPulse, 
  ShieldAlert, 
  FileText, 
  Calendar, 
  Microscope, 
  ClipboardList, 
  Presentation,
  Menu, 
  X,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

type ViewType = 
  | "dashboard" 
  | "dispatcher" 
  | "intake" 
  | "diagnosis" 
  | "emergency" 
  | "records" 
  | "scheduling" 
  | "analyzer" 
  | "summary"
  | "presentation";

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("dispatcher");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Elevated Agent manual override/failover states (true = online/active)
  const [agentStates, setAgentStates] = useState<Record<string, boolean>>({
    "Patient Agent": true,
    "Diagnosis Agent": true,
    "Emergency Agent": true,
    "Records Agent": true,
    "Scheduling Agent": true
  });

  const [caseText, setCaseText] = useState<string>("");
  const [patientNameInput, setPatientNameInput] = useState<string>("");
  const [patientAgeInput, setPatientAgeInput] = useState<string>("");
  const [patientGenderInput, setPatientGenderInput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "thinking" | "completed">("idle");
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0);
  const [result, setResult] = useState<MultiAgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user session exists in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("active_user_email");
    if (savedUser) {
      setUserEmail(savedUser);
    }
  }, []);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem("active_user_email", email);
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem("active_user_email");
    setActiveView("dispatcher");
    setStatus("idle");
    setResult(null);
    setPatientNameInput("");
    setPatientAgeInput("");
    setPatientGenderInput("");
  };

  // Quick case templates
  const samplePills = [
    {
      label: "Persistent dry cough for 2 weeks, occasional wheezing, no fever. I'm 34.",
      text: "Persistent dry cough for 2 weeks, occasional wheezing, no fever. I'm 34."
    },
    {
      label: "Crushing chest pain radiating to my left arm, sweating, short of breath.",
      text: "Crushing chest pain radiating to my left arm, sweating, short of breath."
    },
    {
      label: "I've had a throbbing headache for 3 days, mild fever, and a stiff neck.",
      text: "I've had a throbbing headache for 3 days, mild fever, and a stiff neck."
    }
  ];

  const handlePillClick = (text: string) => {
    let name = "";
    let ageVal = "";
    let genderVal = "";

    const lower = text.toLowerCase();
    if (lower.includes("cough") || lower.includes("farikha")) {
      name = "Farikha";
      ageVal = "34";
      genderVal = "Female";
    } else if (lower.includes("chest") || lower.includes("sameer")) {
      name = "Sameer";
      ageVal = "45";
      genderVal = "Male";
    } else if (lower.includes("headache") || lower.includes("sarah")) {
      name = "Sarah Ali";
      ageVal = "28";
      genderVal = "Female";
    }

    setPatientNameInput(name);
    setPatientAgeInput(ageVal);
    setPatientGenderInput(genderVal);
    setCaseText(text);

    handleDispatch(text, name, ageVal ? Number(ageVal) : undefined, genderVal);
  };

  const handleDispatch = async (
    textToDispatch: string,
    overrideName?: string,
    overrideAge?: number,
    overrideGender?: string
  ) => {
    if (!textToDispatch.trim()) return;
    
    setStatus("thinking");
    setActiveAgentIndex(0);
    setError(null);
    setResult(null);
    setActiveView("dispatcher"); // Keep on dispatcher view to show progressive loader

    // Progressive Multi-Agent step activation simulation for ultimate user engagement
    const steps = 5;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps) {
        setActiveAgentIndex(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 1100);

    // Track de-activated agents
    const disabledAgents = Object.entries(agentStates)
      .filter(([_, isOnline]) => !isOnline)
      .map(([name, _]) => name);

    // Dynamic demographics with auto-detect fallback
    let patientName = overrideName !== undefined ? overrideName : patientNameInput.trim();
    let age = overrideAge !== undefined ? overrideAge : (patientAgeInput ? Number(patientAgeInput) : undefined);
    let gender = overrideGender !== undefined ? overrideGender : patientGenderInput;

    if (!patientName || !age || !gender) {
      const lower = textToDispatch.toLowerCase();
      if (lower.includes("mahira")) {
        if (!patientName) patientName = "Mahira";
        if (!age) age = 29;
        if (!gender) gender = "Female";
      } else if (lower.includes("cough") || lower.includes("farikha")) {
        if (!patientName) patientName = "Farikha";
        if (!age) age = 34;
        if (!gender) gender = "Female";
      } else if (lower.includes("chest") || lower.includes("sameer")) {
        if (!patientName) patientName = "Sameer";
        if (!age) age = 45;
        if (!gender) gender = "Male";
      } else if (lower.includes("headache") || lower.includes("sarah")) {
        if (!patientName) patientName = "Sarah Ali";
        if (!age) age = 28;
        if (!gender) gender = "Female";
      } else {
        if (!patientName) patientName = "Salar";
        if (!age) age = 45;
        if (!gender) gender = "Male";
      }
    }

    // Update state inputs visually
    setPatientNameInput(patientName);
    setPatientAgeInput(String(age));
    setPatientGenderInput(gender);
    setCaseText(textToDispatch);

    try {
      const response = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          caseText: textToDispatch, 
          disabledAgents,
          patientName,
          age,
          gender
        }),
      });

      if (!response.ok) {
        throw new Error("Orchestration failed.");
      }

      const data = await response.json();
      
      // Ensure the progressive loading finishes before displaying results
      setTimeout(() => {
        clearInterval(interval);
        
        // Map the backend unified saved case properties to the frontend legacy result state
        const responseResult: MultiAgentResponse = {
          patientAgent: data.patientAgentData,
          diagnosisAgent: data.diagnosisAgentData,
          emergencyAgent: data.emergencyAgentData,
          recordsAgent: data.recordsAgentData,
          schedulingAgent: data.schedulingAgentData,
          // Forward metadata for override capability in individual views
          caseId: data.id,
          agentConfidences: data.agentConfidences,
          allergies: data.allergies,
          currentMeds: data.currentMeds,
          patientName: data.patientName || patientName,
          age: data.age || age,
          gender: data.gender || gender,
          complaint: data.complaint || textToDispatch
        };

        setResult(responseResult);
        setStatus("completed");
        // Keep activeView as "dispatcher" to show the magnificent unified bento board
        setActiveView("dispatcher");
      }, 5500);

    } catch (err: any) {
      clearInterval(interval);
      console.error("Coordinating agents failed:", err);
      setError(`An error occurred while coordinating agents: ${err.message || err}. Please try again.`);
      setStatus("idle");
    }
  };

  // Sidebar navigation configuration
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "Core Suite" },
    { id: "dispatcher", label: "AI Dispatcher", icon: Brain, category: "Core Suite" },
    { id: "intake", label: "Patient Intake", icon: UserCheck, category: "Agent Results" },
    { id: "diagnosis", label: "Diagnosis", icon: HeartPulse, category: "Agent Results" },
    { id: "emergency", label: "Emergency Triage", icon: ShieldAlert, category: "Agent Results" },
    { id: "records", label: "Clinical Records", icon: FileText, category: "Agent Results" },
    { id: "scheduling", label: "Scheduling & Meds", icon: Calendar, category: "Agent Results" },
    { id: "analyzer", label: "Report Analyzer", icon: Microscope, category: "Clinical Tools" },
    { id: "summary", label: "Patient Summary", icon: ClipboardList, category: "Clinical Tools" },
    { id: "presentation", label: "Presentation Deck", icon: Presentation, category: "Clinical Tools" },
  ];

  // Map view IDs to Human Readable Titles
  const getActiveViewTitle = () => {
    const item = menuItems.find(m => m.id === activeView);
    return item ? item.label : "Aether Space";
  };

  // If user is not logged in, show Auth Screen (Sign In / Create Account modules)
  if (!userEmail) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row selection:bg-[#08332E]/10 selection:text-[#08332E]">
      
      {/* 1. LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-[#F2F1EE] border-r border-[#E4DFD5] p-5 shrink-0 justify-between">
        <div className="space-y-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-[#08332E] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-black text-xs uppercase tracking-widest text-[#08332E]">
                Aether Health
              </h2>
              <span className="text-[9px] text-[#8C877A] font-semibold tracking-wider">
                COORDINATION NETWORK
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-6">
            
            {/* Group by categories */}
            {["Core Suite", "Agent Results", "Clinical Tools"].map((cat) => (
              <div key={cat} className="space-y-1">
                <span className="block text-[9px] font-black text-[#8C877A] uppercase tracking-wider px-2 mb-1">
                  {cat}
                </span>
                <div className="space-y-0.5">
                  {menuItems
                    .filter((item) => item.category === cat)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = activeView === item.id;
                      
                      // Highlight result tabs if results exist
                      const isResultTab = item.category === "Agent Results";
                      const hasResult = !!result;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveView(item.id as ViewType);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-all duration-150 cursor-pointer ${
                            isActive
                              ? "bg-[#08332E] text-white shadow-xs"
                              : "text-[#635F54] hover:text-[#08332E] hover:bg-[#FAF8F5]/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{item.label}</span>
                          </div>

                          {isResultTab && (
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-white" : hasResult ? "bg-[#00A254]" : "bg-gray-300"
                            }`} />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

          </nav>
        </div>



        {/* User Session Footer inside sidebar */}
        <div className="border-t border-[#E4DFD5]/80 pt-4 mt-6">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5]/40 border border-[#E4DFD5]/40">
            <div className="truncate max-w-[120px]">
              <span className="block text-[8px] font-bold text-[#8C877A] uppercase tracking-wider leading-none">
                Clinician
              </span>
              <span className="text-xs font-semibold text-[#08332E] truncate block mt-0.5" title={userEmail}>
                {userEmail}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* 2. RESPONSIVE MOBILE TOP NAVBAR */}
      <div className="lg:hidden bg-white border-b border-[#E4DFD5] px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#08332E] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-black text-xs uppercase tracking-wider text-[#08332E]">
            Aether Health
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 border border-[#E4DFD5] rounded-lg text-[#08332E]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F2F1EE] border-b border-[#E4DFD5] p-4 space-y-3 animate-fade-in absolute top-[52px] left-0 right-0 z-50 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as ViewType);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-bold ${
                    isActive ? "bg-[#08332E] text-white" : "bg-white text-[#635F54] border border-[#E4DFD5]/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>



          <div className="border-t border-[#E4DFD5] pt-3 flex items-center justify-between text-xs">
            <span className="font-bold text-[#635F54] truncate max-w-[180px]">{userEmail}</span>
            <button onClick={handleLogout} className="text-red-600 font-extrabold uppercase tracking-wide">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT DISPLAY (Right Panel) */}
      <main className="flex-1 min-h-screen bg-[#FAF8F5] pb-16 flex flex-col overflow-y-auto">
        
        {/* Top Header info bar */}
        <Header 
          userEmail={userEmail} 
          onLogout={handleLogout} 
          activeViewTitle={getActiveViewTitle()} 
        />

        {/* View render area */}
        <div className="flex-1 px-6 sm:px-8 py-8 w-full max-w-7xl mx-auto space-y-8">
          
          {activeView === "dashboard" && (
            <Dashboard agentStates={agentStates} setAgentStates={setAgentStates} />
          )}

          {activeView === "analyzer" && (
            <ReportAnalyzerView />
          )}

          {activeView === "summary" && (
            <SummaryView caseText={caseText} />
          )}

          {activeView === "presentation" && (
            <PresentationView />
          )}

          {/* Core Multi-Agent Orchestrator Dispatcher */}
          {activeView === "dispatcher" && (
            <div className="space-y-8">
              
              {/* Title Section */}
              <section className="space-y-3 text-left">
                <h2 className="font-serif font-medium text-3.5xl sm:text-4.5xl tracking-tight text-[#08332E] leading-tight">
                  Five specialized AI agents. <br />
                  <span className="italic font-normal font-serif text-[#00A254]">One coordinated care pathway.</span>
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#635F54] leading-relaxed max-w-2xl">
                  Submit any clinical patient descriptors. Aether's Multi-Agent system concurrently orchestrates intake assessment, guideline-driven differential analysis, red-flag emergency screening, history record mapping, and preventative scheduling.
                </p>
              </section>

              {/* Form & Progressive visualizer column */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left block: Input form */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Textarea Case compiler */}
                  <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 shadow-xs space-y-5 text-left">
                    
                    {/* Patient Demographics Inputs (Horizontal Row) */}
                    <div className="space-y-3 pb-2 border-b border-[#E4DFD5]/40">
                      <h4 className="font-sans font-black text-[10px] uppercase tracking-wider text-[#8C877A]">
                        Patient Demographics (Optional)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="block font-sans font-bold text-[10px] text-[#635F54]">Patient Name</label>
                          <input
                            type="text"
                            value={patientNameInput}
                            onChange={(e) => setPatientNameInput(e.target.value)}
                            placeholder="e.g., Aisha Siddiqua (or auto-detect)"
                            className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs text-[#1A2E26] placeholder-[#8C877A]/80 focus:outline-hidden focus:border-[#08332E] focus:ring-1 focus:ring-[#08332E] transition-all"
                            disabled={status === "thinking"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-sans font-bold text-[10px] text-[#635F54]">Age</label>
                          <input
                            type="number"
                            value={patientAgeInput}
                            onChange={(e) => setPatientAgeInput(e.target.value)}
                            placeholder="e.g., 34 (or auto-detect)"
                            className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs text-[#1A2E26] placeholder-[#8C877A]/80 focus:outline-hidden focus:border-[#08332E] focus:ring-1 focus:ring-[#08332E] transition-all"
                            disabled={status === "thinking"}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-sans font-bold text-[10px] text-[#635F54]">Gender</label>
                          <select
                            value={patientGenderInput}
                            onChange={(e) => setPatientGenderInput(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs text-[#1A2E26] focus:outline-hidden focus:border-[#08332E] focus:ring-1 focus:ring-[#08332E] transition-all"
                            disabled={status === "thinking"}
                          >
                            <option value="">Auto-Detect from symptoms</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-sans font-black text-[10px] uppercase tracking-wider text-[#8C877A]">
                        Primary Patient Case Descriptor & Symptoms
                      </label>
                      <textarea
                        value={caseText}
                        onChange={(e) => setCaseText(e.target.value)}
                        placeholder="Type symptom complaints or patient observations here..."
                        className="w-full h-36 p-4 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs text-[#1A2E26] placeholder-[#8C877A] focus:outline-hidden focus:border-[#08332E] focus:ring-1 focus:ring-[#08332E] resize-none transition-all"
                        disabled={status === "thinking"}
                      />
                    </div>

                    {/* Pre-configured clinical pills */}
                    <div className="space-y-1.5">
                      <span className="block font-sans font-bold text-[9px] uppercase tracking-wider text-[#8C877A]">
                        Load Pre-compiled Clinical Cases
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {samplePills.map((pill, i) => (
                          <button
                            key={i}
                            onClick={() => handlePillClick(pill.text)}
                            disabled={status === "thinking"}
                            className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F2ECE0] border border-[#E4DFD5] rounded-xl text-xs text-[#635F54] text-left truncate max-w-[280px] sm:max-w-[320px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-[#E4DFD5]/40">
                      <button
                        type="button"
                        onClick={() => handleDispatch(caseText)}
                        disabled={status === "thinking" || !caseText.trim()}
                        className="px-5 py-3.5 bg-[#08332E] hover:bg-[#062622] disabled:bg-[#D0C9BC] disabled:cursor-not-allowed text-[#F3EFE0] disabled:text-[#635F54] font-sans font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        Dispatch to agents
                      </button>

                      {/* Info bubble */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-[#00A254] font-extrabold uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-[#00A254] animate-pulse" />
                        <span>Core Mesh Operational</span>
                      </div>
                    </div>

                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* State Indicators */}
                  {status === "idle" && (
                    <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-[#E4DFD5] rounded-3xl text-center space-y-4 shadow-xs">
                      <div className="w-12 h-12 rounded-2xl bg-[#08332E]/10 flex items-center justify-center text-[#08332E]">
                        <Brain className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#08332E]">
                          Ready for Coordination
                        </h3>
                        <p className="font-sans text-xs text-[#8C877A] max-w-sm mx-auto mt-1 leading-relaxed">
                          Enter your complaints or load a sample scenario above to coordinate and dispatch to our multi-agent model mesh.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progressive loading visualizer bar */}
                  {status === "thinking" && (
                    <div className="bg-white border border-[#E4DFD5] rounded-3xl p-8 shadow-xs text-center space-y-6 flex flex-col items-center justify-center min-h-[300px]">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-sans font-bold text-xs text-amber-800 uppercase tracking-widest animate-pulse">
                          Running Multi-Agent Synthesis
                        </h4>
                        <p className="font-sans text-xs text-[#635F54] max-w-xs leading-relaxed">
                          {activeAgentIndex === 0 && "Patient Agent extracting symptoms, calculating vitals..."}
                          {activeAgentIndex === 1 && "Diagnosis Agent parsing differential guidelines..."}
                          {activeAgentIndex === 2 && "Emergency Agent analyzing red-flags and triage parameters..."}
                          {activeAgentIndex === 3 && "Records Agent formulating SOAP documentation summaries..."}
                          {activeAgentIndex === 4 && "Scheduling Agent booking specialist clinic slots..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Coordinated Outcomes Ready Notification */}
                  {status === "completed" && result && (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3 text-emerald-950 font-sans text-left animate-fade-in shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600" />
                        <span className="font-black text-sm uppercase tracking-wider">
                          Coordinated Care Plan Ready!
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        The Multi-Agent coordinator has successfully completed. Use the left Sidebar to browse individual agent responses:
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                        {menuItems.filter(m => m.category === "Agent Results").map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setActiveView(m.id as ViewType)}
                            className="p-2 bg-white border border-emerald-100 hover:border-emerald-300 text-[#08332E] font-bold rounded-xl text-center cursor-pointer transition-colors"
                          >
                            View {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right side tracking panel */}
                <div className="lg:col-span-1">
                  <AgentMesh 
                    status={status} 
                    activeAgentIndex={activeAgentIndex}
                    emergencyRisk={result?.emergencyAgent?.riskLevel} 
                  />
                </div>

              </div>

              {/* Render Unified Bento Board when completed */}
              {status === "completed" && result && (
                <div className="pt-6 border-t border-[#E4DFD5]/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-xs uppercase tracking-widest text-[#08332E]">
                      Coordinated Care Mesh Output
                    </span>
                    <div className="h-[1px] bg-[#E4DFD5] flex-1" />
                  </div>
                  <UnifiedBoard data={result} caseText={caseText} />
                </div>
              )}

            </div>
          )}

          {/* Modular Patient Intake Result View */}
          {activeView === "intake" && (
            <PatientIntakeView data={result} caseText={caseText} />
          )}

          {/* Modular Diagnosis Result View */}
          {activeView === "diagnosis" && (
            <DiagnosisView data={result} />
          )}

          {/* Modular Emergency Triage Result View */}
          {activeView === "emergency" && (
            <EmergencyView data={result} />
          )}

          {/* Modular Clinical Records SOAP note View */}
          {activeView === "records" && (
            <RecordsView data={result} />
          )}

          {/* Modular Scheduling & Med reminder View */}
          {activeView === "scheduling" && (
            <SchedulingView data={result} />
          )}

        </div>
      </main>

    </div>
  );
}
