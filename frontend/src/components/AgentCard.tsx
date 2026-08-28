import React from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Clock,
  Quote,
  FileSearch,
  Info,
  Award
} from 'lucide-react';
import type { AgentOpinion, AgentRole, ConfidenceLevel, EvidenceStrength } from '../types';

interface AgentCardProps {
  agentRole: AgentRole;
  opinion: AgentOpinion;
  onOpenSource?: (quote: string, sourceLabel?: string) => void;
}

export const EvidenceStrengthBadge: React.FC<{ strength?: EvidenceStrength }> = ({ strength }) => {
  if (!strength) return null;

  switch (strength) {
    case 'direct_statement':
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#1A271E] text-[#78B88A] border border-[#3A5F44]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#78B88A]"></span>
          Direct Statement
        </span>
      );
    case 'inferred':
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#2C2314] text-[#DDB86C] border border-[#7A5F28]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DDB86C]"></span>
          Inferred
        </span>
      );
    case 'single_data_point':
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#26201A] text-[#B8ABA0] border border-[#4A3E34]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8ABA0]"></span>
          Single Data Point
        </span>
      );
    case 'contradicted_elsewhere':
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#2C1818] text-[#E27D7D] border border-[#6B3030]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E27D7D]"></span>
          Contradicted Elsewhere
        </span>
      );
    default:
      return null;
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agentRole, opinion, onOpenSource }) => {
  const getAgentRoleMeta = (role: AgentRole) => {
    switch (role) {
      case 'Technical':
        return {
          title: 'Technical Architect',
          domain: 'Architecture, Systems Rigor & Concurrency',
          badgeColor: 'bg-[#2A211A] text-[#D4C8B8] border-[#4A3E34]',
        };
      case 'HR':
        return {
          title: 'HR & Culture Lead',
          domain: 'Team Alignment, Empathy & Retention',
          badgeColor: 'bg-[#2A211A] text-[#D4C8B8] border-[#4A3E34]',
        };
      case 'HiringManager':
        return {
          title: 'Hiring Manager',
          domain: 'Delivery Speed, Ownership & Ramp-up ROI',
          badgeColor: 'bg-[#2A211A] text-[#D4C8B8] border-[#4A3E34]',
        };
      case 'Skeptic':
        return {
          title: "Devil's Advocate / Skeptic",
          domain: 'Discrepancy Detection & Claim Auditing',
          badgeColor: 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]',
        };
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8.0) return 'text-[#78B88A] bg-[#1A271E] border-[#3A5F44]';
    if (score >= 6.0) return 'text-[#DDB86C] bg-[#2C2314] border-[#7A5F28]';
    if (score >= 5.0) return 'text-[#C89F52] bg-[#282015] border-[#5E4720]';
    return 'text-[#E27D7D] bg-[#2C1818] border-[#6B3030]';
  };

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'high':
        return 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]';
      case 'medium':
        return 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]';
      case 'low':
        return 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]';
    }
  };

  const meta = getAgentRoleMeta(agentRole);

  return (
    <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:border-[#524436] transition-colors">
      <div>
        {/* Agent Header */}
        <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-[#332A21]">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-[#F3EDE2] tracking-wide m-0 font-charter">
                {meta.title}
              </h3>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${meta.badgeColor}`}>
                {agentRole} Member
              </span>
            </div>
            <p className="text-xs text-[#C4B7A5] font-serif">{meta.domain}</p>

            {/* Execution timestamp & isolated prompt mark */}
            <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8E8070] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Invoked: {opinion.invoked_at || "10:45:02.110 UTC"}
              </span>
              <span>•</span>
              <span className="text-[#78B88A]">Isolated Run #{opinion.execution_order || 1}</span>
            </div>
          </div>

          {/* Independent Score & Confidence Stamp */}
          <div className="text-right shrink-0">
            <div className={`text-xl font-bold font-mono px-2.5 py-0.5 rounded border ${getScoreBadge(opinion.score)}`}>
              {opinion.score.toFixed(1)}
              <span className="text-xs font-normal opacity-75">/10</span>
            </div>
            <span className={`inline-block text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.2 rounded border mt-1 ${getConfidenceBadge(opinion.confidence)}`}>
              {opinion.confidence} Confidence
            </span>
          </div>
        </div>

        {/* Priority 4: Boundary Self-Consistency Badge if evaluated */}
        {opinion.consistency_note && (
          <div className="mb-3 p-2 rounded bg-[#2C2314] border border-[#7A5F28] text-[11px] font-mono text-[#DDB86C] flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{opinion.consistency_note}</span>
          </div>
        )}

        {/* Evaluation Summary */}
        <div className="mb-3.5 p-2.5 rounded bg-[#1C1612] border border-[#332A21] text-xs text-[#D4C8B8] flex items-start gap-2">
          <Quote className="w-3 h-3 text-[#8C7355] shrink-0 mt-0.5" />
          <div className="leading-relaxed whitespace-pre-line font-serif space-y-1 w-full">
            {opinion.summary.split('\n').map((line, lIdx) => (
              <div key={lIdx} className={line.startsWith('- ') ? "pl-1.5 font-mono text-[11px] text-[#F3EDE2]" : ""}>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Priority 5: Per-Requirement Rubric Breakdown (for Technical & Hiring Manager) */}
        {opinion.requirement_breakdown && opinion.requirement_breakdown.length > 0 && (
          <div className="mb-3.5 p-2.5 rounded bg-[#1E1813] border border-[#3A3026] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-[#C4B7A5]">
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-[#DDB86C]" />
                Standardized Requirement Checklist (Rubric)
              </span>
              <span className="text-[#8E8070]">4-Point Graded</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {opinion.requirement_breakdown.map((req, rIdx) => {
                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'met':
                      return { label: 'MET (+2.5)', style: 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]' };
                    case 'partially_met':
                      return { label: 'PARTIAL (+1.25)', style: 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]' };
                    case 'not_addressed':
                      return { label: 'NOT ADDRESSED (0.0)', style: 'bg-[#26201A] text-[#B8ABA0] border-[#4A3E34]' };
                    case 'contradicted':
                      return { label: 'CONTRADICTED (-1.0)', style: 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]' };
                    default:
                      return { label: status, style: 'bg-[#26201A] text-[#B8ABA0] border-[#4A3E34]' };
                  }
                };
                const badge = getStatusBadge(req.status);

                return (
                  <div key={rIdx} className="p-1.5 rounded bg-[#241D17] border border-[#332A21] flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#F3EDE2]">{req.requirement}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E8070] italic">{req.evidence}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths List with Graded Evidence Badges */}
        <div className="space-y-2 mb-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#78B88A] uppercase tracking-wider font-charter">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Identified Strengths ({opinion.strengths.length})</span>
          </div>

          {opinion.strengths.map((s, idx) => (
            <div key={idx} className="p-2.5 rounded bg-[#1F1914] border border-[#332A21] space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-[#F3EDE2] leading-snug font-serif">{s.point}</p>
                <EvidenceStrengthBadge strength={s.evidence_strength} />
              </div>

              {s.strength_justification && (
                <p className="text-[10px] text-[#8E8070] font-mono italic">
                  Justification: {s.strength_justification}
                </p>
              )}

              <div
                onClick={() => onOpenSource && onOpenSource(s.evidence, `${meta.title} Strength Evidence`)}
                className={`quote-box quote-box-emerald ${onOpenSource ? 'cursor-pointer hover:border-[#78B88A] transition-colors' : ''}`}
                title={onOpenSource ? "Click to view grounded in source transcript/resume" : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-[#78B88A] block mb-0.5">
                    Ground Truth Evidence (Click to verify)
                  </span>
                  {onOpenSource && (
                    <span className="text-[9px] font-mono text-[#78B88A] flex items-center gap-1">
                      <FileSearch className="w-2.5 h-2.5" /> View source
                    </span>
                  )}
                </div>
                <p className="italic text-xs font-mono">"{s.evidence}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Concerns List with Graded Evidence Badges */}
        <div className="space-y-2 mb-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E27D7D] uppercase tracking-wider font-charter">
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Identified Concerns & Risks ({opinion.concerns.length})</span>
          </div>

          {opinion.concerns.length === 0 ? (
            <p className="text-xs text-[#8E8070] italic font-serif">No material concerns flagged.</p>
          ) : (
            opinion.concerns.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#1F1914] border border-[#332A21] space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-[#F3EDE2] leading-snug font-serif">{c.point}</p>
                  <EvidenceStrengthBadge strength={c.evidence_strength} />
                </div>

                {c.strength_justification && (
                  <p className="text-[10px] text-[#8E8070] font-mono italic">
                    Justification: {c.strength_justification}
                  </p>
                )}

                <div
                  onClick={() => onOpenSource && onOpenSource(c.evidence, `${meta.title} Concern Evidence`)}
                  className={`quote-box quote-box-rose ${onOpenSource ? 'cursor-pointer hover:border-[#E27D7D] transition-colors' : ''}`}
                  title={onOpenSource ? "Click to view grounded in source transcript/resume" : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-[#E27D7D] block mb-0.5">
                      Ground Truth Evidence (Click to verify)
                    </span>
                    {onOpenSource && (
                      <span className="text-[9px] font-mono text-[#E27D7D] flex items-center gap-1">
                        <FileSearch className="w-2.5 h-2.5" /> View source
                      </span>
                    )}
                  </div>
                  <p className="italic text-xs font-mono">"{c.evidence}"</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Unknowns / Missing Info */}
        {opinion.unknowns.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#332A21]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E8070] uppercase tracking-wider font-charter">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Unverified Unknowns</span>
            </div>
            <ul className="list-disc list-inside text-xs text-[#C4B7A5] space-y-0.5 font-serif">
              {opinion.unknowns.map((u, idx) => (
                <li key={idx} className="leading-snug">{u}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
