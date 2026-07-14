import React, { useState } from "react";
import { Calendar, Clock, Bell, Sparkles, User, CheckCircle, Smartphone, Activity } from "lucide-react";
import { MultiAgentResponse } from "../types";

interface SchedulingViewProps {
  data: MultiAgentResponse | null;
}

export default function SchedulingView({ data }: SchedulingViewProps) {
  const scheduling = data?.schedulingAgent;
  const recommendedSpecialist = scheduling?.recommendedSpecialist || "Pulmonologist / Allergist";
  const suggestedTime = scheduling?.suggestedTime || "This Friday at 10:00 AM";

  const reminders = scheduling?.medicineReminders || [
    { medName: "Albuterol Inhaler", dosage: "90 mcg (2 puffs)", frequency: "Every 4-6 hours as needed for wheezing", purpose: "Fast-acting bronchodilator to open airways" },
    { medName: "Cetirizine (Reactine)", dosage: "10 mg", frequency: "Once daily at bedtime", purpose: "Antihistamine to reduce allergic airway triggers" }
  ];

  // Interactive booking states
  const [selectedDoc, setSelectedDoc] = useState<string>("Dr. Yasmin Mahmood (Pulmonology)");
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-06");
  const [selectedTime, setSelectedTime] = useState<string>("10:30");
  const [bookingCode, setBookingCode] = useState<string | null>(null);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `APT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setBookingCode(code);
  };

  // Interactive medicine alarm/alert simulation
  const [activeAlarms, setActiveAlarms] = useState<Record<string, boolean>>({});

  const toggleAlarm = (medName: string) => {
    setActiveAlarms(prev => ({
      ...prev,
      [medName]: !prev[medName]
    }));
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#00A254] border border-emerald-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-[#08332E]">
              Scheduling & Preventive Medicine Coordination
            </h3>
            <p className="font-sans text-xs text-[#635F54] mt-0.5">
              Automates booking calendars with appropriate specialists and coordinates preventative medication frequencies.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
          {scheduling?.failoverTriggered && (
            <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-red-700 uppercase tracking-wider border border-red-100 animate-pulse">
              ⚠️ Backup Planner Active
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#00A254]" />
            Scheduling Active (Conf: {data?.agentConfidences?.schedulingAgent || 90}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Specialist Appointment Booking Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scheduling Guidelines Match Card */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-5 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Recommended Scheduling Criteria
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAF8F5] border border-[#E4DFD5]/80 rounded-xl space-y-1">
                <span className="block font-sans font-bold text-[9px] uppercase tracking-wider text-[#8C877A]">
                  Required Specialist Type
                </span>
                <span className="block text-sm font-extrabold text-[#08332E] leading-relaxed">
                  {recommendedSpecialist}
                </span>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#E4DFD5]/80 rounded-xl space-y-1">
                <span className="block font-sans font-bold text-[9px] uppercase tracking-wider text-[#8C877A]">
                  Suggested Urgency Window
                </span>
                <span className="block text-sm font-extrabold text-[#00A254] leading-relaxed">
                  {suggestedTime}
                </span>
              </div>
            </div>

            {/* Live Interactive Booking form */}
            <form onSubmit={handleBookAppointment} className="space-y-4 pt-4 border-t border-[#E4DFD5]/40">
              <span className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
                Instant Calendar Booking Console
              </span>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-bold text-[#635F54]">Select Clinician</label>
                <select
                  value={selectedDoc}
                  onChange={(e) => setSelectedDoc(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs"
                >
                  <option value="Dr. Yasmin Mahmood (Pulmonology)">Dr. Yasmin Mahmood (Pulmonology Specialist)</option>
                  <option value="Dr. Tariq Mahmood (Interventional Cardiology)">Dr. Tariq Mahmood (Interventional Cardiology)</option>
                  <option value="Dr. Zainab Akhtar (Neurology / Brain Care)">Dr. Zainab Akhtar (Neurology / Brain Care)</option>
                  <option value="Dr. Haroon Al-Farsi (General / Family Clinic)">Dr. Haroon Al-Farsi (General / Family Clinic)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase font-bold text-[#635F54]">Preferred Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase font-bold text-[#635F54]">Preferred Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#08332E] hover:bg-[#062622] text-white text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-colors"
              >
                Book Appointment Slot
              </button>
            </form>

            {/* Confirmation Box */}
            {bookingCode && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-sans font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                    Appointment Successfully Booked!
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] text-emerald-700 uppercase font-semibold">Confirmation Code</span>
                    <span className="font-mono font-black text-sm text-emerald-950 block">{bookingCode}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-700 uppercase font-semibold">Scheduled Date & Time</span>
                    <span className="font-sans font-bold text-emerald-950 block">{selectedDate} at {selectedTime}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right: Medicine Schedule & dosage checklist */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Prescription Dosage Reminders */}
          <div className="bg-white border border-[#E4DFD5] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#08332E] border-b border-[#E4DFD5]/60 pb-2">
              Prescription & Dosage Reminders
            </h4>

            <div className="space-y-4">
              {reminders.map((r, i) => {
                const alertActive = !!activeAlarms[r.medName];
                return (
                  <div key={i} className="p-4 bg-[#FAF8F5] border border-[#E4DFD5] rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="block font-sans font-bold text-xs text-[#08332E]">
                          {r.medName}
                        </span>
                        <span className="block text-[10px] uppercase font-bold text-[#8C877A]">
                          Dosage: {r.dosage} · {r.frequency}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleAlarm(r.medName)}
                        className={`p-2 rounded-lg transition-all border cursor-pointer ${
                          alertActive 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-xs" 
                            : "bg-white border-[#E4DFD5] text-[#8C877A] hover:text-[#08332E]"
                        }`}
                        title={alertActive ? "Disable SMS dosage alarms" : "Enable SMS dosage alarms"}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-sans text-[11px] text-[#635F54] leading-relaxed border-t border-[#E4DFD5]/40 pt-2">
                      <strong className="text-[#1A2E26]">Indicated Purpose:</strong> {r.purpose}
                    </p>

                    {alertActive && (
                      <div className="text-[10px] text-indigo-700 font-semibold bg-indigo-50/50 p-2 rounded border border-indigo-100 flex items-center gap-1 animate-fade-in">
                        <Bell className="w-3 h-3 text-indigo-500 animate-bounce" />
                        <span>Daily SMS alert active for {r.medName}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
