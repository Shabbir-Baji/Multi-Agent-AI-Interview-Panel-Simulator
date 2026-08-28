import React from 'react';
import { CheckCircle2, CircleDashed, Loader2, Cpu, FileText, UserCheck, MessageSquareQuote, Award } from 'lucide-react';
import type { PipelineStageEvent } from '../types';

interface PipelineTrackerProps {
  currentStage: PipelineStageEvent | null;
  isRunning: boolean;
  onJumpToStage?: (stageNumber: number) => void;
}

const STAGES = [
  { id: 1, name: "Extracting documents", icon: FileText, desc: "PDF Transcript & Resume" },
  { id: 2, name: "Building candidate profile", icon: UserCheck, desc: "Skills, Claims & Facts" },
  { id: 3, name: "Agents forming independent opinions (4/4)", icon: Cpu, desc: "4 Member Scoring" },
  { id: 4, name: "Panel debate in progress", icon: MessageSquareQuote, desc: "Cross-Examination" },
  { id: 5, name: "Chair reaching final decision", icon: Award, desc: "Weighing Logic" },
  { id: 6, name: "Done", icon: CheckCircle2, desc: "Dossier Complete" }
];

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  currentStage,
  isRunning,
}) => {
  const activeStageNum = currentStage ? currentStage.stage : 6;
  const progressPercent = currentStage ? currentStage.progress : 100;

  return (
    <section aria-label="Pipeline Deliberation Stages" className="bg-[#241D17] border border-[#3A3026] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#DDB86C]" />
          <h2 className="text-xs font-bold text-[#F3EDE2] uppercase tracking-wider m-0 font-charter">
            Deliberation Procedure Ledger
            <span className="text-[#8E8070] normal-case font-serif font-normal ml-2">
              (Stage {activeStageNum} of 6)
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#C4B7A5]">
            {isRunning ? STAGES[activeStageNum - 1]?.name : "All 6 Pipeline Stages Executed"}
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#2C2314] text-[#DDB86C] border border-[#7A5F28]">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-[#18120D] rounded-full h-1.5 mb-3.5 overflow-hidden border border-[#3A3026]">
        <div
          className="h-full bg-[#DDB86C] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 6 Named Stages Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {STAGES.map((s) => {
          const isCompleted = activeStageNum > s.id || (!isRunning && activeStageNum === 6);
          const isCurrent = isRunning && activeStageNum === s.id;
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded border text-left transition-colors ${
                isCompleted
                  ? 'bg-[#1A271E] border-[#3A5F44] text-[#78B88A]'
                  : isCurrent
                  ? 'bg-[#2C2314] border-[#7A5F28] text-[#DDB86C]'
                  : 'bg-[#1E1813] border-[#332A21] text-[#8E8070]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
                  <span className="opacity-75">0{s.id}.</span>
                  <Icon className="w-3.5 h-3.5 opacity-75" />
                </div>
                <div>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#78B88A]" />}
                  {isCurrent && <Loader2 className="w-3.5 h-3.5 text-[#DDB86C] animate-spin" />}
                  {!isCompleted && !isCurrent && <CircleDashed className="w-3.5 h-3.5 text-[#5A4B3D]" />}
                </div>
              </div>
              <div className="text-[11px] font-semibold leading-tight line-clamp-1 font-serif">
                {s.name}
              </div>
              <div className="text-[10px] opacity-80 line-clamp-1 mt-0.5 font-mono">
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
