import React from 'react';
import { ArrowRight, Shield, RefreshCw, CheckCheck } from 'lucide-react';
import type { DebateStanceShiftType } from '../types';

interface DebateStatusBadgeProps {
  status: DebateStanceShiftType;
  scoreBefore?: number;
  scoreAfter?: number;
}

export const DebateStatusBadge: React.FC<DebateStatusBadgeProps> = ({
  status,
  scoreBefore,
  scoreAfter,
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'STANCE SHIFTED':
        return {
          label: 'STANCE SHIFTED',
          containerClass: 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]',
          icon: RefreshCw,
          description: 'Position evolved following cross-examination',
        };
      case 'PARTIALLY SHIFTED':
        return {
          label: 'PARTIALLY SHIFTED',
          containerClass: 'bg-[#282015] text-[#C89F52] border-[#5E4720]',
          icon: CheckCheck,
          description: 'Partial concession made during debate',
        };
      case 'HELD POSITION':
      default:
        return {
          label: 'HELD POSITION',
          containerClass: 'bg-[#26201A] text-[#B8ABA0] border-[#4A3E34]',
          icon: Shield,
          description: 'Original assessment defended and maintained',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const hasScoreChange = scoreBefore !== undefined && scoreAfter !== undefined && scoreBefore !== scoreAfter;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${config.containerClass}`}
        title={config.description}
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>

      {hasScoreChange && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C1612] text-[#F3EDE2] border border-[#3A3026]">
          <span>{scoreBefore.toFixed(1)}</span>
          <ArrowRight className="w-2.5 h-2.5 text-[#DDB86C]" />
          <span className="text-[#78B88A]">{scoreAfter.toFixed(1)}</span>
        </span>
      )}
    </div>
  );
};
