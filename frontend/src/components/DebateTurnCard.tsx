import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Quote,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Sparkles
} from 'lucide-react';
import type { DebateTurn, ReactionType } from '../types';
import { DebateStatusBadge } from './DebateStatusBadge';

interface DebateTurnCardProps {
  turn: DebateTurn;
  turnIndex: number;
  onOpenSource?: (quote: string, sourceLabel?: string) => void;
}

export const DebateTurnCard: React.FC<DebateTurnCardProps> = ({ turn, turnIndex, onOpenSource }) => {
  const [showDetails, setShowDetails] = useState(true);

  const getReactionBadge = (reaction: ReactionType) => {
    switch (reaction) {
      case 'agree':
        return {
          label: 'Agrees',
          color: 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]',
          icon: CheckCircle2
        };
      case 'disagree':
        return {
          label: 'Challenges / Disagrees',
          color: 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]',
          icon: XCircle
        };
      case 'partially_agree':
        return {
          label: 'Partially Concedes',
          color: 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]',
          icon: AlertCircle
        };
    }
  };

  const reactionMeta = getReactionBadge(turn.reaction);
  const ReactionIcon = reactionMeta.icon;

  return (
    <div className={`rounded-xl border transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.25)] overflow-hidden ${
      turn.stance_shift_type === 'STANCE SHIFTED'
        ? 'bg-[#241D17] border-[#7A5F28]'
        : turn.stance_shift_type === 'PARTIALLY SHIFTED'
        ? 'bg-[#241D17] border-[#5E4720]'
        : 'bg-[#241D17] border-[#3A3026] hover:border-[#524436]'
    }`}>
      {/* Header Bar */}
      <div className="px-4 py-3 bg-[#1E1813] border-b border-[#332A21] flex flex-wrap items-center justify-between gap-3">
        {/* Turn Number & Speaker Interaction */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#2A211A] text-[#F3EDE2] border border-[#4A3E34]">
            Turn {turnIndex + 1}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-[#8E8070] bg-[#1A140F] border border-[#332A21]">
            Round {turn.round}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {/* Speaker */}
            <span className="px-2 py-0.5 rounded bg-[#2A211A] text-[#F3EDE2] border border-[#4A3E34] font-mono">
              {turn.agent}
            </span>

            {/* Reaction badge */}
            <span className={`px-2 py-0.5 rounded border text-[11px] flex items-center gap-1 font-mono uppercase ${reactionMeta.color}`}>
              <ReactionIcon className="w-3 h-3" />
              {reactionMeta.label}
            </span>

            <span className="text-[#8E8070] text-xs">➔</span>

            {/* Target Agent */}
            <span className="px-2 py-0.5 rounded bg-[#1A140F] text-[#C4B7A5] border border-[#332A21] font-mono">
              {turn.target_agent}
            </span>
          </div>
        </div>

        {/* Standardized 3-State Badge */}
        <div className="flex items-center gap-2">
          <DebateStatusBadge
            status={turn.stance_shift_type}
            scoreBefore={turn.opinion_before.score}
            scoreAfter={turn.opinion_after.score}
          />

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 rounded text-[#8E8070] hover:text-[#F3EDE2] hover:bg-[#332A21]"
            title={showDetails ? "Collapse Details" : "Expand Details"}
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Turn Body */}
      {showDetails && (
        <div className="p-4 space-y-3.5">
          {/* Challenged / Responded Point Quoted from Target Agent */}
          <div className="p-3 rounded bg-[#1A140F] border border-[#332A21]">
            <div className="text-[10px] uppercase font-bold text-[#8E8070] mb-1 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1">
                <Quote className="w-3 h-3 text-[#8C7355]" />
                Claim Addressed from {turn.target_agent}:
              </span>
              {onOpenSource && (
                <button
                  onClick={() => onOpenSource(turn.target_point_quote || turn.claim_being_addressed, `${turn.target_agent} Point`)}
                  className="flex items-center gap-1 text-[10px] font-mono text-[#DDB86C] hover:text-[#F3EDE2] underline"
                >
                  <FileSearch className="w-3 h-3" />
                  <span>Verify in Document</span>
                </button>
              )}
            </div>
            <p className="text-xs italic text-[#F3EDE2] font-mono pl-2 border-l-2 border-[#8C7355]">
              "{turn.claim_being_addressed || turn.target_point_quote}"
            </p>
          </div>

          {/* Priority 3: Steelman Protocol (Charitable restatement before rebuttal) */}
          {turn.steelman && (
            <div className="p-3 rounded bg-[#2A2114] border border-[#7A5F28] text-xs text-[#DDB86C]">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#DDB86C] mb-1">
                <Sparkles className="w-3 h-3 text-[#DDB86C]" />
                Steelmanned Position (Charitable Interpretation):
              </div>
              <p className="italic font-serif text-[#F3EDE2] text-xs leading-relaxed pl-2 border-l-2 border-[#DDB86C]">
                "{turn.steelman}"
              </p>
            </div>
          )}

          {/* Evidence Reviewed or Counter-Evidence (Deduplicated & Clean) */}
          {(() => {
            const uniqueEvidence: string[] = [];
            if (turn.counter_evidence && turn.counter_evidence.trim()) {
              uniqueEvidence.push(turn.counter_evidence.trim());
            }
            if (turn.saw && Array.isArray(turn.saw)) {
              for (const item of turn.saw) {
                if (item && item.trim()) {
                  const trimmed = item.trim();
                  const isDupe = uniqueEvidence.some(
                    existing => existing === trimmed || existing.startsWith(trimmed) || trimmed.startsWith(existing)
                  );
                  if (!isDupe) {
                    uniqueEvidence.push(trimmed);
                  }
                }
              }
            }

            if (uniqueEvidence.length === 0) return null;

            return (
              <div>
                <div className="text-[10px] uppercase font-bold text-[#8E8070] mb-1 flex items-center gap-1 font-mono">
                  <Eye className="w-3 h-3 text-[#8C7355]" />
                  Cross-Examined Ground Truth & Counter-Evidence:
                </div>
                <div className="space-y-1">
                  {uniqueEvidence.map((evidenceText, idx) => (
                    <div
                      key={idx}
                      onClick={() => onOpenSource && onOpenSource(evidenceText, "Cross-Examined Evidence")}
                      className={`quote-box ${onOpenSource ? 'cursor-pointer hover:border-[#DDB86C] transition-colors' : ''}`}
                      title={onOpenSource ? "Click to view in source document" : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <p className="italic text-xs font-mono text-[#F3EDE2]">{evidenceText}</p>
                        {onOpenSource && <FileSearch className="w-3 h-3 text-[#8E8070] shrink-0 ml-2" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Deliberation Reasoning */}
          <div>
            <div className="text-[10px] uppercase font-bold text-[#8E8070] mb-1 font-mono">
              Member Rebuttal & Reasoning:
            </div>
            <p className="text-xs text-[#F3EDE2] leading-relaxed bg-[#1E1813] p-3 rounded border border-[#332A21] font-serif">
              {turn.reasoning}
            </p>
          </div>

          {/* Stance Evolution Callout */}
          {turn.changed && turn.change_reason && (
            <div className="p-3 rounded bg-[#1A271E] border border-[#3A5F44] text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#78B88A] uppercase text-[10px] tracking-wider font-mono">Score & Stance Evolution</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#241D17] text-[#78B88A] border border-[#3A5F44]">
                  {turn.opinion_before.score} ➔ {turn.opinion_after.score}
                </span>
              </div>
              <div className="text-xs text-[#C4B7A5] font-mono mb-1">
                <span className="text-[#8E8070]">Before:</span> "{turn.opinion_before.stance}"
                <span className="text-[#78B88A] mx-1.5">➔</span>
                <span className="text-[#F3EDE2] font-semibold">After:</span> "{turn.opinion_after.stance}"
              </div>
              <p className="text-xs text-[#78B88A] font-serif font-medium">
                {turn.change_reason}
              </p>
            </div>
          )}

          {/* Explicit Held Position Callout */}
          {!turn.changed && turn.change_reason && (
            <div className="p-2.5 rounded bg-[#1E1813] border border-[#332A21] text-xs text-[#C4B7A5]">
              <span className="font-semibold text-[#F3EDE2] block mb-0.5 font-serif">Position Maintained:</span>
              <span className="font-mono text-[11px]">{turn.change_reason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
