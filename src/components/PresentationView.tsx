import React, { useState, useEffect } from "react";
import pptxgen from "pptxgenjs";
import { 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  Sparkles, 
  Activity, 
  Copy, 
  Check, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  Tv, 
  ListOrdered 
} from "lucide-react";

interface Slide {
  number: number;
  title: string;
  subtitle: string;
  points: string[];
  graphicType: "hero" | "challenge" | "architecture" | "agent" | "triage" | "tools" | "roi";
  colorTheme: string;
  speakerNotes: string;
}

export default function PresentationView() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);

  const slides: Slide[] = [
    {
      number: 1,
      title: "Aether Health Coordination Network",
      subtitle: "Generative AI Multi-Agent Orchestration for Modern Clinical Workflows",
      points: [
        "A breakthrough clinical platform orchestrating 5 specialized AI agents concurrently",
        "Unified health dashboard providing unified context across separate clinical domains",
        "Built with Gemini 3.5 Flash to establish zero-latency, high-accuracy care coordination",
        "Elegant, physician-first visual design optimized for clinical focus and rapid decision-making"
      ],
      graphicType: "hero",
      colorTheme: "bg-[#08332E] text-[#FAF8F5]",
      speakerNotes: "Welcome everyone to the Aether Health Presentation. Today we are introducing Aether Health, a multi-agent clinical coordination network that uses state-of-the-art generative AI to automate, coordinate, and streamline clinical documentation and diagnostic workflows. Instead of isolated chat interfaces, Aether brings together 5 specialized agents to deliver a unified clinical workspace."
    },
    {
      number: 2,
      title: "The Core Clinical Challenge",
      subtitle: "Why Traditional Electronic Health Records & Portals Fail Clinicians",
      points: [
        "Cognitive Overload: Doctors spend up to 4.5 hours daily on charting and clicking menus",
        "Fragmented Systems: Emergency triage, primary scheduling, and clinical records operate in silos",
        "Clinical Turnaround Gaps: Interpreting complex lab reports and typing discharge summaries takes valuable hours",
        "Red-Flag Blindspots: Subtle symptoms are easily missed in traditional asynchronous static text entry"
      ],
      graphicType: "challenge",
      colorTheme: "bg-white text-[#08332E]",
      speakerNotes: "The biggest bottleneck in modern medicine is administrative burden. Doctors are drowning in administrative tasks, spend hours on paperwork rather than direct patient care, and are forced to use disconnected software. Traditional EHR portals are clunky database registries rather than active, supportive medical tools."
    },
    {
      number: 3,
      title: "Multi-Agent Hub-and-Spoke Architecture",
      subtitle: "Concurrently Orchestrated Clinical Care Pathways",
      points: [
        "Central Coordinator Hub: Receives arbitrary unstructured patient intake text and coordinates the agents",
        "Concurrent Execution Flow: Dispatches parallel tasks to five specialist agents instead of sequential chains",
        "Deterministic JSON Output: Powered by structured schema validation for safe, programmatic clinical states",
        "Unified Telemetry: Continuous monitoring of agent performance, reasoning states, and confidence metrics"
      ],
      graphicType: "architecture",
      colorTheme: "bg-white text-[#08332E]",
      speakerNotes: "To solve this, Aether Health implements a multi-agent hub-and-spoke system. When unstructured clinical text is submitted, our centralized coordinator dispatches tasks concurrently to five distinct, domain-specific agents. Every response is governed by standard schemas, ensuring the output is perfectly structured and reliable."
    },
    {
      number: 4,
      title: "Agent 1 & 2: Intake & Diagnostic Reasoning",
      subtitle: "Precision Patient Profiling and Evidence-Based Differentials",
      points: [
        "Patient Intake Agent: Automatically parses symptoms, registers demographics, and validates key complaint drivers",
        "Diagnosis Reasoning Agent: Analyzes clinical markers, matches patterns with medical guidelines",
        "Differential Diagnostics: Generates a prioritized list of primary and secondary rule-out conditions",
        "Physician Copilot: Suggests diagnostic tests and specialist consults without dictating final outcomes"
      ],
      graphicType: "agent",
      colorTheme: "bg-[#FAF8F5] text-[#08332E]",
      speakerNotes: "Let's zoom into the first two agents. The Patient Intake Agent extracts structured demographics, while the Diagnosis Reasoning Agent generates complete, prioritized differential diagnoses, complete with severity levels and suggested tests, giving clinicians a solid diagnostic foundation."
    },
    {
      number: 5,
      title: "Agent 3: Real-Time Emergency Triage",
      subtitle: "A Zero-Delay Safety Net for High-Risk Clinical Presentations",
      points: [
        "Continuous Triage Assessment: Scans all case inputs for red-flags and severe clinical warnings",
        "Emergency Risk Stratification: Tags cases as Critical, Moderate, or Standard within milliseconds",
        "Active Telemetry Dispatch: Automatically triggers alerts and emergency notifications for hospital standby",
        "Ambulance Coordination: Pre-emptively coordinates critical information prior to patient arrival"
      ],
      graphicType: "triage",
      colorTheme: "bg-white text-[#08332E]",
      speakerNotes: "Safety is our highest priority. The Emergency Triage Agent works alongside other agents to instantly screen the case for critical warning signs. If an acute threat, like an active myocardial infarction, is detected, it triggers automated high-urgency notifications for cardiologists and ambulance dispatchers."
    },
    {
      number: 6,
      title: "Agent 4: Clinical Record Integration",
      subtitle: "Automating SOAP Notes and Matching Historic Data",
      points: [
        "Dynamic Profile Reconciliation: Looks up patient records and matches previous histories",
        "Automated SOAP Documentation: Translates raw notes into formal Subjective, Objective, Assessment, and Plan notes",
        "Allergy & Contraindication Check: Cross-references prior records with the current active medications list",
        "Standardized Structured Output: Ready for immediate copying or direct export to core hospital records"
      ],
      graphicType: "agent",
      colorTheme: "bg-white text-[#08332E]",
      speakerNotes: "The Clinical Records Agent automatically matches historical data, detects drug allergies, and structures the patient's presentation into standard SOAP notes—the universal language of clinical medicine. This cuts documentation times from hours down to seconds."
    },
    {
      number: 7,
      title: "Agent 5: Intelligent Scheduling & Medications",
      subtitle: "Connecting Care Pathways to Actionable Care Steps",
      points: [
        "Specialist Recommendation: Maps diagnosis conclusions to relevant medical departments and subspecialists",
        "Dynamic Slot Scheduling: Checks clinician schedules and secures optimal next-day consultation times",
        "Medication Guidelines: Suggests evidence-based clinical therapy options including dosage and frequency",
        "Inter-Provider Handshake: Generates seamless outpatient referrals and tracks follow-up status"
      ],
      graphicType: "agent",
      colorTheme: "bg-[#FAF8F5] text-[#08332E]",
      speakerNotes: "An assessment is only useful if there is a plan. Our Scheduling and Medications Agent automatically links the diagnosis to the correct subspecialists, suggests optimal appointment times, and provides evidence-based dosing schedules to ensure the patient's care pathway is immediately actionable."
    },
    {
      number: 8,
      title: "Interactive Clinical Tool: Lab Report Interpreter",
      subtitle: "Unlocking Unstructured PDF Medical Diagnostics with AI",
      points: [
        "Advanced Medical OCR Interpretation: Parses complex, unformatted lab values from plain text or reports",
        "Visual High-Risk Highlighting: Automatically flags LOW, HIGH, and CRITICAL blood work counts in red",
        "Evidence-Based Explanations: Explains physiological meanings of complex parameters (e.g. hematocrit, neutrophils)",
        "Direct Intake Synchronization: Feeds interpreted clinical values directly back into the core intake board"
      ],
      graphicType: "tools",
      colorTheme: "bg-white text-[#08332E]",
      speakerNotes: "Aether Health also includes advanced diagnostic tools. Our Lab Report Interpreter takes unstructured raw clinical lab values, like a Complete Blood Count, identifies low or high counts, explains their pathophysiological significance, and feeds this structured data directly back to the active case file."
    },
    {
      number: 9,
      title: "Interactive Clinical Tool: Discharge Summary & PDF Export",
      subtitle: "Clinician-Approved Document Synthesis with Instant Printing",
      points: [
        "Discharge Summary Synthesizer: Translates agent findings and clinical inputs into formal hospital letters",
        "Robust jsPDF Document Generation: Creates clean, professional, styled reports directly in the client browser",
        "Interactive Physician Sign-offs: Includes signature blocks, date seals, and risk categorization headers",
        "Standardized Offline Records: Easy printing or physical archiving to bridge the gap with paper-based offices"
      ],
      graphicType: "tools",
      colorTheme: "bg-white text-[#08332E]",
      speakerNotes: "The Patient Summary tool enables clinicians to compile all diagnostic findings, intake information, and care plans into a cohesive, beautifully formatted Discharge Summary. We have built an offline PDF export tool using jsPDF that generates polished, print-ready clinician-signed reports in one click."
    },
    {
      number: 10,
      title: "Impact, ROI, and Future Outlook",
      subtitle: "Driving Clinical Excellence, Security, and Time Savings",
      points: [
        "80% Documentation Time Reduction: Doctors reclaim valuable hours, drastically reducing burnouts",
        "Enhanced Safety Guardrails: Immediate emergency checks and allergy alerts prevent medical oversights",
        "Robust Gemini Resiliency: Implemented exponential backoff with jitter to handle API surges and guarantee uptime",
        "Interoperable Future: Scalable schema designs ready to integrate with Epic, Cerner, and national databases"
      ],
      graphicType: "roi",
      colorTheme: "bg-[#08332E] text-[#FAF8F5]",
      speakerNotes: "In conclusion, Aether Health represents the modern doctor's desk. By automating 80% of administrative overhead, ensuring zero-delay red-flag screening, and guaranteeing uptime with robust API retry backoffs, Aether is ready to scale healthcare delivery to the next level."
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const downloadPPTX = async () => {
    try {
      setDownloading(true);
      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_16x9";
      
      slides.forEach((s) => {
        const slideItem = pptx.addSlide();
        
        // Background color
        const isDark = s.colorTheme.includes("bg-[#08332E]");
        const bgColor = isDark ? "08332E" : s.colorTheme.includes("bg-[#FAF8F5]") ? "FAF8F5" : "FFFFFF";
        const textColor = isDark ? "FAF8F5" : "08332E";
        const accentColor = "00A254"; // Green accent
        
        slideItem.background = { fill: bgColor };
        
        // Slide Category / Indicator
        slideItem.addText(`SLIDE 0${s.number} OF 10  |  AETHER HEALTH COORDINATION`, {
          x: 0.8,
          y: 0.5,
          w: 8.0,
          h: 0.4,
          fontSize: 10,
          bold: true,
          color: accentColor,
          fontFace: "Arial",
        });
        
        // Slide Title
        slideItem.addText(s.title, {
          x: 0.8,
          y: 1.0,
          w: 11.5,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: textColor,
          fontFace: "Georgia",
        });
        
        // Slide Subtitle
        slideItem.addText(s.subtitle, {
          x: 0.8,
          y: 1.7,
          w: 11.5,
          h: 0.5,
          fontSize: 14,
          italic: true,
          color: isDark ? "A1D9C3" : "635F54",
          fontFace: "Arial",
        });
        
        // Bullets (left side)
        const textObjects = s.points.map(p => ({
          text: p + "\n\n",
          options: { bullet: { type: "bullet" }, fontSize: 13, color: textColor, fontFace: "Arial" }
        }));
        
        slideItem.addText(textObjects as any, {
          x: 0.8,
          y: 2.5,
          w: 6.8,
          h: 4.2,
          valign: "top"
        });
        
        // Graphic representation on the right (x: 8.0, y: 2.5, w: 4.5, h: 4.0)
        slideItem.addShape(pptx.ShapeType.roundRect, {
          x: 8.0,
          y: 2.5,
          w: 4.5,
          h: 4.0,
          fill: { color: isDark ? "0F4D45" : "F2F1EE" },
          line: { color: accentColor, width: 1 }
        });
        
        // Diagram Title
        slideItem.addText(`Visual Model: ${s.graphicType.toUpperCase()}`, {
          x: 8.2,
          y: 2.7,
          w: 4.1,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: accentColor,
          align: "center",
          fontFace: "Arial"
        });
        
        // Diagram dynamic text details based on slide type
        let diagramLabel = "";
        let diagramDetail = "";
        if (s.graphicType === "hero") {
          diagramLabel = "Unified Coordination Hub";
          diagramDetail = "Synchronous dispatch pathways driving high-accuracy clinical outcomes.";
        } else if (s.graphicType === "challenge") {
          diagramLabel = "Clinical Friction Points";
          diagramDetail = "Eliminates cognitive load, fragmented charting, and red-flag delays.";
        } else if (s.graphicType === "architecture") {
          diagramLabel = "Hub & Spoke Network";
          diagramDetail = "5 concurrent specialist agents governed by strict JSON schemas.";
        } else if (s.graphicType === "triage") {
          diagramLabel = "Emergency Red-Flag Guard";
          diagramDetail = "Active triage monitoring with automated high-urgency alerts.";
        } else if (s.graphicType === "tools") {
          diagramLabel = "Interpreters & Compilers";
          diagramDetail = "Lab data parser and jsPDF print-ready clinical summarizers.";
        } else if (s.graphicType === "roi") {
          diagramLabel = "80% Practice Savings";
          diagramDetail = "Reclaiming clinical time to focus entirely on direct patient care.";
        } else {
          diagramLabel = "Aether Specialist Agent";
          diagramDetail = "Domain-specific diagnostic assessment with continuous telemetry validation.";
        }
        
        slideItem.addText(diagramLabel, {
          x: 8.2,
          y: 3.5,
          w: 4.1,
          h: 0.5,
          fontSize: 16,
          bold: true,
          color: textColor,
          align: "center",
          fontFace: "Georgia"
        });
        
        slideItem.addText(diagramDetail, {
          x: 8.2,
          y: 4.2,
          w: 4.1,
          h: 1.5,
          fontSize: 12,
          color: isDark ? "FAF8F5" : "635F54",
          align: "center",
          fontFace: "Arial"
        });
        
        // Speaker notes
        slideItem.addNotes(s.speakerNotes);
      });
      
      await pptx.writeFile({ fileName: "Aether_Health_Clinical_Network_Presentation.pptx" });
    } catch (err) {
      console.error("Failed to generate PPTX:", err);
    } finally {
      setDownloading(false);
    }
  };

  const copyPresentationText = () => {
    const text = slides.map(s => (
      `SLIDE ${s.number}: ${s.title}\n` +
      `Subtitle: ${s.subtitle}\n` +
      `---------------------------------------------\n` +
      s.points.map(p => `• ${p}`).join("\n") + "\n\n" +
      `[Speaker Notes]: ${s.speakerNotes}\n` +
      `=============================================\n\n`
    )).join("");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slide = slides[currentSlide];

  return (
    <div id="project-presentation" className="w-full space-y-6 text-left">
      
      {/* Title Header with Export Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 border border-[#E4DFD5] rounded-3xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-[#00A254]" />
            <h3 className="font-serif font-medium text-lg text-[#08332E]">
              Project Slide Deck Presentation
            </h3>
          </div>
          <p className="text-[11px] text-[#635F54] mt-1 font-sans">
            Use this interactive slideshow to present the 10-slide project overview, complete with visual diagrams and speaker notes.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={downloadPPTX}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#08332E] hover:bg-[#0c443e] disabled:bg-[#8C877A] text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            {downloading ? (
              <>
                <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                <span>Generating PowerPoint...</span>
              </>
            ) : (
              <>
                <Presentation className="w-4 h-4" />
                <span>Download .PPTX File</span>
              </>
            )}
          </button>

          <button
            onClick={copyPresentationText}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F5] border border-[#E4DFD5] hover:bg-[#F2F1EE] text-[#08332E] rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#00A254]" />
                <span className="text-[#00A254]">Copied PPT to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Slide Texts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Slideshow Board */}
      <div className={`grid grid-cols-1 ${showSpeakerNotes ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-6`}>
        
        {/* Slide Frame */}
        <div className={`lg:col-span-3 border border-[#E4DFD5] rounded-3xl shadow-md overflow-hidden flex flex-col justify-between min-h-[480px] bg-white transition-all`}>
          
          {/* Top Info Bar */}
          <div className="px-6 py-3 border-b border-[#E4DFD5]/40 bg-[#FAF8F5] flex justify-between items-center text-[10px] font-bold text-[#8C877A] uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#08332E]" />
              <span>Aether Health Network Deck</span>
            </div>
            <div>
              Slide {slide.number} of 10
            </div>
          </div>

          {/* Slide Body Canvas */}
          <div className={`flex-1 p-8 sm:p-12 flex flex-col justify-center gap-8 ${slide.colorTheme}`}>
            <div>
              <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-[#00A254] text-white px-2.5 py-0.5 rounded-full mb-3">
                Slide 0{slide.number}
              </span>
              <h1 className="text-2xl sm:text-3.5xl font-serif font-bold tracking-tight leading-tight">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-sm font-sans mt-2 opacity-80 italic">
                {slide.subtitle}
              </p>
            </div>

            {/* Split layout: Bullet points + Graphic Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Bullet Points */}
              <ul className="space-y-4 text-left">
                {slide.points.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-sans leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A254] shrink-0 mt-2" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              {/* Graphic Diagram Mockups */}
              <div className="flex justify-center items-center h-48 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-black/5 rounded-2xl p-6">
                
                {slide.graphicType === "hero" && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full border border-dashed border-[#00A254]/50 animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute w-32 h-32 rounded-full border border-[#00A254]/20 animate-ping" />
                    <div className="w-16 h-16 rounded-2xl bg-[#00A254] flex items-center justify-center text-white shadow-lg relative z-10">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  </div>
                )}

                {slide.graphicType === "challenge" && (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {["Cognitive Noise", "Fragmented EHR", "Burdened Doctors", "Delayed Care"].map((txt, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200/50 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-red-800 uppercase tracking-tight block">{txt}</span>
                        <span className="text-[18px] font-black text-red-900 block mt-1">✗ Fail</span>
                      </div>
                    ))}
                  </div>
                )}

                {slide.graphicType === "architecture" && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#08332E] text-white flex items-center justify-center font-bold text-xs shadow-md z-10 border border-[#FAF8F5]/20">
                      Hub
                    </div>
                    {[0, 72, 144, 216, 288].map((angle, idx) => {
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * 45;
                      const y = Math.sin(rad) * 45;
                      return (
                        <div 
                          key={idx} 
                          className="absolute w-8 h-8 rounded-full bg-[#00A254] text-white text-[10px] font-black flex items-center justify-center shadow-xs"
                          style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                          A{idx+1}
                        </div>
                      );
                    })}
                  </div>
                )}

                {slide.graphicType === "agent" && (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 p-3.5 bg-white border border-[#E4DFD5] rounded-xl text-center shadow-xs">
                      <span className="text-[9px] font-extrabold text-[#8C877A] uppercase block">Unstructured</span>
                      <div className="h-1 w-full bg-gray-200 rounded-full mt-2 animate-pulse" />
                      <div className="h-1 w-4/5 bg-gray-200 rounded-full mt-1.5 animate-pulse" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#00A254]" />
                    <div className="flex-1 p-3.5 bg-[#08332E] text-[#FAF8F5] border border-[#FAF8F5]/10 rounded-xl text-center shadow-sm">
                      <span className="text-[9px] font-black uppercase text-[#00A254] block">Aether Agent</span>
                      <span className="text-[10px] font-bold block mt-1">✓ Structured SOAP</span>
                    </div>
                  </div>
                )}

                {slide.graphicType === "triage" && (
                  <div className="w-full text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-full font-black text-xs animate-bounce shadow-md">
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span>CRITICAL DETECTED</span>
                    </div>
                    <p className="text-[10px] text-[#635F54] font-medium leading-normal max-w-[200px] mx-auto">
                      Automated ambulance dispatch & doctor notification alert initiated
                    </p>
                  </div>
                )}

                {slide.graphicType === "tools" && (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="p-3 bg-white border border-[#E4DFD5] rounded-xl text-center shadow-xs">
                      <span className="text-[8px] font-bold text-[#8C877A] block">Blood Report</span>
                      <span className="text-xs font-black text-[#08332E] block mt-1">LOW HB 10.2</span>
                    </div>
                    <div className="p-3 bg-white border border-[#E4DFD5] rounded-xl text-center shadow-xs">
                      <span className="text-[8px] font-bold text-[#8C877A] block">Discharge PDF</span>
                      <span className="text-xs font-black text-[#00A254] block mt-1">PRINT READY</span>
                    </div>
                  </div>
                )}

                {slide.graphicType === "roi" && (
                  <div className="text-center">
                    <span className="text-5xl font-serif font-black text-[#00A254] block animate-pulse">80%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#635F54] block mt-1">Time Saved on Paperwork</span>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Bottom Slider Navigation controls */}
          <div className="px-6 py-4 border-t border-[#E4DFD5]/40 bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="p-2 border border-[#E4DFD5] hover:bg-[#F2F1EE] disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-[#08332E] transition-all cursor-pointer"
                title="Previous Slide (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentSlide === slides.length - 1}
                className="p-2 border border-[#E4DFD5] hover:bg-[#F2F1EE] disabled:opacity-40 disabled:hover:bg-transparent rounded-xl text-[#08332E] transition-all cursor-pointer"
                title="Next Slide (Right Arrow or Space)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Progress indicators dots */}
            <div className="hidden sm:flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide ? "bg-[#00A254] w-5" : "bg-[#E4DFD5] hover:bg-[#8C877A]"
                  }`}
                  title={`Go to Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Toggle speaker notes */}
            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`px-3.5 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showSpeakerNotes 
                  ? "bg-[#08332E]/10 border-[#08332E]/20 text-[#08332E]" 
                  : "bg-white border-[#E4DFD5] text-[#635F54] hover:bg-[#FAF8F5]"
              }`}
            >
              {showSpeakerNotes ? "Hide Notes" : "Show Speaker Notes"}
            </button>
          </div>

        </div>

        {/* Speaker Notes Sidebar Panel */}
        {showSpeakerNotes && (
          <div className="lg:col-span-1 border border-[#E4DFD5] rounded-3xl bg-white p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E4DFD5]/40">
                <Volume2 className="w-4 h-4 text-[#00A254]" />
                <h4 className="font-serif font-bold text-sm text-[#08332E]">
                  Speaker Notes
                </h4>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E4DFD5]/60 min-h-[220px]">
                <p className="text-xs text-[#635F54] leading-relaxed font-sans font-medium whitespace-pre-wrap">
                  {slide.speakerNotes}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E4DFD5]/40 mt-4 text-[10px] text-[#8C877A] font-bold uppercase tracking-wider space-y-1">
              <div>Presentation Mode Active</div>
              <div className="font-normal font-sans lowercase text-[#635F54]">Use Left/Right keyboard arrows to navigate</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
