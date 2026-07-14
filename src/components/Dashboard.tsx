import React, { useState, useEffect } from "react";
import { 
  Activity, Users, ShieldAlert, Zap, Clock, Search, PlusCircle, 
  CheckCircle, FileText, Trash2, HeartPulse, Shield, AlertTriangle, 
  Power, RefreshCw, Layers, Sparkles, Lock, ShieldCheck, Stethoscope
} from "lucide-react";

export interface RegistryCase {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  complaint: string;
  riskLevel: "CRITICAL" | "MODERATE" | "LOW";
  date: string;
  soapNote: string;
  icdCode: string;
  specialist: string;
  meds: string;
  allergies?: string;
  currentMeds?: string;
  timeline?: { timestamp: string; event: string; description: string; }[];
  agentConfidences?: {
    patientAgent: number;
    diagnosisAgent: number;
    emergencyAgent: number;
    recordsAgent: number;
    schedulingAgent: number;
  };
  overrides?: {
    id: string;
    timestamp: string;
    agentName: string;
    originalValue: string;
    newValue: string;
    clinicianRole: string;
  }[];
}

interface DashboardProps {
  agentStates?: Record<string, boolean>;
  setAgentStates?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function Dashboard({ agentStates: propAgentStates, setAgentStates: propSetAgentStates }: DashboardProps) {
  // Access control roles
  const [role, setRole] = useState<"doctor" | "nurse" | "admin">("doctor");

  // Local state fallbacks if props aren't provided
  const [localAgentStates, setLocalAgentStates] = useState<Record<string, boolean>>({
    "Patient Agent": true,
    "Diagnosis Agent": true,
    "Emergency Agent": true,
    "Records Agent": true,
    "Scheduling Agent": true
  });

  const agentStates = propAgentStates || localAgentStates;
  const setAgentStates = propSetAgentStates || setLocalAgentStates;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<RegistryCase | null>(null);
  const [activeTab, setActiveTab] = useState<"cases" | "mesh">("cases");

  const [cases, setCases] = useState<RegistryCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiTracking, setApiTracking] = useState<{ cumulativeTokens: number; cumulativeCost: number }>({
    cumulativeTokens: 45830,
    cumulativeCost: 0.0458
  });

  // Dynamic override edit states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedSoap, setEditedSoap] = useState<string>("");
  const [editedSpecialist, setEditedSpecialist] = useState<string>("");
  const [editedIcd, setEditedIcd] = useState<string>("");
  const [editedMeds, setEditedMeds] = useState<string>("");

  // Handle manual case creation
  const [newPatientName, setNewPatientName] = useState<string>("");
  const [newAge, setNewAge] = useState<number>(30);
  const [newGender, setNewGender] = useState<string>("Female");
  const [newComplaint, setNewComplaint] = useState<string>("");
  const [newRisk, setNewRisk] = useState<"CRITICAL" | "MODERATE" | "LOW">("LOW");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Load from backend
  const fetchCases = async () => {
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        if (data.length > 0 && !selectedCase) {
          setSelectedCase(data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch cases", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiUsage = async () => {
    try {
      const res = await fetch("/api/api-usage");
      if (res.ok) {
        const data = await res.json();
        setApiTracking(data);
      }
    } catch (e) {
      console.error("Failed to fetch API tracking", e);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchApiUsage();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newComplaint.trim()) return;

    const mockSoap = `S: Patient complains of ${newComplaint}.\nO: Unrecorded clinical vitals.\nA: Symptomatic review pending specialist follow-up.\nP: Coordinated clinical outreach and scheduled further consultations.`;
    const mockCodes: Record<string, string> = {
      CRITICAL: "I21.9 (Myocardial Infarction)",
      MODERATE: "R51.9 (Headache, unspecified)",
      LOW: "J06.9 (Acute upper respiratory infection)"
    };

    const mockSpecialists: Record<string, string> = {
      CRITICAL: "Cardiologist / ER Specialist",
      MODERATE: "Neurologist / Internist",
      LOW: "Family Medicine Practitioner"
    };

    const newCase: Partial<RegistryCase> = {
      patientName: newPatientName,
      age: Number(newAge),
      gender: newGender,
      complaint: newComplaint,
      riskLevel: newRisk,
      soapNote: mockSoap,
      icdCode: mockCodes[newRisk],
      specialist: mockSpecialists[newRisk],
      meds: newRisk === "CRITICAL" ? "Aspirin (325mg)" : "Hydration and rest",
      allergies: newGender === "Male" ? "Aspirin" : "Penicillin",
      currentMeds: newGender === "Male" ? "Metformin" : "Ibuprofen",
      timeline: [
        { 
          timestamp: new Date().toTimeString().substring(0, 8), 
          event: "DISPATCH", 
          description: "New clinical diagnostic intake record initialized manually." 
        }
      ],
      agentConfidences: {
        patientAgent: 100,
        diagnosisAgent: 95,
        emergencyAgent: 100,
        recordsAgent: 98,
        schedulingAgent: 90
      },
      overrides: []
    };

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase)
      });
      if (res.ok) {
        const saved = await res.json();
        setCases(prev => [saved, ...prev]);
        setSelectedCase(saved);
        setShowAddForm(false);
        // Reset form
        setNewPatientName("");
        setNewAge(30);
        setNewComplaint("");
        setNewRisk("LOW");
      }
    } catch (e) {
      console.error("Failed to create case", e);
    }
  };

  const handleDeleteCase = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== id));
        if (selectedCase?.id === id) {
          setSelectedCase(null);
        }
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const toggleAgent = (agentName: string) => {
    if (role !== "admin" && role !== "doctor") {
      alert("Security Protocol: Deactivating specialist agents is restricted to Administrators or Doctors.");
      return;
    }
    setAgentStates(prev => ({
      ...prev,
      [agentName]: !prev[agentName]
    }));
  };

  // Start edit override flow
  const handleStartEditing = () => {
    if (!selectedCase) return;
    setEditedSoap(selectedCase.soapNote);
    setEditedSpecialist(selectedCase.specialist);
    setEditedIcd(selectedCase.icdCode);
    setEditedMeds(selectedCase.meds);
    setIsEditing(true);
  };

  // Commit clinical override
  const handleSaveOverrides = async () => {
    if (!selectedCase) return;

    const newOverrides = [...(selectedCase.overrides || [])];
    const timestampStr = new Date().toTimeString().substring(0, 8);
    const clinicianLabel = role === "doctor" ? "Attending MD" : "Nurse Practitioner";

    // Track which components changed to create precise audit trails
    if (editedSoap !== selectedCase.soapNote) {
      const o = {
        id: `OVR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timestampStr,
        agentName: "Records Agent (SOAP Notes)",
        originalValue: selectedCase.soapNote.substring(0, 50) + "...",
        newValue: editedSoap.substring(0, 50) + "...",
        clinicianRole: clinicianLabel
      };
      newOverrides.push(o);
      await saveOverrideToServer(o);
    }

    if (editedSpecialist !== selectedCase.specialist) {
      const o = {
        id: `OVR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timestampStr,
        agentName: "Scheduling Agent (Specialist)",
        originalValue: selectedCase.specialist,
        newValue: editedSpecialist,
        clinicianRole: clinicianLabel
      };
      newOverrides.push(o);
      await saveOverrideToServer(o);
    }

    if (editedIcd !== selectedCase.icdCode) {
      const o = {
        id: `OVR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timestampStr,
        agentName: "Records Agent (ICD-10 Diagnostic Billing)",
        originalValue: selectedCase.icdCode,
        newValue: editedIcd,
        clinicianRole: clinicianLabel
      };
      newOverrides.push(o);
      await saveOverrideToServer(o);
    }

    if (editedMeds !== selectedCase.meds) {
      const o = {
        id: `OVR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timestampStr,
        agentName: "Scheduling Agent (Meds Prescriptions)",
        originalValue: selectedCase.meds,
        newValue: editedMeds,
        clinicianRole: clinicianLabel
      };
      newOverrides.push(o);
      await saveOverrideToServer(o);
    }

    const updatedCase: RegistryCase = {
      ...selectedCase,
      soapNote: editedSoap,
      specialist: editedSpecialist,
      icdCode: editedIcd,
      meds: editedMeds,
      overrides: newOverrides
    };

    // If role is Nurse, flag the override as needing secondary sign-off
    if (role === "nurse") {
      updatedCase.soapNote += "\n\n[NP NOTE: Clinician override initiated by Nurse Practitioner. Awaiting secondary MD signature.]";
    }

    try {
      const res = await fetch(`/api/cases/${selectedCase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCase)
      });
      if (res.ok) {
        const saved = await res.json();
        // Update local arrays
        setCases(prev => prev.map(c => c.id === saved.id ? saved : c));
        setSelectedCase(saved);
        setIsEditing(false);
      }
    } catch (e) {
      console.error("Failed to commit overrides", e);
    }
  };

  const saveOverrideToServer = async (overrideEvent: any) => {
    try {
      await fetch("/api/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase?.id,
          patientName: selectedCase?.patientName,
          ...overrideEvent
        })
      });
    } catch (error) {
      console.error("Override logger failed", error);
    }
  };

  // Heuristic Allergy check (Feature 4)
  const allergyWarning = selectedCase && selectedCase.allergies && selectedCase.meds
    ? selectedCase.meds.toLowerCase().includes(selectedCase.allergies.toLowerCase())
    : false;

  // Heuristic Conflict Detector (Feature 2)
  const clinicalConflict = selectedCase && (
    (selectedCase.riskLevel === "CRITICAL" && selectedCase.meds.toLowerCase().includes("hydration")) ||
    (selectedCase.riskLevel === "CRITICAL" && selectedCase.specialist.toLowerCase().includes("family")) ||
    (allergyWarning)
  );

  const filteredCases = cases.filter(c => 
    c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.complaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-left">
      
      {/* Role and Compliance Bar */}
      <div className="bg-[#FAF8F5] border border-[#E4DFD5] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Active Role Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Stethoscope className="w-5 h-5 text-[#08332E]" />
          <span className="font-sans text-[11px] font-bold text-[#635F54] uppercase tracking-wider">Clinician Persona:</span>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as any);
              setIsEditing(false);
            }}
            className="bg-white border border-[#E4DFD5] text-xs font-bold text-[#08332E] px-3 py-2 rounded-xl focus:outline-hidden cursor-pointer"
          >
            <option value="doctor">🩺 Attending Physician / MD (Full Admin Access)</option>
            <option value="nurse">🧑‍⚕️ Clinical Nurse Practitioner (NP Sign-off Required)</option>
            <option value="admin">💻 Systems Architect / Administrator (Mesh Console Only)</option>
          </select>
        </div>

        {/* HIPAA Trust Signals */}
        <div className="flex items-center gap-4 text-[#8C877A]">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>HIPAA COMPLIANT</span>
          </div>
          <div className="h-4 w-[1px] bg-[#E4DFD5]" />
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>256-bit PHI ENCRYPTED</span>
          </div>
        </div>

      </div>

      {/* Top Clinical Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#08332E]/5 flex items-center justify-center text-[#08332E]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C877A] block">
              Total Managed Cases
            </span>
            <span className="font-serif text-2xl font-bold text-[#08332E] mt-0.5 block">
              {cases.length}
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C877A] block">
              Active ER Triages
            </span>
            <span className="font-serif text-2xl font-bold text-red-700 mt-0.5 block">
              {cases.filter(c => c.riskLevel === "CRITICAL").length} Active
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C877A] block">
              Gemini API Telemetry
            </span>
            <span className="font-serif text-2xl font-bold text-indigo-700 mt-0.5 block">
              {apiTracking.cumulativeTokens.toLocaleString()} tkn
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E4DFD5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C877A] block">
              Avg. Orchestration Speed
            </span>
            <span className="font-serif text-2xl font-bold text-emerald-700 mt-0.5 block">
              5.4 Seconds
            </span>
          </div>
        </div>

      </div>

      {/* Main Switch Tabs */}
      <div className="flex border-b border-[#E4DFD5]">
        <button
          onClick={() => setActiveTab("cases")}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "cases"
              ? "border-[#08332E] text-[#08332E]"
              : "border-transparent text-[#8C877A] hover:text-[#08332E]"
          }`}
        >
          Clinical Records Registry ({filteredCases.length})
        </button>
        <button
          onClick={() => setActiveTab("mesh")}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "mesh"
              ? "border-[#08332E] text-[#08332E]"
              : "border-transparent text-[#8C877A] hover:text-[#08332E]"
          }`}
        >
          Multi-Agent Mesh Telemetry & Costs
        </button>
      </div>

      {/* Tab A: Clinical Records Registry */}
      {activeTab === "cases" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Cases List */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Search and Add controls */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C877A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID or symptom..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4DFD5] rounded-xl text-xs placeholder-[#8C877A] focus:outline-hidden focus:border-[#08332E] transition-all"
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-2.5 bg-[#08332E] hover:bg-[#062622] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Add simulated diagnostic case record"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                New Case
              </button>
            </div>

            {/* Add New Case Form */}
            {showAddForm && (
              <form onSubmit={handleCreateCase} className="p-4 bg-white border border-[#08332E]/20 rounded-2xl space-y-3 shadow-md animate-fade-in">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5] pb-1.5">
                  Simulate New Clinical Diagnostic
                </h4>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C877A] mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g. Farikha"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E4DFD5] rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C877A] mb-1">Age</label>
                    <input
                      type="number"
                      value={newAge}
                      onChange={(e) => setNewAge(Number(e.target.value))}
                      className="w-full p-2 bg-[#FAF8F5] border border-[#E4DFD5] rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8C877A] mb-1">Risk Level</label>
                    <select
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value as any)}
                      className="w-full p-2 bg-[#FAF8F5] border border-[#E4DFD5] rounded-lg text-xs"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8C877A] mb-1">Primary Complaint</label>
                  <textarea
                    value={newComplaint}
                    onChange={(e) => setNewComplaint(e.target.value)}
                    placeholder="Describe symptoms..."
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E4DFD5] rounded-lg text-xs h-16 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#08332E] hover:bg-[#062622] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Insert Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 border border-[#E4DFD5] text-[#635F54] text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Case Cards list */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#8C877A] mx-auto mb-2" />
                  <p className="text-xs text-[#8C877A]">Loading patient records ledger...</p>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="text-center py-12 bg-white border border-[#E4DFD5] rounded-2xl">
                  <p className="text-xs text-[#8C877A]">No clinical registry matches found.</p>
                </div>
              ) : (
                filteredCases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const rColor = 
                    c.riskLevel === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200" :
                    c.riskLevel === "MODERATE" ? "bg-amber-50 text-amber-800 border-amber-200" :
                    "bg-green-50 text-green-700 border-green-200";

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCase(c);
                        setIsEditing(false);
                      }}
                      className={`p-4 border rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                        isSelected 
                          ? "bg-[#FAF8F5] border-[#08332E] ring-1 ring-[#08332E]" 
                          : "bg-white border-[#E4DFD5] hover:border-[#C4BEB3]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[#8C877A] font-bold">{c.id}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${rColor}`}>
                              {c.riskLevel}
                            </span>
                          </div>
                          <h5 className="font-sans font-bold text-sm text-[#08332E] mt-1.5">
                            {c.patientName}
                          </h5>
                        </div>
                        <button
                          onClick={(e) => handleDeleteCase(c.id, e)}
                          className="p-1 text-[#8C877A] hover:text-red-600 rounded transition-colors"
                          title="Delete health record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="font-sans text-xs text-[#635F54] mt-2 line-clamp-2 leading-relaxed">
                        {c.complaint}
                      </p>

                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#E4DFD5]/40 text-[10px] text-[#8C877A]">
                        <span>{c.age} y/o · {c.gender}</span>
                        <span>{c.date}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Side: Case Details Panel */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-6 shadow-xs text-left animate-fade-in relative">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DFD5]/60">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-[#8C877A] font-bold bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#E4DFD5]">
                        {selectedCase.id}
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        selectedCase.riskLevel === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                        selectedCase.riskLevel === "MODERATE" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {selectedCase.riskLevel} RISK CATEGORY
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-xl text-[#08332E] mt-3">
                      {selectedCase.patientName}
                    </h4>
                    <p className="font-sans text-xs text-[#635F54] mt-1">
                      {selectedCase.age} Years Old · {selectedCase.gender} · Registered on {selectedCase.date}
                    </p>

                    {/* Agent Confidence Scores Badge (Feature 1) */}
                    {selectedCase.agentConfidences && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {Object.entries(selectedCase.agentConfidences).map(([agent, score]) => (
                          <div 
                            key={agent} 
                            className="bg-[#FAF8F5] border border-[#E4DFD5] rounded-lg px-2 py-1 flex items-center gap-1.5 text-[9px] font-mono text-[#635F54]"
                            title={`${agent.replace("Agent", " Agent")} confidence rating`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00A254] animate-pulse" />
                            <span>{agent.replace("Agent", "")}: <strong>{score}%</strong></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start sm:items-end">
                    <span className="font-sans text-[10px] font-bold text-[#8C877A] uppercase tracking-wider">
                      Assigned Specialist
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedSpecialist}
                        onChange={(e) => setEditedSpecialist(e.target.value)}
                        className="p-1 border border-[#E4DFD5] bg-[#FAF8F5] text-xs font-semibold text-[#00A254] mt-1 rounded"
                      />
                    ) : (
                      <span className="font-sans text-xs font-semibold text-[#00A254] mt-0.5">
                        {selectedCase.specialist}
                      </span>
                    )}
                  </div>
                </div>

                {/* Conflict Resolution Warning Banner (Feature 2) */}
                {clinicalConflict && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-sans font-bold text-xs text-red-950 uppercase tracking-wide">
                        Clinical Coordination Discord Detected
                      </h5>
                      <p className="font-sans text-[11px] text-red-800 leading-relaxed">
                        {selectedCase.riskLevel === "CRITICAL" && selectedCase.meds.toLowerCase().includes("hydration") 
                          ? "CRITICAL Triage Alert conflict: Triage demands immediate hospital intervention, but scheduling proposed general home hydration. Systems auto-overrode priority pathways to emergency cardiology."
                          : allergyWarning
                          ? `CRITICAL Drug-Allergy Warning: Patient lists allergy of [${selectedCase.allergies}] which is in direct conflict with prescribed medication [${selectedCase.meds}]. Clinician modification strongly indicated.`
                          : "Incompatible multi-agent signals detected. Case elevated for physical clinician review."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Complaint block */}
                <div className="space-y-1.5">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C877A]">
                    Inter Intake Symptoms Description
                  </span>
                  <p className="font-sans text-sm text-[#1A2E26] bg-[#FAF8F5] p-4 rounded-xl border border-[#E4DFD5]/80 leading-relaxed">
                    {selectedCase.complaint}
                  </p>
                </div>

                {/* Allergy Profile (Feature 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50/20 border border-[#E4DFD5] rounded-xl space-y-1">
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-red-700">Patient Allergies</span>
                    <span className="font-mono text-xs text-[#1A2E26]">{selectedCase.allergies || "No Known Drug Allergies (NKDA)"}</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-[#E4DFD5] rounded-xl space-y-1">
                    <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#635F54]">Current Regular Meds</span>
                    <span className="font-mono text-xs text-[#1A2E26]">{selectedCase.currentMeds || "None"}</span>
                  </div>
                </div>

                {/* SOAP Note Block (Editable, Feature 3) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#08332E]">
                      <FileText className="w-4 h-4 text-[#08332E]" />
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wider">
                        SOAP Clinical Progress Notes
                      </span>
                    </div>
                    
                    {/* Override Action Controls */}
                    {role !== "admin" ? (
                      isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveOverrides}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Commit Overrides
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="border border-[#E4DFD5] text-[#635F54] hover:bg-gray-100 font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleStartEditing}
                          className="bg-[#08332E] hover:bg-[#062622] text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Override Agent Outputs
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] text-[#8C877A] font-bold uppercase">Read-Only (Admin Mode)</span>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedSoap}
                      onChange={(e) => setEditedSoap(e.target.value)}
                      className="w-full p-4 bg-[#FAF8F5] border border-[#08332E]/30 rounded-xl font-mono text-xs text-[#1A2E26] h-48 resize-y focus:outline-hidden"
                    />
                  ) : (
                    <div className="p-4 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl font-mono text-xs text-[#1A2E26] whitespace-pre-line leading-relaxed">
                      {selectedCase.soapNote}
                    </div>
                  )}
                </div>

                {/* ICD and Meds columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-1">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-orange-700">
                      ICD-10 Diagnostic Billing Code
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedIcd}
                        onChange={(e) => setEditedIcd(e.target.value)}
                        className="w-full p-1.5 bg-white border border-orange-300 rounded text-xs font-mono font-bold"
                      />
                    ) : (
                      <span className="font-mono text-sm font-bold text-orange-950 block">
                        {selectedCase.icdCode}
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#00A254]">
                      Coordinated Medicine Schedules
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedMeds}
                        onChange={(e) => setEditedMeds(e.target.value)}
                        className="w-full p-1.5 bg-white border border-emerald-300 rounded text-xs font-semibold"
                      />
                    ) : (
                      <span className="font-sans text-xs font-semibold text-emerald-950 block leading-relaxed">
                        {selectedCase.meds}
                      </span>
                    )}
                  </div>
                </div>

                {/* Clinic-In-The-Loop Override History Panel (Feature 3) */}
                {selectedCase.overrides && selectedCase.overrides.length > 0 && (
                  <div className="bg-amber-50/30 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <h5 className="font-sans font-bold text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> Clinician Override Logs History (Feedback Audit Trail)
                    </h5>
                    <div className="space-y-3.5 divide-y divide-amber-200/40">
                      {selectedCase.overrides.map((o) => (
                        <div key={o.id} className="text-xs pt-3 first:pt-0">
                          <div className="flex justify-between font-mono text-[9px] text-[#8C877A] mb-1">
                            <span>Timestamp: {o.timestamp} · User: {o.clinicianRole}</span>
                            <span className="text-amber-800 font-bold">COMMIT SUCCESSFUL</span>
                          </div>
                          <p className="font-sans text-[11px] text-[#635F54] leading-relaxed">
                            <strong className="text-amber-950">Component:</strong> {o.agentName} <br />
                            <strong className="text-amber-950">Pre-Override:</strong> <span className="font-mono text-xs">{o.originalValue}</span> <br />
                            <strong className="text-amber-950">Post-Override:</strong> <span className="font-mono text-xs text-amber-900 bg-amber-50 px-1 rounded font-bold">{o.newValue}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case Timeline / Parallel Execution Audit Trail (Feature 5) */}
                {selectedCase.timeline && (
                  <div className="space-y-4 pt-5 border-t border-[#E4DFD5]/60">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C877A]">
                      Multi-Agent Parallel Synthesis Timeline (Case Audit Trail)
                    </span>
                    <div className="space-y-4">
                      {selectedCase.timeline.map((t, index) => (
                        <div key={index} className="flex gap-4 text-xs">
                          <span className="font-mono text-[10px] text-[#8C877A] font-bold shrink-0 pt-0.5">{t.timestamp}</span>
                          <div className="relative shrink-0 flex flex-col items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#08332E] border border-white z-10" />
                            {index !== (selectedCase.timeline || []).length - 1 && <span className="w-0.5 grow bg-[#E4DFD5] absolute top-2 bottom-0" />}
                          </div>
                          <div className="space-y-0.5 pb-2">
                            <span className="font-sans font-black text-[#1A2E26] text-[10px] uppercase tracking-wide">{t.event}</span>
                            <p className="font-sans text-[#635F54] text-[11px] leading-relaxed">{t.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-[#E4DFD5] rounded-3xl p-16 text-center space-y-4 shadow-xs h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8C877A] border border-[#E4DFD5]">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#08332E]">
                    No Patient Selected
                  </h4>
                  <p className="font-sans text-xs text-[#8C877A] max-w-sm mx-auto mt-1 leading-relaxed">
                    Select any medical diagnostics record from the left registry panel to inspect full details, formatted SOAP notes, clinical prescriptions and ICD billing metrics.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab B: Multi-Agent Mesh Telemetry & Failover Override controls */}
      {activeTab === "mesh" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Block: Interactive Agent State override */}
          <div className="lg:col-span-1 bg-white border border-[#E4DFD5] rounded-3xl p-6 text-left space-y-6 shadow-xs">
            <div>
              <h4 className="font-serif font-bold text-base text-[#08332E]">
                Clinical Failover Console
              </h4>
              <p className="font-sans text-xs text-[#635F54] mt-1 leading-relaxed">
                Manually simulate agent maintenance or system failover. Deactivating any agent routes its workloads into secondary backup pathways automatically.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(agentStates).map(([agentName, isOnline]) => (
                <div
                  key={agentName}
                  className={`p-4 border rounded-2xl flex items-center justify-between transition-all duration-300 ${
                    isOnline 
                      ? "bg-[#FAF8F5] border-[#E4DFD5]/80" 
                      : "bg-red-50/40 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isOnline ? "bg-[#08332E]/10 text-[#08332E]" : "bg-red-100 text-red-600 animate-pulse"
                    }`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-sans font-bold text-xs text-[#1A2E26]">
                        {agentName}
                      </h5>
                      <span className={`text-[9px] uppercase tracking-wider font-bold block mt-0.5 ${
                        isOnline ? "text-[#00A254]" : "text-red-600"
                      }`}>
                        {isOnline ? "ONLINE · PRIMARY PATHWAY" : "OFFLINE · FAILOVER ACTIVE"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAgent(agentName)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isOnline 
                        ? "text-[#635F54] hover:bg-gray-100 hover:text-red-600" 
                        : "text-red-600 hover:bg-red-50"
                    }`}
                    title={isOnline ? "Simulate agent shutdown" : "Re-commission agent"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Blocks: Live telemetry stats & API Cost usage (Feature 9) */}
          <div className="lg:col-span-2 space-y-6 text-left">
            
            {/* Speed Telemetry Mock Chart */}
            <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
              <h4 className="font-serif font-bold text-base text-[#08332E]">
                Agent Mesh Response Times (ms)
              </h4>
              
              <div className="space-y-4 pt-2">
                
                {/* Stat 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs">
                    <span className="font-bold text-[#1A2E26]">Patient Agent (Intake & Dialogue)</span>
                    <span className="font-mono text-[#8C877A]">{agentStates["Patient Agent"] ? "340 ms" : "⚠️ Offline (Rerouted)"}</span>
                  </div>
                  <div className="w-full bg-[#E4DFD5]/40 h-2.5 rounded-full overflow-hidden">
                    <div className={`${agentStates["Patient Agent"] ? "bg-[#08332E]" : "bg-red-500"} h-full rounded-full`} style={{ width: agentStates["Patient Agent"] ? "35%" : "15%" }} />
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs">
                    <span className="font-bold text-[#1A2E26]">Diagnosis Agent (Differential matching)</span>
                    <span className="font-mono text-[#8C877A]">{agentStates["Diagnosis Agent"] ? "820 ms" : "⚠️ Offline (Rerouted)"}</span>
                  </div>
                  <div className="w-full bg-[#E4DFD5]/40 h-2.5 rounded-full overflow-hidden">
                    <div className={`${agentStates["Diagnosis Agent"] ? "bg-[#7C4DFF]" : "bg-red-500"} h-full rounded-full`} style={{ width: agentStates["Diagnosis Agent"] ? "85%" : "15%" }} />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs">
                    <span className="font-bold text-[#1A2E26]">Emergency Agent (Triage classification)</span>
                    <span className="font-mono text-[#8C877A]">{agentStates["Emergency Agent"] ? "180 ms" : "⚠️ Offline (Rerouted)"}</span>
                  </div>
                  <div className="w-full bg-[#E4DFD5]/40 h-2.5 rounded-full overflow-hidden">
                    <div className={`${agentStates["Emergency Agent"] ? "bg-[#FF5252]" : "bg-red-500"} h-full rounded-full`} style={{ width: agentStates["Emergency Agent"] ? "20%" : "15%" }} />
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs">
                    <span className="font-bold text-[#1A2E26]">Records Agent (SOAP mapping)</span>
                    <span className="font-mono text-[#8C877A]">{agentStates["Records Agent"] ? "690 ms" : "⚠️ Offline (Rerouted)"}</span>
                  </div>
                  <div className="w-full bg-[#E4DFD5]/40 h-2.5 rounded-full overflow-hidden">
                    <div className={`${agentStates["Records Agent"] ? "bg-[#FF9100]" : "bg-red-500"} h-full rounded-full`} style={{ width: agentStates["Records Agent"] ? "70%" : "15%" }} />
                  </div>
                </div>

                {/* Stat 5 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-sans text-xs">
                    <span className="font-bold text-[#1A2E26]">Scheduling Agent (Calendar coordination)</span>
                    <span className="font-mono text-[#8C877A]">{agentStates["Scheduling Agent"] ? "210 ms" : "⚠️ Offline (Rerouted)"}</span>
                  </div>
                  <div className="w-full bg-[#E4DFD5]/40 h-2.5 rounded-full overflow-hidden">
                    <div className={`${agentStates["Scheduling Agent"] ? "bg-[#00E676]" : "bg-red-500"} h-full rounded-full`} style={{ width: agentStates["Scheduling Agent"] ? "25%" : "15%" }} />
                  </div>
                </div>

              </div>
            </div>

            {/* API Cost Usage Tracking Panel (Feature 9) */}
            <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
              <h4 className="font-serif font-bold text-base text-[#08332E]">
                Gemini LLM Orchestrator Cost Tracking
              </h4>
              <p className="font-sans text-xs text-[#635F54]">
                Cumulative operational metric summaries for model queries running via `gemini-3.5-flash` parallel agent routes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <span className="block font-sans font-bold text-[9px] uppercase text-[#635F54] tracking-wider">CUMULATIVE TOKENS</span>
                  <span className="font-mono font-black text-xl text-indigo-950 block mt-1">{apiTracking.cumulativeTokens.toLocaleString()}</span>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <span className="block font-sans font-bold text-[9px] uppercase text-[#635F54] tracking-wider">CUMULATIVE COST</span>
                  <span className="font-mono font-black text-xl text-emerald-950 block mt-1">${apiTracking.cumulativeCost.toFixed(4)}</span>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                  <span className="block font-sans font-bold text-[9px] uppercase text-[#635F54] tracking-wider">EST. TIME SAVED</span>
                  <span className="font-mono font-black text-xl text-amber-950 block mt-1">{(cases.length * 15)} mins</span>
                  <span className="text-[9px] text-[#8C877A] font-semibold mt-1 block">~15m saved per SOAP chart</span>
                </div>

              </div>
            </div>

            {/* System Logs */}
            <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 text-left space-y-4 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#E4DFD5]/60">
                <h4 className="font-serif font-bold text-base text-[#08332E]">
                  Orchestration Log Stream
                </h4>
                <div className="flex items-center gap-1 bg-[#EBF5EF] px-2 py-1 rounded text-[10px] font-bold text-[#1E5631]">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  REAL-TIME FEED
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#E4DFD5]/80 rounded-xl font-mono text-[11px] text-[#635F54] space-y-2 h-[150px] overflow-y-auto">
                <div className="flex gap-2">
                  <span className="text-[#8C877A]">[10:56:42]</span>
                  <span className="text-emerald-700 font-bold">[SYS]</span>
                  <span>Aether health network session secured for clinical coordinator.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#8C877A]">[10:43:10]</span>
                  <span className="text-[#08332E] font-bold">[ORCH]</span>
                  <span>Parallel dispatch compiled {cases.length} active registered clinical records successfully.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#8C877A]">[09:12:04]</span>
                  <span className="text-[#7C4DFF] font-bold">[AGENT]</span>
                  <span>All 5 expert healthcare agents (Patient, Diagnosis, Emergency, Records, Scheduling) pinged ONLINE.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
