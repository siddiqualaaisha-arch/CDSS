import React from "react";
import { Activity, LogOut, ArrowLeftRight } from "lucide-react";

interface HeaderProps {
  userEmail?: string | null;
  onLogout?: () => void;
  activeViewTitle?: string;
}

export default function Header({ userEmail, onLogout, activeViewTitle }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between w-full px-6 py-4 border-b border-[#E4DFD5] bg-white gap-4">
      
      {/* Brand Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#08332E] flex items-center justify-center text-[#F3EFE0] shadow-xs">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-black text-sm tracking-tight text-[#08332E]">
              Aether Health
            </h1>
            <span className="text-[10px] bg-[#08332E]/10 text-[#08332E] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Clinical Space
            </span>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#635F54] font-medium">
            Multi-Agent Coordinator
          </p>
        </div>
      </div>

      {/* Active View Title Indicator */}
      {activeViewTitle && (
        <div className="hidden md:flex items-center gap-2 bg-[#FAF8F5] border border-[#E4DFD5] px-4 py-1.5 rounded-full text-xs font-bold text-[#08332E] uppercase tracking-wider">
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#00A254]" />
          <span>{activeViewTitle}</span>
        </div>
      )}

      {/* Live Status and User session */}
      <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
        {/* Live status pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF5EF] border border-[#CDE5D6] text-[11px] font-medium text-[#1E5631] shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
          </span>
          <span className="font-sans tracking-tight">5 agents live</span>
        </div>

        {/* User logout section */}
        {userEmail && onLogout && (
          <div className="flex items-center gap-2 border-l border-[#E4DFD5] pl-3">
            <div className="hidden sm:block text-right">
              <span className="block text-[8px] font-bold text-[#8C877A] uppercase tracking-wider leading-none">
                Authenticated As
              </span>
              <span className="text-xs font-semibold text-[#08332E] truncate max-w-[160px] block mt-0.5">
                {userEmail}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-[#8C877A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title="Sign out of system"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </header>
  );
}
