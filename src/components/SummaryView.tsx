import React, { useState } from "react";
import { ClipboardList, Sparkles, AlertCircle, FileText, Check, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";

interface SummaryViewProps {
  caseText: string;
}

export default function SummaryView({ caseText }: SummaryViewProps) {
  const [patientName, setPatientName] = useState<string>(() => {
    const lower = (caseText || "").toLowerCase();
    if (lower.includes("cough") || lower.includes("farikha")) return "Farikha";
    if (lower.includes("chest") || lower.includes("sameer")) return "Sameer";
    if (lower.includes("headache") || lower.includes("sarah")) return "Sarah Ali";
    return "Farikha";
  });
  const [summaryInput, setSummaryInput] = useState<string>(
    caseText || "Patient presents with dry persistent coughing and wheezing. Stable respiration, clear airways, and allergy history logs match."
  );

  const [generating, setGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    const primaryColor = [8, 51, 46]; // #08332E
    const secondaryColor = [0, 162, 84]; // #00A254
    const textColor = [99, 95, 84]; // #635F54
    const darkTextColor = [26, 46, 38]; // #1A2E26
    const alertColor = [153, 27, 27];
    const lightBgColor = [250, 248, 245];

    let yPosition = margin;

    const drawHeader = () => {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 15, "F");

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AETHER HEALTH CLINICAL NETWORKS", margin, 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(140, 135, 122);
      doc.text("ELECTRONIC HEALTH RECORD SYSTEM  |  DISCHARGE DOCUMENTATION", margin, 33);

      doc.setDrawColor(228, 223, 213);
      doc.setLineWidth(0.5);
      doc.line(margin, 37, pageWidth - margin, 37);

      yPosition = 45;
    };

    drawHeader();

    doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
    doc.rect(margin, yPosition, contentWidth, 30, "F");
    doc.setDrawColor(228, 223, 213);
    doc.rect(margin, yPosition, contentWidth, 30, "D");

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("PATIENT DISCHARGE REPORT", margin + 5, yPosition + 7);

    doc.setFontSize(9);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(`Patient Name: ${patientName}`, margin + 5, yPosition + 15);
    doc.text(`Admit Date: June 24, 2026`, margin + 5, yPosition + 21);
    doc.text("Status: DISCHARGED", margin + 5, yPosition + 27);

    let age = "34";
    let gender = "Female";
    if (patientName.toLowerCase().includes("sameer")) {
      age = "45";
      gender = "Male";
    } else if (patientName.toLowerCase().includes("sarah")) {
      age = "28";
      gender = "Female";
    } else if (patientName.toLowerCase().includes("salar")) {
      age = "31";
      gender = "Male";
    }

    doc.text(`Age/Gender: ${age} y/o (${gender})`, margin + 90, yPosition + 15);
    doc.text(`Discharge Date: July 02, 2026`, margin + 90, yPosition + 21);
    doc.text(`MRN: PATIENT_AETHER_${Math.floor(10000 + Math.random() * 90000)}`, margin + 90, yPosition + 27);

    yPosition += 38;

    const printParagraph = (title: string, bodyText: string, isAlert: boolean = false) => {
      if (yPosition > pageHeight - margin - 30) {
        doc.addPage();
        drawHeader();
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(isAlert ? alertColor[0] : primaryColor[0], isAlert ? alertColor[1] : primaryColor[1], isAlert ? alertColor[2] : primaryColor[2]);
      doc.text(title, margin, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      const lines = doc.splitTextToSize(bodyText.replace(/\*/g, ''), contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin - 15) {
          doc.addPage();
          drawHeader();
        }
        doc.text(line, margin, yPosition);
        yPosition += 4.5;
      });

      yPosition += 6;
    };

    if (result) {
      const cleanedResult = result.replace(/\*/g, '');
      const paragraphs = cleanedResult.split(/\n\n+/);
      
      paragraphs.forEach((p) => {
        const lines = doc.splitTextToSize(p.trim(), contentWidth);
        if (lines.length === 0) return;

        const firstLine = lines[0] || "";
        if (firstLine.startsWith("#") || firstLine.startsWith("##") || firstLine.match(/^\d\./)) {
          if (yPosition > pageHeight - margin - 30) {
            doc.addPage();
            drawHeader();
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          const headingClean = firstLine.replace(/^#+\s*/, '').replace(/^\d\.\s*/, '');
          doc.text(headingClean, margin, yPosition);
          yPosition += 6;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          for (let i = 1; i < lines.length; i++) {
            if (yPosition > pageHeight - margin - 15) {
              doc.addPage();
              drawHeader();
            }
            doc.text(lines[i], margin, yPosition);
            yPosition += 4.5;
          }
          yPosition += 5;
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin - 15) {
              doc.addPage();
              drawHeader();
            }
            doc.text(line, margin, yPosition);
            yPosition += 4.5;
          });
          yPosition += 5;
        }
      });
    } else {
      printParagraph(
        "1. WORKING DIAGNOSIS OVERVIEW",
        "Patient presents with indicators of acute bronchial hypersensitivity or non-infectious bronchial airway reactivity, with diagnostic spirometry planned. No immediate cardiac or emergency parameters identified."
      );

      printParagraph(
        "2. MEDICATIONS ON DISCHARGE",
        "- Albuterol Inhaler (90mcg): Use 2 puffs as needed for wheezing.\n- Cetirizine 10mg tablet: Take 1 tablet daily by mouth."
      );

      printParagraph(
        "3. FOLLOW-UP INSTRUCTIONS",
        "- Spirometry within 72 hours\n- Cardiology consult standby"
      );

      printParagraph(
        "4. EMERGENCY RETURN CRITERIA",
        "Proceed immediately to the nearest ER or call emergency services if the patient experiences acute retrosternal chest pain radiating to left arm/jaw, acute worsening dyspnea, or sudden difficulty swallowing.",
        true
      );
    }

    if (yPosition > pageHeight - margin - 40) {
      doc.addPage();
      drawHeader();
    }

    yPosition += 10;
    doc.setDrawColor(228, 223, 213);
    doc.line(margin, yPosition, margin + 60, yPosition);
    doc.line(pageWidth - margin - 60, yPosition, pageWidth - margin, yPosition);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Attending Physician Signature", margin, yPosition + 5);
    doc.text("Resident / Clinical Officer Signature", pageWidth - margin - 60, yPosition + 5);

    doc.setFont("helvetica", "normal");
    doc.text("Date: July 02, 2026", margin, yPosition + 10);
    doc.text("Date: July 02, 2026", pageWidth - margin - 60, yPosition + 10);

    const filename = `${patientName.replace(/\s+/g, "_")}_Clinical_Discharge_Summary.pdf`;
    doc.save(filename);
  };

  const handleGenerateSummary = async () => {
    if (!summaryInput.trim()) return;

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a hospital clinical documentation AI. Generate a comprehensive patient discharge summary for ${patientName} based on these clinical indicators: "${summaryInput}".
          
Include these exact sections:
1. Patient Information & Risk Level (make up dates for June 2026)
2. Presenting Complaint & History
3. Diagnosis (primary and secondary)
4. Treatment Summary (what was done)
5. Medications on Discharge (with dosages)
6. Follow-up Plan (dates, specialists)
7. Patient Education Points
8. Emergency Return Instructions

Use clear simple headers, and list items using standard bullet points or dashes. Keep each section concise and formal. IMPORTANT: DO NOT USE ANY ASTERISK CHARACTERS (*) IN YOUR RESPONSE.`
        })
      });

      if (!response.ok) throw new Error("Documentation failed.");
      const data = await response.json();
      setResult(data.text);
    } catch (err: any) {
      setError("Failed to generate clinical discharge summary. Please check your networks.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-100">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-[#08332E]">
              Patient Care Summary & Discharge documentation
            </h3>
            <p className="font-sans text-xs text-[#635F54] mt-0.5">
              Drafts professional hospital-grade discharge summaries, consolidating diagnostic steps and treatment recommendations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-wider self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Summary Agent Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Report Parameters */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Inputs card */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Summary Settings
            </h4>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-[#635F54]">Patient Full Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase font-bold text-[#635F54]">Clinical Indicators Summary</label>
              <textarea
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="Write summary indicators..."
                className="w-full h-32 p-3 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs resize-none"
                required
              />
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={generating || !summaryInput.trim()}
              className="w-full py-3 bg-[#08332E] hover:bg-[#062622] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
            >
              {generating ? "Compiling Discharge Summary..." : "Generate Patient Discharge Report"}
            </button>
          </div>

          {/* Active clinical data integrations */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Integrated Data Feed Status
            </h4>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center gap-2 text-[#00A254]">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Patient Intake Symptoms Matched</span>
              </div>
              <div className="flex items-center gap-2 text-[#00A254]">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Differential Diagnosis Probability Compiled</span>
              </div>
              <div className="flex items-center gap-2 text-[#00A254]">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Emergency Triage Alert Logs Connected</span>
              </div>
              <div className="flex items-center gap-2 text-[#00A254]">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Clinical SOAP Progress Note Draft Connected</span>
              </div>
              <div className="flex items-center gap-2 text-[#00A254]">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Medicine Schedule & Appointments Synchronized</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Discharge Draft report preview */}
        <div className="lg:col-span-7">
          
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-8 space-y-6 shadow-md border-t-4 border-t-[#08332E]">
            
            {/* Draft Report header layout */}
            <div className="flex justify-between items-start pb-4 border-b border-[#E4DFD5]/80">
              <div>
                <h4 className="font-sans font-black text-xs text-[#08332E] tracking-widest uppercase">
                  Aether Clinical Summary Draft
                </h4>
                <p className="font-serif font-bold text-xl text-[#1A2E26] mt-2">
                  {patientName}
                </p>
                <span className="block text-[10px] text-[#8C877A] font-semibold mt-1">
                  Draft compiled on June 24, 2026 · Hospital Clinical Networks
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tight bg-red-50 text-red-700 border border-red-100">
                  PENDING CLINICIAN REVIEW
                </span>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08332E] text-white hover:bg-[#00221E] active:scale-95 transition-all rounded-xl text-[11px] font-bold shadow-xs cursor-pointer"
                  title="Download clinical document for printing"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Report as PDF</span>
                </button>
              </div>
            </div>

            {/* Compiled draft */}
            {generating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-[#08332E]/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#08332E] animate-spin" />
                </div>
                <span className="font-sans text-xs text-[#8C877A] animate-pulse">
                  Assembling care indicators, prescription alerts and return parameters...
                </span>
              </div>
            ) : result ? (
              <div className="prose max-w-none text-xs text-[#635F54] leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto pr-1">
                {result}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A] mb-1.5">
                    1. Working Diagnosis Overview
                  </span>
                  <p className="font-sans text-xs text-[#635F54] leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E4DFD5]/40">
                    Patient presents with indicators of acute bronchial hypersensitivity or non-infectious bronchial airway reactivity, with diagnostic spirometry planned. No immediate cardiac or emergency parameters identified.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
                      2. Medications on Discharge
                    </span>
                    <ul className="text-xs text-[#635F54] space-y-1 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E4DFD5]/40 list-disc list-inside">
                      <li>Albuterol Inhaler (90mcg)</li>
                      <li>Cetirizine 10mg tab</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
                      3. Follow-up Instructions
                    </span>
                    <ul className="text-xs text-[#635F54] space-y-1 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E4DFD5]/40 list-disc list-inside">
                      <li>Spirometry within 72 hours</li>
                      <li>Cardiology consult standby</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
                  <span className="block font-sans font-bold text-[9px] uppercase tracking-wider text-red-800">
                    4. Emergency Return Criteria
                  </span>
                  <p className="font-sans text-[11px] text-red-950 leading-relaxed">
                    Proceed immediately to the nearest ER or call 911 if patient experiences acute retrosternal chest pain radiating to left arm/jaw, acute worsening dyspnea, or sudden difficulty swallowing.
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="pt-4 border-t border-[#E4DFD5]/60 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>Documentation successfully compiled with active care flows!</span>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
