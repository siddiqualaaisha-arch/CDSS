import { UserCheck, ShieldAlert, FileText, CalendarCheck, HeartPulse } from "lucide-react";

interface AgentMeshProps {
  status: "idle" | "thinking" | "completed";
  emergencyRisk?: string;
  activeAgentIndex: number; // For step-by-step thinking simulation
}

export default function AgentMesh({ status, emergencyRisk, activeAgentIndex }: AgentMeshProps) {
  const agents = [
    {
      name: "Patient Agent",
      role: "Intake & symptoms",
      icon: UserCheck,
      bgColor: "bg-[#08332E]/10 text-[#08332E]",
      dotColor: "bg-[#08332E]"
    },
    {
      name: "Diagnosis Agent",
      role: "Differential analysis",
      icon: HeartPulse,
      bgColor: "bg-[#7C4DFF]/10 text-[#7C4DFF]",
      dotColor: "bg-[#7C4DFF]"
    },
    {
      name: "Emergency Agent",
      role: "Red-flag triage",
      icon: ShieldAlert,
      bgColor: "bg-[#FF5252]/10 text-[#FF5252]",
      dotColor: "bg-[#FF5252]"
    },
    {
      name: "Records Agent",
      role: "EHR & history",
      icon: FileText,
      bgColor: "bg-[#FF9100]/10 text-[#FF9100]",
      dotColor: "bg-[#FF9100]"
    },
    {
      name: "Scheduling Agent",
      role: "Appointments & reminders",
      icon: CalendarCheck,
      bgColor: "bg-[#00E676]/10 text-[#00A254]",
      dotColor: "bg-[#00E676]"
    }
  ];

  return (
    <div className="w-full bg-[#FAF8F5] border border-[#E4DFD5] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E4DFD5]/60">
        <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-[#08332E]">
          Agent Mesh
        </h3>
        <span className="font-mono text-[10px] text-[#8C877A] uppercase tracking-widest flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'thinking' ? 'animate-ping bg-amber-500' : 'bg-[#08332E]'}`}></span>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === 'thinking' ? 'bg-amber-500' : 'bg-[#08332E]'}`}></span>
          </span>
          {status === "thinking" ? "evaluating" : status === "completed" ? "live" : "idle"}
        </span>
      </div>

      <div className="space-y-3">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          
          // Determine the status dot state
          let pulseClass = "";
          let dotColorClass = "bg-[#D0C9BC]";
          
          if (status === "thinking") {
            if (idx === activeAgentIndex) {
              pulseClass = "animate-ping bg-amber-500";
              dotColorClass = "bg-amber-500";
            } else if (idx < activeAgentIndex) {
              dotColorClass = "bg-[#2E7D32]";
            }
          } else if (status === "completed") {
            if (agent.name === "Emergency Agent" && emergencyRisk === "CRITICAL") {
              pulseClass = "animate-ping bg-red-600";
              dotColorClass = "bg-red-600";
            } else {
              dotColorClass = "bg-[#2E7D32]";
            }
          }

          return (
            <div
              key={agent.name}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                status === "thinking" && idx === activeAgentIndex
                  ? "bg-amber-50/50 border-amber-300 shadow-xs scale-[1.02]"
                  : "bg-white border-[#E4DFD5]/60 hover:border-[#C4BEB3]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${agent.bgColor} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-xs text-[#1A2E26]">
                    {agent.name}
                  </h4>
                  <p className="font-sans text-[11px] text-[#635F54]">{agent.role}</p>
                </div>
              </div>

              {/* Status Indicator Dot */}
              <div className="flex items-center justify-center pr-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  {pulseClass && (
                    <span className={`absolute inline-flex h-full w-full rounded-full ${pulseClass}`}></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColorClass} transition-colors duration-300`}></span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orchestration flow graph description */}
      <div className="mt-5 p-3.5 rounded-xl bg-[#F0EDE6]/60 border border-[#E4DFD5]/40">
        <p className="font-sans text-[11px] text-[#635F54] leading-relaxed">
          <strong className="text-[#08332E]">Architecture:</strong> Patient → (Diagnosis || Emergency) → (Records || Scheduling). Each agent uses structured tool-calling on Gemini 3.5 Flash via Aether AI.
        </p>
      </div>
    </div>
  );
}
