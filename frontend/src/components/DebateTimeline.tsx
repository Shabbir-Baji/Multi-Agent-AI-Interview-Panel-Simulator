import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Filter
} from 'lucide-react';
import type { DebateTurn } from '../types';
import { DebateTurnCard } from './DebateTurnCard';

interface DebateTimelineProps {
  debateLog: DebateTurn[];
  candidateName?: string;
  onOpenSource?: (quote: string, sourceLabel?: string) => void;
}

export const DebateTimeline: React.FC<DebateTimelineProps> = ({
  debateLog,
  onOpenSource,
}) => {
  const [filterStance, setFilterStance] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');

  // Compute metrics
  const totalTurns = debateLog.length;
  const shiftedTurns = debateLog.filter((t) => t.stance_shift_type === 'STANCE SHIFTED').length;
  const partialTurns = debateLog.filter((t) => t.stance_shift_type === 'PARTIALLY SHIFTED').length;
  const heldTurns = debateLog.filter((t) => t.stance_shift_type === 'HELD POSITION').length;

  const filteredTurns = debateLog.filter((t) => {
    if (filterStance !== 'all' && t.stance_shift_type !== filterStance) return false;
    if (filterAgent !== 'all' && t.agent !== filterAgent && t.target_agent !== filterAgent) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Protocol Banner */}
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded bg-[#2A211A] border border-[#4A3E34] text-[#DDB86C]">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#F3EDE2] tracking-wide uppercase m-0 font-charter">
                  Committee Deliberation & Cross-Examination
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#2A211A] text-[#DDB86C] border border-[#4A3E34]">
                  Steelman Rebuttal Protocol
                </span>
              </div>
              <p className="text-xs text-[#C4B7A5] mt-0.5 font-serif">
                Agents cross-examine opposing viewpoints, cite counter-evidence, and update scores or defend positions in real-time.
              </p>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <div className="px-3 py-1.5 rounded bg-[#2C2314] border border-[#7A5F28] text-xs font-mono">
              <span className="text-[#DDB86C] font-bold">{shiftedTurns}</span>
              <span className="text-[#8E8070] ml-1.5 uppercase text-[10px]">Shifted</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-[#282015] border border-[#5E4720] text-xs font-mono">
              <span className="text-[#C89F52] font-bold">{partialTurns}</span>
              <span className="text-[#8E8070] ml-1.5 uppercase text-[10px]">Partial</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-[#26201A] border border-[#4A3E34] text-xs font-mono">
              <span className="text-[#B8ABA0] font-bold">{heldTurns}</span>
              <span className="text-[#8E8070] ml-1.5 uppercase text-[10px]">Held</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-[#332A21] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8E8070] font-mono flex items-center gap-1 uppercase text-[10px] font-bold">
              <Filter className="w-3 h-3" />
              Filter Stance:
            </span>

            <button
              onClick={() => setFilterStance('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterStance === 'all'
                  ? 'bg-[#F3EDE2] text-[#1A140F] font-bold font-mono'
                  : 'bg-[#241D17] text-[#C4B7A5] border border-[#3A3026] hover:bg-[#2F241C]'
              }`}
            >
              All Turns ({totalTurns})
            </button>

            <button
              onClick={() => setFilterStance('STANCE SHIFTED')}
              className={`px-2.5 py-1 rounded text-xs transition-colors font-mono ${
                filterStance === 'STANCE SHIFTED'
                  ? 'bg-[#DDB86C] text-[#1A140F] font-bold'
                  : 'bg-[#241D17] text-[#DDB86C] border border-[#7A5F28] hover:bg-[#2C2314]'
              }`}
            >
              Shifted ({shiftedTurns})
            </button>

            <button
              onClick={() => setFilterStance('PARTIALLY SHIFTED')}
              className={`px-2.5 py-1 rounded text-xs transition-colors font-mono ${
                filterStance === 'PARTIALLY SHIFTED'
                  ? 'bg-[#C89F52] text-[#1A140F] font-bold'
                  : 'bg-[#241D17] text-[#C89F52] border border-[#5E4720] hover:bg-[#282015]'
              }`}
            >
              Partial ({partialTurns})
            </button>

            <button
              onClick={() => setFilterStance('HELD POSITION')}
              className={`px-2.5 py-1 rounded text-xs transition-colors font-mono ${
                filterStance === 'HELD POSITION'
                  ? 'bg-[#B8ABA0] text-[#1A140F] font-bold'
                  : 'bg-[#241D17] text-[#B8ABA0] border border-[#4A3E34] hover:bg-[#26201A]'
              }`}
            >
              Held ({heldTurns})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8E8070] font-mono uppercase text-[10px] font-bold">Agent:</span>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-[#1C1612] border border-[#3A3026] text-[#F3EDE2] text-xs rounded px-2.5 py-1 font-mono focus:outline-none focus:border-[#DDB86C]"
            >
              <option value="all">All Agents</option>
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="HiringManager">Hiring Manager</option>
              <option value="Skeptic">Skeptic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliberation Turns List */}
      <div className="space-y-3">
        {filteredTurns.length === 0 ? (
          <div className="p-8 text-center bg-[#241D17] rounded-xl border border-[#3A3026] text-xs text-[#8E8070] font-serif">
            No deliberation turns match the selected filter.
          </div>
        ) : (
          filteredTurns.map((turn, idx) => (
            <DebateTurnCard
              key={idx}
              turn={turn}
              turnIndex={idx}
              onOpenSource={onOpenSource}
            />
          ))
        )}
      </div>
    </div>
  );
};
