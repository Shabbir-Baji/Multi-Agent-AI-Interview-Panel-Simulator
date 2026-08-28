import { Play, UploadCloud, Scale, UserCheck, Loader2, ShieldCheck, ScrollText } from 'lucide-react';
import type { PipelineResult } from '../types';

interface HeaderProps {
  currentCandidateId: string;
  onSelectCandidate: (id: string) => void;
  isRunningPipeline: boolean;
  onRunPipeline: () => void;
  onOpenAudit: () => void;
  isCompareMode: boolean;
  onToggleCompareMode: (compare: boolean) => void;
  candidateAData: PipelineResult | null;
  candidateBData: PipelineResult | null;
  activeMainView: 'home' | 'workspace';
  onSelectMainView: (view: 'home' | 'workspace') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCandidateId,
  onSelectCandidate,
  isRunningPipeline,
  onRunPipeline,
  onOpenAudit,
  isCompareMode,
  onToggleCompareMode,
  candidateAData,
  candidateBData,
  activeMainView,
  onSelectMainView,
}) => {
  const candidateAName = candidateAData?.profile.candidate_full_name || candidateAData?.profile.candidate_name || "Candidate A";
  const candidateBName = candidateBData?.profile.candidate_full_name || candidateBData?.profile.candidate_name || "Candidate B";
  const hasWorkspaceData = Boolean(candidateAData || candidateBData);

  return (
    <header className="sticky top-0 z-40 bg-[#1E1813] border-b border-[#3A3026] px-4 lg:px-8 py-3 shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => onSelectMainView('home')}
            className="flex items-center gap-3 cursor-pointer group"
            title="Return to Case Intake / Home"
          >
            <div className="w-8 h-8 rounded bg-[#2A211A] border border-[#4A3E34] flex items-center justify-center text-[#DDB86C] shadow-inner group-hover:border-[#7A5F28] transition-colors">
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#F3EDE2] tracking-wide flex items-center gap-2 m-0 font-charter group-hover:text-[#DDB86C] transition-colors">
                  PanelTrace
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#2A211A] text-[#DDB86C] border border-[#4A3E34]">
                    Charter Ledger
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-[#C4B7A5] font-serif">
                Deliberation Memorandum & Evidence Ground-Truth Verification
              </p>
            </div>
          </div>

          {/* Quick audit trigger on mobile */}
          {hasWorkspaceData && (
            <button
              onClick={onOpenAudit}
              className="md:hidden p-2 rounded bg-[#2A211A] text-[#78B88A] hover:bg-[#342A21] border border-[#4A3E34]"
              title="Inspect Agent Independence"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mode Selector: Case Intake vs Candidate Workspace */}
        <div className="flex items-center gap-1.5 bg-[#16110D] p-1 rounded-lg border border-[#3A3026] w-full md:w-auto overflow-x-auto">
          {/* Home / Intake Tab */}
          <button
            id="intake-home-tab"
            onClick={() => onSelectMainView('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
              activeMainView === 'home'
                ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#DDB86C]" />
            <span className="font-serif font-medium">Case Intake & Uploads</span>
          </button>

          {hasWorkspaceData && (
            <>
              <div className="h-4 w-[1px] bg-[#3A3026] mx-1"></div>

              {/* Candidate A Tab */}
              <button
                id="candidate-a-tab"
                onClick={() => {
                  onSelectMainView('workspace');
                  onToggleCompareMode(false);
                  onSelectCandidate('candidate_a');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                  activeMainView === 'workspace' && !isCompareMode && currentCandidateId === 'candidate_a'
                    ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                    : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#DDB86C]" />
                <span className="font-serif font-medium">Cand. A: {candidateAName}</span>
              </button>

              {/* Candidate B Tab (if data exists) */}
              {candidateBData && (
                <button
                  id="candidate-b-tab"
                  onClick={() => {
                    onSelectMainView('workspace');
                    onToggleCompareMode(false);
                    onSelectCandidate('candidate_b');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                    activeMainView === 'workspace' && !isCompareMode && currentCandidateId === 'candidate_b'
                      ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                      : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#78B88A]" />
                  <span className="font-serif font-medium">Cand. B: {candidateBName}</span>
                </button>
              )}

              {/* Comparative Tab (if Candidate B exists) */}
              {candidateBData && (
                <button
                  id="compare-tab"
                  onClick={() => {
                    onSelectMainView('workspace');
                    onToggleCompareMode(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                    activeMainView === 'workspace' && isCompareMode
                      ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                      : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-[#DDB86C]" />
                  <span className="font-serif font-medium">Comparative (A vs B)</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {hasWorkspaceData && (
            <button
              onClick={onOpenAudit}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-serif font-semibold bg-[#1A271E] hover:bg-[#223528] text-[#78B88A] border border-[#3A5F44] transition-colors"
              title="Inspect 10 separate API calls and isolated contexts"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Independence (10 Calls)</span>
            </button>
          )}

          {activeMainView === 'workspace' && hasWorkspaceData && (
            <button
              id="run-pipeline-btn"
              onClick={onRunPipeline}
              disabled={isRunningPipeline}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-serif font-semibold bg-[#3A2D1F] hover:bg-[#4E3D2B] text-[#F3EDE2] border border-[#6E5535] shadow-xs transition-all disabled:opacity-50"
            >
              {isRunningPipeline ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DDB86C]" />
                  <span>Deliberating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-[#DDB86C]" />
                  <span>Re-run Committee</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
