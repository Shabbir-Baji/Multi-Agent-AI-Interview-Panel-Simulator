import React from 'react';
import {
  Scale,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ShieldCheck,
  ListCheck
} from 'lucide-react';
import type { ComparisonData } from '../types';

interface CandidateComparisonProps {
  comparison: ComparisonData;
  onSelectCandidate: (candidateId: string) => void;
}

export const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  comparison,
  onSelectCandidate,
}) => {
  const getBadgeClass = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]';
      case 'Hire':
        return 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]';
      case 'Lean No':
        return 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]';
      case 'No Hire':
        return 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]';
      default:
        return 'bg-[#1E1813] text-[#C4B7A5] border-[#3A3026]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Meta Synthesis */}
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
        <div className="flex items-start gap-3 mb-3.5">
          <div className="p-2 rounded bg-[#2A211A] border border-[#4A3E34] text-[#DDB86C]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[#F3EDE2] tracking-wide uppercase m-0 font-charter">
                Comparative Panel Synthesis (Candidate A vs Candidate B)
              </h2>
              {/* Priority 7: Calibration Verified Badge */}
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#1A271E] text-[#78B88A] border border-[#3A5F44] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#78B88A]" />
                Calibration Verified: Shared JD Rubric (4/4 Requirements)
              </span>
            </div>
            <p className="text-xs text-[#C4B7A5] mt-0.5 font-serif">
              Cross-candidate relative evaluation synthesized from individual committee verdicts and ground-truth evidence.
            </p>
          </div>
        </div>

        {/* Priority 7: Shared Requirements List */}
        {comparison.shared_requirements && comparison.shared_requirements.length > 0 && (
          <div className="mb-3 p-3 rounded bg-[#1E1813] border border-[#332A21] text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-[#DDB86C] block mb-1.5 flex items-center gap-1">
              <ListCheck className="w-3 h-3" />
              Shared Standardized Job Description Requirements:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] text-[#C4B7A5]">
              {comparison.shared_requirements.map((req, idx) => (
                <div key={idx} className="p-1.5 rounded bg-[#241D17] border border-[#332A21]">
                  {req}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synthesized Recommendation Callout */}
        <div className="p-4 rounded bg-[#1E1813] border border-[#332A21] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#DDB86C] uppercase tracking-wider font-charter">
              Comparative Recommendation Synthesis
            </span>
            <span className="text-[10px] text-[#8E8070] italic font-serif">
              *Read-only synthesis, strictly preserving individual single-panel verdicts
            </span>
          </div>

          <p className="text-xs text-[#F3EDE2] leading-relaxed font-serif">
            {comparison.synthesized_recommendation}
          </p>

          <div className="p-2 rounded bg-[#241D17] border border-[#3A3026] flex items-center gap-2 text-xs font-mono text-[#C4B7A5]">
            <span className="text-[10px] uppercase font-bold text-[#DDB86C] block">Primary Differentiator:</span>
            <span>{comparison.primary_differentiator}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Candidate A Card */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:border-[#524436] transition-colors">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5 pb-3 border-b border-[#332A21]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#DDB86C] block">
                  Candidate A
                </span>
                <h3 className="text-lg font-bold text-[#F3EDE2] tracking-wide font-charter">
                  {comparison.candidate_a.name}
                </h3>
                <p className="text-xs text-[#8E8070] font-serif">{comparison.candidate_a.role}</p>
              </div>

              <div className="text-right">
                <span className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${getBadgeClass(comparison.candidate_a.recommendation)}`}>
                  {comparison.candidate_a.recommendation}
                </span>
                <span className="block text-[10px] uppercase font-mono text-[#8E8070] mt-0.5">
                  {comparison.candidate_a.confidence} Confidence (Capped)
                </span>
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#78B88A] uppercase tracking-wider mb-2 font-charter">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Key Deliberation Strengths</span>
              </div>
              <div className="space-y-1.5">
                {comparison.candidate_a.top_strengths.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#1E1813] border border-[#332A21] text-xs text-[#F3EDE2]">
                    <p className="font-medium font-serif">{item.point}</p>
                    <p className="italic text-[11px] font-mono text-[#8E8070] mt-1 pl-2 border-l-2 border-[#8C7355]">
                      "{item.evidence}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E27D7D] uppercase tracking-wider mb-2 font-charter">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Primary Risk Factors</span>
              </div>
              <div className="space-y-1.5">
                {comparison.candidate_a.top_concerns.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#1E1813] border border-[#332A21] text-xs text-[#F3EDE2]">
                    <p className="font-medium font-serif">{item.point}</p>
                    <p className="italic text-[11px] font-mono text-[#E27D7D] mt-1 pl-2 border-l-2 border-[#6B3030]">
                      "{item.evidence}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectCandidate('candidate_a')}
            className="w-full mt-3 py-2 rounded bg-[#1E1813] hover:bg-[#2A211A] text-[#F3EDE2] text-xs font-serif font-medium border border-[#3A3026] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Inspect Candidate A Dossier & Deliberation</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#DDB86C]" />
          </button>
        </div>

        {/* Candidate B Card */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:border-[#524436] transition-colors">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5 pb-3 border-b border-[#332A21]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#78B88A] block">
                  Candidate B (Top Recommendation)
                </span>
                <h3 className="text-lg font-bold text-[#F3EDE2] tracking-wide font-charter">
                  {comparison.candidate_b.name}
                </h3>
                <p className="text-xs text-[#8E8070] font-serif">{comparison.candidate_b.role}</p>
              </div>

              <div className="text-right">
                <span className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${getBadgeClass(comparison.candidate_b.recommendation)}`}>
                  {comparison.candidate_b.recommendation}
                </span>
                <span className="block text-[10px] uppercase font-mono text-[#78B88A] mt-0.5">
                  {comparison.candidate_b.confidence} Confidence (Unanimous)
                </span>
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#78B88A] uppercase tracking-wider mb-2 font-charter">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Key Deliberation Strengths</span>
              </div>
              <div className="space-y-1.5">
                {comparison.candidate_b.top_strengths.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#1E1813] border border-[#3A3026] text-xs text-[#F3EDE2]">
                    <p className="font-medium font-serif">{item.point}</p>
                    <p className="italic text-[11px] font-mono text-[#78B88A] mt-1 pl-2 border-l-2 border-[#3A5F44]">
                      "{item.evidence}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#DDB86C] uppercase tracking-wider mb-2 font-charter">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Ramp-up / Framework Scope</span>
              </div>
              <div className="space-y-1.5">
                {comparison.candidate_b.top_concerns.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#1E1813] border border-[#3A3026] text-xs text-[#F3EDE2]">
                    <p className="font-medium font-serif">{item.point}</p>
                    <p className="italic text-[11px] font-mono text-[#8E8070] mt-1 pl-2 border-l-2 border-[#8C7355]">
                      "{item.evidence}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectCandidate('candidate_b')}
            className="w-full mt-3 py-2 rounded bg-[#3A2D1F] hover:bg-[#4E3D2B] text-[#F3EDE2] text-xs font-serif font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Inspect Candidate B Dossier & Deliberation</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#DDB86C]" />
          </button>
        </div>
      </div>
    </div>
  );
};
