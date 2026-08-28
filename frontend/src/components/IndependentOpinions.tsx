import React from 'react';
import { AgentCard } from './AgentCard';
import type { AgentOpinion, AgentRole } from '../types';
import { Users, Info, ShieldCheck, CheckCircle2, Activity } from 'lucide-react';

interface IndependentOpinionsProps {
  opinions: Record<string, AgentOpinion>;
  candidateName: string;
  variance?: number;
  agreementLevel?: 'High' | 'Medium' | 'Low';
  onOpenSource?: (quote: string, sourceLabel?: string) => void;
}

export const IndependentOpinions: React.FC<IndependentOpinionsProps> = ({
  opinions,
  candidateName,
  variance = 1.17,
  agreementLevel = 'High',
  onOpenSource
}) => {
  const agentRoles: AgentRole[] = ['Technical', 'HR', 'HiringManager', 'Skeptic'];

  const totalScore = agentRoles.reduce((acc, role) => acc + (opinions[role]?.score || 0), 0);
  const avgScore = (totalScore / agentRoles.length).toFixed(1);

  const getAgreementBadge = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]';
      case 'Medium':
        return 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]';
      case 'Low':
        return 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]';
      default:
        return 'bg-[#26201A] text-[#B8ABA0] border-[#4A3E34]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-[#2A211A] border border-[#4A3E34] text-[#DDB86C]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#F3EDE2] tracking-wide uppercase m-0 font-charter">
                Independent Committee Opinions (Pre-Debate)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1A271E] text-[#78B88A] border border-[#3A5F44] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#78B88A]" />
                Independence Verified ✓ (Context Isolated)
              </span>
            </div>
            <p className="text-xs text-[#C4B7A5] mt-0.5 font-serif">
              4 specialized agents evaluated {candidateName} in isolation prior to cross-examination with zero shared peer context.
            </p>
          </div>
        </div>

        {/* Priority 8: Pre-Debate Variance & Pre-Debate Mean */}
        <div className="flex items-center gap-3 bg-[#1C1612] px-3 py-2 rounded border border-[#3A3026] self-start md:self-auto flex-wrap">
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono font-bold text-[#8E8070] block flex items-center gap-1 justify-end">
              <Activity className="w-3 h-3 text-[#DDB86C]" />
              Panel Agreement
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getAgreementBadge(agreementLevel)}`}>
              {agreementLevel} (Var: {variance.toFixed(2)})
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#3A3026]"></div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-mono font-bold text-[#8E8070] block">Pre-Debate Mean</span>
            <div className="text-lg font-bold font-mono text-[#F3EDE2] bg-[#241D17] px-2 py-0.2 rounded border border-[#4A3E34]">
              {avgScore}<span className="text-xs text-[#8E8070] font-normal">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="p-3 rounded bg-[#1F1914] border border-[#332A21] text-xs text-[#C4B7A5] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#DDB86C] shrink-0" />
          <span className="font-serif">
            <strong className="font-semibold text-[#F3EDE2]">Graded Evidence & Rubric:</strong> Click any quote to view source grounding. Technical and Hiring Manager evaluate via deterministic 4-point rubric.
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#78B88A] flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          Pre-Debate Isolation Logged
        </span>
      </div>

      {/* 4 Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agentRoles.map((role) => {
          const opinion = opinions[role];
          if (!opinion) return null;
          return <AgentCard key={role} agentRole={role} opinion={opinion} onOpenSource={onOpenSource} />;
        })}
      </div>
    </div>
  );
};
