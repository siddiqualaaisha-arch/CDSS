import React, { useState } from "react";
import { Microscope, Upload, FileText, CheckCircle, Sparkles, AlertTriangle, PlayCircle } from "lucide-react";

export default function ReportAnalyzerView() {
  const [reportText, setReportText] = useState<string>(
    "Hemoglobin: 10.2 g/dL (Normal: 13.5-17.5)\nWBC: 12,500/μL (Normal: 4,500-11,000)\nPlatelets: 420,000/μL (Normal: 150,000-400,000)"
  );
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File drag-and-drop / select states
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const loadSampleCBC = () => {
    setReportText(
      `CBC — Complete Blood Count\nPatient: Zayd Rahman   |   Date: June 24, 2026\n\nHemoglobin:  10.2 g/dL   (Normal: 13.5–17.5 g/dL)    LOW\nHematocrit:  31%          (Normal: 38.3–48.6%)         LOW\nWBC:         12,500/μL    (Normal: 4,500–11,000/μL)    HIGH\nNeutrophils: 78%          (Normal: 50–70%)              HIGH\nLymphocytes: 15%          (Normal: 20–40%)              LOW\nPlatelets:   420,000/μL   (Normal: 150,000–400,000/μL) HIGH\nMCV:         72 fL        (Normal: 80–100 fL)           LOW`
    );
    setFileName("sample_cbc_report.txt");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const text = await file.text();
      setReportText(text.slice(0, 2000));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const text = await file.text();
      setReportText(text.slice(0, 2000));
    }
  };

  const handleAnalyzeReport = async () => {
    if (!reportText.trim()) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/clinical-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a medical report interpreter. Analyze these lab results and explain them in simple, clear language for a patient: "${reportText}". For each value: state the name, whether it's normal/low/high, what it means in plain English, and the severity (normal/mild/moderate/severe). End with an overall summary and whether the patient should see a doctor urgently.`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to interpret values.");
      }

      const data = await response.json();
      setResult(data.text);
    } catch (err: any) {
      setError("Failed to run laboratory analysis. Please verify your connections.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Structured list of abnormal values to match mockup screenshot
  const abnormalValues = [
    { name: "Hemoglobin", value: "10.2", normalRange: "13.5 – 17.5 g/dL", status: "severe", color: "bg-red-50 text-red-700 border-red-200" },
    { name: "WBC (White Cells)", value: "12,500", normalRange: "4,500 – 11,000", status: "moderate", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { name: "Platelets", value: "420,000", normalRange: "150,000 – 400,000", status: "mild", color: "bg-orange-50 text-orange-800 border-orange-200" }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-[#08332E]">
              Clinical Report Analyzer
            </h3>
            <p className="font-sans text-xs text-[#635F54] mt-0.5">
              Upload laboratory diagnostics or clinical logs to generate an immediate plain-language patient translation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-blue-700 uppercase tracking-wider self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Report Analyzer Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Paste Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* File upload drag zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
              dragActive 
                ? "border-blue-500 bg-blue-50/40" 
                : "border-[#E4DFD5] bg-white hover:bg-[#FAF8F5]/80 hover:border-[#C4BEB3]"
            }`}
          >
            <Upload className="w-10 h-10 text-[#8C877A] mx-auto mb-3" />
            <span className="block font-sans font-bold text-xs text-[#1A2E26] uppercase tracking-wider">
              {fileName ? `Loaded: ${fileName}` : "Drag and drop diagnostic logs here"}
            </span>
            <span className="block text-[11px] text-[#8C877A] mt-1">
              Supports .txt and .csv lab report exports
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.csv"
              className="hidden"
              id="file-select"
            />
            <label
              htmlFor="file-select"
              className="mt-4 inline-block px-4 py-2 bg-[#FAF8F5] border border-[#E4DFD5] hover:bg-[#F2ECE0] text-[#635F54] hover:text-[#08332E] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Select File manually
            </label>
          </div>

          {/* Paste area */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#E4DFD5]/60">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
                Pasted Laboratory Values
              </span>
              <button
                type="button"
                onClick={loadSampleCBC}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlayCircle className="w-4.5 h-4.5 text-blue-600" />
                Load sample CBC
              </button>
            </div>

            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Paste raw clinic values, reference intervals, or lipid logs here..."
              className="w-full h-44 p-4 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl font-mono text-xs text-[#1A2E26] focus:outline-hidden focus:border-[#08332E]"
            />

            <button
              onClick={handleAnalyzeReport}
              disabled={analyzing || !reportText.trim()}
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 disabled:bg-[#D0C9BC] disabled:cursor-not-allowed text-white font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              {analyzing ? "Running laboratory analysis..." : "Analyze Laboratory Report"}
            </button>
          </div>

        </div>

        {/* Right Column: Outcomes explanation & Abnormal Values list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Plain language outcome explanation */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs min-h-[160px]">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-blue-600" />
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E]">
                Plain-Language Diagnostic Breakdown
              </h4>
            </div>

            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-50" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
                </div>
                <span className="font-sans text-xs text-[#8C877A] animate-pulse">
                  Gemini core translating lab intervals...
                </span>
              </div>
            ) : result ? (
              <div className="prose max-w-none text-xs text-[#635F54] leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto pr-1">
                {result}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <p className="font-sans text-xs text-[#8C877A] leading-relaxed py-8 text-center">
                Click "Analyze Laboratory Report" on the left to extract custom ranges and convert clinical metrics to easy-to-read diagnostic narratives.
              </p>
            )}
          </div>

          {/* Abnormal range indicator box */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Abnormal Parameters Detected
            </h4>

            <div className="space-y-3 pt-1.5">
              {abnormalValues.map((v, i) => (
                <div key={i} className={`p-3.5 border rounded-xl flex items-center justify-between gap-4 ${v.color}`}>
                  <div>
                    <span className="block font-sans font-bold text-xs text-[#1A2E26]">
                      {v.name}
                    </span>
                    <span className="block text-[10px] text-[#8C877A]">
                      Standard Reference: {v.normalRange}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-sans font-black text-sm text-[#1A2E26]">
                      {v.value}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-[8.5px] font-black rounded-full uppercase tracking-tight mt-0.5 border border-current">
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
